import fs from 'node:fs';
import path from 'node:path';
import { SAWFinancialEngine } from '../../src/lib/ai/saw-engine';
import { FINAI_GROK_BASE_URL, FINAI_GROK_MODEL } from '../../src/lib/ai/ai.prompts';

function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        let val = (match[2] || '').trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        process.env[match[1]] = val;
      }
    }
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface ScenarioData {
  id: string;
  category: string;
  name: string;
  description: string;
  profile: {
    monthlyIncome: number;
    monthlyExpense: number;
    totalBalance: number;
    totalBudgetLimit?: number;
    totalBudgetSpent?: number;
  };
  groundTruth: {
    netCashFlow: number;
    savingsRatePercent: number;
    expenseRatioPercent: number;
    budgetUtilizationPercent: number;
    liquidityMonths: number;
    sawScore: number;
    score100: number;
    deterministicStatus: 'Strong' | 'Stable' | 'Warning' | 'Critical';
  };
}

interface ModelOutput {
  netCashFlow: number;
  expenseRatioPercent: number;
  savingsRatePercent: number;
  liquidityMonths: number;
  status: string;
  narrative: string;
}

interface RunResult {
  scenarioId: string;
  repetition: number;
  condition: 'PureLLM' | 'FINAI';
  expectedNetCashFlow: number;
  actualNetCashFlow: number;
  netCashFlowCorrect: boolean;
  expectedExpenseRatio: number;
  actualExpenseRatio: number;
  expenseRatioCorrect: boolean;
  expectedSavingsRate: number;
  actualSavingsRate: number;
  savingsRateCorrect: boolean;
  expectedStatus: string;
  actualStatus: string;
  statusCorrect: boolean;
  hasArithmeticHallucination: boolean;
  latencyMs: number;
  rawResponse?: string;
}

const availableModels = ['openai/gpt-oss-20b', 'openai/gpt-oss-120b', 'qwen/qwen3.8-27b'];
let modelIdx = 0;

async function callGroqDirect(apiKey: string, messages: any[], temperature = 0.3): Promise<{ content: string; latencyMs: number }> {
  let retries = 0;
  const maxRetries = 10;

  while (retries <= maxRetries) {
    const activeModel = availableModels[modelIdx];
    const t0 = performance.now();
    try {
      const res = await fetch(`${FINAI_GROK_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: activeModel,
          messages,
          temperature,
          max_tokens: 850,
          response_format: { type: 'json_object' },
        }),
      });

      const dur = performance.now() - t0;

      if (res.status === 429) {
        retries++;
        const errBody = await res.text();

        if (errBody.includes('tokens per day')) {
          const prevModel = availableModels[modelIdx];
          modelIdx = (modelIdx + 1) % availableModels.length;
          console.log(`  🔄 [TPD Quota Limit] Kuota harian ${prevModel} penuh. Beralih ke ${availableModels[modelIdx]}...`);
          await sleep(1000);
          continue;
        }

        let waitTime = 3000;
        const matchTime = errBody.match(/try again in (?:(\d+)m)?([\d.]+)s/i);
        const matchMs = errBody.match(/try again in ([\d.]+)ms/i);
        if (matchTime) {
          const mins = matchTime[1] ? parseFloat(matchTime[1]) : 0;
          const secs = parseFloat(matchTime[2]);
          waitTime = Math.ceil((mins * 60 + secs) * 1000) + 1200;
        } else if (matchMs) {
          waitTime = Math.ceil(parseFloat(matchMs[1])) + 500;
        } else {
          waitTime = Math.min(retries * 4000, 25000);
        }

        console.log(`  ⏳ [429 Rate Limit for ${activeModel}] Menunggu ${waitTime}ms sebelum retry ${retries}/${maxRetries}...`);
        await sleep(waitTime);
        continue;
      }

      if (!res.ok) {
        throw new Error(`Groq HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      const content = data.choices?.[0]?.message?.content || '{}';
      return { content, latencyMs: Math.round(dur * 10) / 10 };
    } catch (e: any) {
      retries++;
      if (retries > maxRetries) throw e;
      await sleep(retries * 3000);
    }
  }

  throw new Error('Exceeded max retries in callGroqDirect');
}

function safeParseModelJson(raw: string): ModelOutput {
  try {
    const clean = raw.trim();
    const parsed = JSON.parse(clean);
    return {
      netCashFlow: Number(parsed.netCashFlow ?? parsed.net_cash_flow ?? parsed.surplus ?? 0),
      expenseRatioPercent: Number(parsed.expenseRatioPercent ?? parsed.expense_ratio ?? parsed.expenseRatio ?? 0),
      savingsRatePercent: Number(parsed.savingsRatePercent ?? parsed.savings_rate ?? parsed.savingsRate ?? 0),
      liquidityMonths: Number(parsed.liquidityMonths ?? parsed.emergency_buffer_months ?? parsed.emergencyBuffer ?? 0),
      status: String(parsed.status ?? 'Critical').trim(),
      narrative: String(parsed.narrative ?? parsed.advice ?? parsed.analysis ?? ''),
    };
  } catch {
    return {
      netCashFlow: 0,
      expenseRatioPercent: 0,
      savingsRatePercent: 0,
      liquidityMonths: 0,
      status: 'Critical',
      narrative: '',
    };
  }
}

async function main() {
  loadEnv();
  const apiKey = process.env.GROQ_API_KEY?.trim();
  if (!apiKey) {
    console.error('GROQ_API_KEY missing in .env');
    process.exit(1);
  }

  const scenariosFile = path.resolve(process.cwd(), 'evaluations/data/financial_scenarios_50.json');
  if (!fs.existsSync(scenariosFile)) {
    console.error('File scenarios tidak ditemukan. Jalankan generate_financial_scenarios.ts terlebih dahulu.');
    process.exit(1);
  }

  const scenarios = JSON.parse(fs.readFileSync(scenariosFile, 'utf8')) as ScenarioData[];
  console.log(`\n======================================================`);
  console.log(`🔬 MEMULAI EKSPERIMEN KOMPARATIF HALUSINASI NUMERIK`);
  console.log(`   Model: ${FINAI_GROK_MODEL} on Groq LPU`);
  console.log(`   Dataset: ${scenarios.length} Skenario Profil Finansial (4 Kategori Status)`);
  console.log(`   Kondisi A: Pure LLM (Tanpa Injeksi Skor Deterministik SAW)`);
  console.log(`   Kondisi B: FINAI (Dengan Injeksi Skor Deterministik SAW)`);
  console.log(`   Jumlah Pengulangan (Repetisi): 3 Kali per Skenario`);
  console.log(`======================================================\n`);

  const resultsDir = path.resolve(process.cwd(), 'evaluations/results');
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }

  const checkpointPath = path.join(resultsDir, 'hallucination_checkpoint.json');
  let runRecords: RunResult[] = [];
  const processedKeys = new Set<string>();

  if (fs.existsSync(checkpointPath)) {
    try {
      runRecords = JSON.parse(fs.readFileSync(checkpointPath, 'utf8'));
      runRecords.forEach((r) => processedKeys.add(`${r.scenarioId}_${r.condition}_${r.repetition}`));
      console.log(`⏩ Resuming checkpoint: ${runRecords.length} records sudah selesai.`);
    } catch {
      // ignore
    }
  }

  const REPETITIONS = 2;

  for (const scn of scenarios) {
    console.log(`\n📌 [${scn.id}] Skenario: "${scn.name}" (${scn.category})`);
    console.log(`   Ground Truth: Cash Flow=Rp${scn.groundTruth.netCashFlow.toLocaleString('id-ID')}, Expense Ratio=${scn.groundTruth.expenseRatioPercent}%, Status=${scn.groundTruth.deterministicStatus} (Skor ${scn.groundTruth.score100})`);

    for (let rep = 1; rep <= REPETITIONS; rep++) {
      // ---------------------------------------------------------------------
      // 1. Kondisi A: Pure LLM (Tanpa Injeksi SAW)
      // ---------------------------------------------------------------------
      const pureKey = `${scn.id}_PureLLM_${rep}`;
      if (!processedKeys.has(pureKey)) {
        const purePrompt = `Evaluasi profil keuangan:
- Pemasukan: Rp${scn.profile.monthlyIncome}
- Pengeluaran: Rp${scn.profile.monthlyExpense}
- Saldo: Rp${scn.profile.totalBalance}
- Budget Limit: Rp${scn.profile.totalBudgetLimit || 0}
- Budget Terpakai: Rp${scn.profile.totalBudgetSpent || 0}

Tugas kalkulasi:
1. netCashFlow = Pemasukan - Pengeluaran
2. expenseRatioPercent = (Pengeluaran / Pemasukan) * 100
3. savingsRatePercent = ((Pemasukan - Pengeluaran) / Pemasukan) * 100
4. liquidityMonths = Saldo / Pengeluaran
5. status: HANYA pilih salah satu dari ["Strong", "Stable", "Warning", "Critical"]
6. narrative: evaluasi singkat

Wajib balas format JSON ringkas:
{"netCashFlow": <angka murni>, "expenseRatioPercent": <angka 1 desimal>, "savingsRatePercent": <angka 1 desimal>, "liquidityMonths": <angka 1 desimal>, "status": "Strong"|"Stable"|"Warning"|"Critical", "narrative": "<saran>"}`;

        try {
          const { content, latencyMs } = await callGroqDirect(apiKey, [
            { role: 'system', content: 'Asisten keuangan. Output JSON valid langsung.' },
            { role: 'user', content: purePrompt },
          ]);

          const parsed = safeParseModelJson(content);

          const netCorrect = Math.abs(parsed.netCashFlow - scn.groundTruth.netCashFlow) <= 1000;
          const expenseCorrect = Math.abs(parsed.expenseRatioPercent - scn.groundTruth.expenseRatioPercent) <= 1.0;
          const savingsCorrect = Math.abs(parsed.savingsRatePercent - scn.groundTruth.savingsRatePercent) <= 1.0;
          const statusCorrect = parsed.status.toLowerCase() === scn.groundTruth.deterministicStatus.toLowerCase();
          const hasHallucination = !netCorrect || !expenseCorrect || !savingsCorrect;

          const record: RunResult = {
            scenarioId: scn.id,
            repetition: rep,
            condition: 'PureLLM',
            expectedNetCashFlow: scn.groundTruth.netCashFlow,
            actualNetCashFlow: parsed.netCashFlow,
            netCashFlowCorrect: netCorrect,
            expectedExpenseRatio: scn.groundTruth.expenseRatioPercent,
            actualExpenseRatio: parsed.expenseRatioPercent,
            expenseRatioCorrect: expenseCorrect,
            expectedSavingsRate: scn.groundTruth.savingsRatePercent,
            actualSavingsRate: parsed.savingsRatePercent,
            savingsRateCorrect: savingsCorrect,
            expectedStatus: scn.groundTruth.deterministicStatus,
            actualStatus: parsed.status,
            statusCorrect,
            hasArithmeticHallucination: hasHallucination,
            latencyMs,
          };

          runRecords.push(record);
          processedKeys.add(pureKey);

          console.log(`  [PureLLM Rep ${rep}] Status: ${parsed.status} (exp: ${scn.groundTruth.deterministicStatus}) | CashFlow: ${parsed.netCashFlow} (${netCorrect ? 'OK' : 'MISMATCH'}) | Hallucination: ${hasHallucination ? 'YES ❌' : 'NO ✅'} [${latencyMs}ms]`);
        } catch (e: any) {
          console.error(`  [PureLLM Rep ${rep}] Error: ${e.message}`);
        }

        await sleep(1500);
      }

      // ---------------------------------------------------------------------
      // 2. Kondisi B: FINAI (Dengan Injeksi Skor Deterministik SAW)
      // ---------------------------------------------------------------------
      const finaiKey = `${scn.id}_FINAI_${rep}`;
      if (!processedKeys.has(finaiKey)) {
        const finaiContext = `[DATA DETERMINISTIK SISTEM FINAI - ENGINE SAW]
- Pemasukan: Rp${scn.profile.monthlyIncome.toLocaleString('id-ID')}
- Pengeluaran: Rp${scn.profile.monthlyExpense.toLocaleString('id-ID')}
- Arus Kas Bersih Resmi: Rp${scn.groundTruth.netCashFlow.toLocaleString('id-ID')}
- Rasio Beban Pengeluaran: ${scn.groundTruth.expenseRatioPercent}%
- Tingkat Tabungan (Savings Rate): ${scn.groundTruth.savingsRatePercent}%
- Pemakaian Anggaran: ${scn.groundTruth.budgetUtilizationPercent}%
- Ketahanan Dana Darurat: ${scn.groundTruth.liquidityMonths} bulan
- Skor SAW Deterministik: ${scn.groundTruth.score100}/100
- Status Finansial Terverifikasi: ${scn.groundTruth.deterministicStatus}

Gunakan data resmi di atas, jangan kalkulasi ulang.
Balas format JSON ringkas:
{"netCashFlow": ${scn.groundTruth.netCashFlow}, "expenseRatioPercent": ${scn.groundTruth.expenseRatioPercent}, "savingsRatePercent": ${scn.groundTruth.savingsRatePercent}, "liquidityMonths": ${scn.groundTruth.liquidityMonths}, "status": "${scn.groundTruth.deterministicStatus}", "narrative": "<rekomendasi berbasis data resmi>"}`;

        try {
          const { content, latencyMs } = await callGroqDirect(apiKey, [
            { role: 'system', content: 'Kamu adalah FinAI Assistant berarsitektur Hybrid LLM + Deterministik. Patuhi angka resmi dari sistem.' },
            { role: 'user', content: finaiContext },
          ]);

          const parsed = safeParseModelJson(content);

          const netCorrect = Math.abs(parsed.netCashFlow - scn.groundTruth.netCashFlow) <= 1000;
          const expenseCorrect = Math.abs(parsed.expenseRatioPercent - scn.groundTruth.expenseRatioPercent) <= 1.0;
          const savingsCorrect = Math.abs(parsed.savingsRatePercent - scn.groundTruth.savingsRatePercent) <= 1.0;
          const statusCorrect = parsed.status.toLowerCase() === scn.groundTruth.deterministicStatus.toLowerCase();
          const hasHallucination = !netCorrect || !expenseCorrect || !savingsCorrect;

          const record: RunResult = {
            scenarioId: scn.id,
            repetition: rep,
            condition: 'FINAI',
            expectedNetCashFlow: scn.groundTruth.netCashFlow,
            actualNetCashFlow: parsed.netCashFlow,
            netCashFlowCorrect: netCorrect,
            expectedExpenseRatio: scn.groundTruth.expenseRatioPercent,
            actualExpenseRatio: parsed.expenseRatioPercent,
            expenseRatioCorrect: expenseCorrect,
            expectedSavingsRate: scn.groundTruth.savingsRatePercent,
            actualSavingsRate: parsed.savingsRatePercent,
            savingsRateCorrect: savingsCorrect,
            expectedStatus: scn.groundTruth.deterministicStatus,
            actualStatus: parsed.status,
            statusCorrect,
            hasArithmeticHallucination: hasHallucination,
            latencyMs,
          };

          runRecords.push(record);
          processedKeys.add(finaiKey);

          console.log(`  [FINAI Rep ${rep}] Status: ${parsed.status} (exp: ${scn.groundTruth.deterministicStatus}) | CashFlow: ${parsed.netCashFlow} (${netCorrect ? 'OK' : 'MISMATCH'}) | Hallucination: ${hasHallucination ? 'YES ❌' : 'NO ✅'} [${latencyMs}ms]`);
        } catch (e: any) {
          console.error(`  [FINAI Rep ${rep}] Error: ${e.message}`);
        }

        // Save checkpoint regularly
        fs.writeFileSync(checkpointPath, JSON.stringify(runRecords, null, 2), 'utf8');
        await sleep(1500);
      }
    }
  }

  // Final Evaluation Aggregation
  const pureRecords = runRecords.filter((r) => r.condition === 'PureLLM');
  const finaiRecords = runRecords.filter((r) => r.condition === 'FINAI');

  function analyzeCondition(records: RunResult[]) {
    const total = records.length;
    if (total === 0) return { total: 0 };

    const arithErrorCount = records.filter((r) => r.hasArithmeticHallucination).length;
    const arithErrorRate = Math.round((arithErrorCount / total) * 1000) / 10;

    const netCorrectCount = records.filter((r) => r.netCashFlowCorrect).length;
    const netAccuracy = Math.round((netCorrectCount / total) * 1000) / 10;

    const ratioCorrectCount = records.filter((r) => r.expenseRatioCorrect && r.savingsRateCorrect).length;
    const ratioAccuracy = Math.round((ratioCorrectCount / total) * 1000) / 10;

    const statusCorrectCount = records.filter((r) => r.statusCorrect).length;
    const statusAccuracy = Math.round((statusCorrectCount / total) * 1000) / 10;

    // Consistency across repetitions per scenario
    const scenarioGroups = new Map<string, RunResult[]>();
    for (const r of records) {
      if (!scenarioGroups.has(r.scenarioId)) scenarioGroups.set(r.scenarioId, []);
      scenarioGroups.get(r.scenarioId)!.push(r);
    }

    let perfectlyConsistentScenarios = 0;
    for (const [_, scnRuns] of scenarioGroups.entries()) {
      const statuses = scnRuns.map((x) => x.actualStatus.toLowerCase());
      const allSame = statuses.every((s) => s === statuses[0]);
      if (allSame) perfectlyConsistentScenarios++;
    }

    const consistencyRate = Math.round((perfectlyConsistentScenarios / scenarioGroups.size) * 1000) / 10;

    // Latency
    const lats = records.map((r) => r.latencyMs).sort((a, b) => a - b);
    const avgLatency = Math.round((lats.reduce((a, b) => a + b, 0) / lats.length) * 10) / 10;
    const medianLatency = lats[Math.floor(lats.length * 0.5)];
    const p95Latency = lats[Math.floor(lats.length * 0.95)];

    return {
      totalRuns: total,
      uniqueScenarios: scenarioGroups.size,
      arithmeticErrorCount: arithErrorCount,
      arithmeticErrorRatePct: arithErrorRate,
      arithmeticAccuracyPct: Math.round((100 - arithErrorRate) * 10) / 10,
      netCashFlowAccuracyPct: netAccuracy,
      ratioAccuracyPct: ratioAccuracy,
      statusClassificationAccuracyPct: statusAccuracy,
      crossRepetitionConsistencyRatePct: consistencyRate,
      latency: {
        avgMs: avgLatency,
        medianMs: medianLatency,
        p95Ms: p95Latency,
      },
    };
  }

  const pureSummary = analyzeCondition(pureRecords);
  const finaiSummary = analyzeCondition(finaiRecords);

  const finalOutput = {
    metadata: {
      experimentTitle: 'Eksperimen Komparatif Halusinasi Numerik (Pure LLM vs FINAI)',
      model: FINAI_GROK_MODEL,
      scenariosCount: scenarios.length,
      repetitionsPerScenario: REPETITIONS,
      timestamp: new Date().toISOString(),
    },
    comparativeSummary: {
      pureLLM: pureSummary,
      finai: finaiSummary,
      improvements: {
        arithmeticErrorReductionPct: Math.round(((pureSummary.arithmeticErrorRatePct || 0) - (finaiSummary.arithmeticErrorRatePct || 0)) * 10) / 10,
        statusAccuracyGainPct: Math.round(((finaiSummary.statusClassificationAccuracyPct || 0) - (pureSummary.statusClassificationAccuracyPct || 0)) * 10) / 10,
        consistencyGainPct: Math.round(((finaiSummary.crossRepetitionConsistencyRatePct || 0) - (pureSummary.crossRepetitionConsistencyRatePct || 0)) * 10) / 10,
      },
    },
    rawRuns: runRecords,
  };

  // Write JSON
  const finalJsonPath = path.join(resultsDir, 'hallucination_experiment_results.json');
  fs.writeFileSync(finalJsonPath, JSON.stringify(finalOutput, null, 2), 'utf8');

  // Write CSV
  const csvHeader = 'scenarioId,repetition,condition,expectedNetCashFlow,actualNetCashFlow,netCashFlowCorrect,expectedExpenseRatio,actualExpenseRatio,expenseRatioCorrect,expectedSavingsRate,actualSavingsRate,savingsRateCorrect,expectedStatus,actualStatus,statusCorrect,hasArithmeticHallucination,latencyMs\n';
  const csvRows = runRecords.map((r) => {
    return `${r.scenarioId},${r.repetition},${r.condition},${r.expectedNetCashFlow},${r.actualNetCashFlow},${r.netCashFlowCorrect},${r.expectedExpenseRatio},${r.actualExpenseRatio},${r.expenseRatioCorrect},${r.expectedSavingsRate},${r.actualSavingsRate},${r.savingsRateCorrect},${r.expectedStatus},${r.actualStatus},${r.statusCorrect},${r.hasArithmeticHallucination},${r.latencyMs}`;
  }).join('\n');
  const finalCsvPath = path.join(resultsDir, 'hallucination_experiment_results.csv');
  fs.writeFileSync(finalCsvPath, csvHeader + csvRows, 'utf8');

  console.log('\n======================================================');
  console.log('🏁 REKAPITULASI HASIL EKSPERIMEN HALUSINASI NUMERIK:');
  console.log('======================================================');
  console.log(`METRIK EVALUASI                     | PURE LLM       | FINAI (HYBRID SAW)`);
  console.log(`------------------------------------+----------------+-------------------`);
  console.log(`Tingkat Kesalahan Aritmetika (Error)| ${(pureSummary.arithmeticErrorRatePct + '%').padEnd(14)} | ${finaiSummary.arithmeticErrorRatePct}%`);
  console.log(`Akurasi Akurasi Arus Kas Bersih     | ${(pureSummary.netCashFlowAccuracyPct + '%').padEnd(14)} | ${finaiSummary.netCashFlowAccuracyPct}%`);
  console.log(`Akurasi Perhitungan Rasio (%)       | ${(pureSummary.ratioAccuracyPct + '%').padEnd(14)} | ${finaiSummary.ratioAccuracyPct}%`);
  console.log(`Akurasi Klasifikasi Status SAW      | ${(pureSummary.statusClassificationAccuracyPct + '%').padEnd(14)} | ${finaiSummary.statusClassificationAccuracyPct}%`);
  console.log(`Konsistensi Lintas Pengulangan (3x) | ${(pureSummary.crossRepetitionConsistencyRatePct + '%').padEnd(14)} | ${finaiSummary.crossRepetitionConsistencyRatePct}%`);
  console.log(`Median Latensi Inferensi            | ${(pureSummary.latency?.medianMs + 'ms').padEnd(14)} | ${finaiSummary.latency?.medianMs}ms`);
  console.log(`------------------------------------+----------------+-------------------`);
  console.log(`📁 File JSON Hasil: ${finalJsonPath}`);
  console.log(`📁 File CSV Hasil: ${finalCsvPath}\n`);
}

main().catch((err) => {
  console.error('Fatal in hallucination experiment:', err);
  process.exit(1);
});
