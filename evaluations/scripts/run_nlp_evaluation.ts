import fs from 'node:fs';
import path from 'node:path';
import { FINAI_SYSTEM_PROMPT, FINAI_GROK_MODEL, FINAI_GROK_BASE_URL } from '../../src/lib/ai/ai.prompts';
import { GrokStructuredResponseSchema, GrokStructuredResponse } from '../../src/lib/ai/ai.schemas';
import { NLPGroundTruth } from './generate_nlp_dataset';

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

// Compact context block to stay within TPM limit
const compactContextBlock = `Tanggal hari ini: 24 November 2026

Daftar wallet milik user:
- BCA (id: w-bca, type: BANK, saldo: Rp5.000.000)
- Mandiri (id: w-mandiri, type: BANK, saldo: Rp2.500.000)
- GoPay (id: w-gopay, type: E_WALLET, saldo: Rp350.000)
- OVO (id: w-ovo, type: E_WALLET, saldo: Rp150.000)
- Dana (id: w-dana, type: E_WALLET, saldo: Rp200.000)
- ShopeePay (id: w-shopeepay, type: E_WALLET, saldo: Rp120.000)
- Tunai (id: w-cash, type: CASH, saldo: Rp500.000)

Daftar target/goal milik user:
- Laptop Baru (id: g-laptop, target: Rp15.000.000, tercapai: Rp5.000.000)
- Dana Darurat (id: g-emergency, target: Rp20.000.000, tercapai: Rp8.000.000)
- Liburan ke Bali (id: g-bali, target: Rp5.000.000, tercapai: Rp1.500.000)
- DP Rumah (id: g-rumah, target: Rp50.000.000, tercapai: Rp12.000.000)
- Umroh (id: g-umroh, target: Rp35.000.000, tercapai: Rp7.000.000)
- Sepatu Running (id: g-sepatu, target: Rp1.200.000, tercapai: Rp400.000)
- Tabungan Nikah (id: g-nikah, target: Rp30.000.000, tercapai: Rp6.000.000)

Daftar anggaran/budget (bulan ini):
- Makanan & Minuman: batas Rp2.000.000, terpakai Rp1.200.000
- Transportasi: batas Rp800.000, terpakai Rp450.000
- Belanja: batas Rp1.000.000, terpakai Rp600.000
- Tagihan: batas Rp1.500.000, terpakai Rp1.100.000
- Hiburan: batas Rp500.000, terpakai Rp350.000

Ringkasan finansial bulan ini:
- Pemasukan: Rp8.000.000
- Pengeluaran: Rp5.200.000
- Sisa: Rp2.800.000
- Surplus bulanan: Rp2.800.000`;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function safeParseStructured(raw: string): GrokStructuredResponse | null {
  const trimmed = raw.trim();

  const tryValidate = (obj: any): GrokStructuredResponse | null => {
    if (obj && typeof obj === 'object') {
      if (obj.type === 'financial_action' && obj.requiresConfirmation === undefined) {
        obj.requiresConfirmation = true;
      }
      const res = GrokStructuredResponseSchema.safeParse(obj);
      if (res.success) return res.data;
    }
    return null;
  };

  // 1. Direct JSON parse
  try {
    const parsed = JSON.parse(trimmed);
    const valid = tryValidate(parsed);
    if (valid) return valid;
  } catch {}

  // 2. Markdown fence extraction
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) {
    try {
      const parsed = JSON.parse(fence[1].trim());
      const valid = tryValidate(parsed);
      if (valid) return valid;
    } catch {}
  }

  // 3. Substring braces
  const s = trimmed.indexOf('{');
  const e = trimmed.lastIndexOf('}');
  if (s !== -1 && e > s) {
    try {
      const parsed = JSON.parse(trimmed.slice(s, e + 1));
      const valid = tryValidate(parsed);
      if (valid) return valid;
    } catch {}
  }

  return null;
}

// Normalization helpers
function normalizeAmount(val: unknown): string | null {
  if (val === null || val === undefined) return null;
  const str = String(val).replace(/[^0-9]/g, '');
  return str.length > 0 ? str : null;
}

function normalizeCategory(cat: string | null | undefined): string | null {
  if (!cat) return null;
  const lower = cat.toLowerCase().trim();
  if (lower.includes('makan') || lower.includes('food') || lower.includes('minum') || lower.includes('restoran')) return 'makanan & minuman';
  if (lower.includes('trans') || lower.includes('bensin') || lower.includes('ojek') || lower.includes('parkir') || lower.includes('commuter') || lower.includes('tol')) return 'transportasi';
  if (lower.includes('tagih') || lower.includes('listrik') || lower.includes('wifi') || lower.includes('air') || lower.includes('pulsa') || lower.includes('data') || lower.includes('domain')) return 'tagihan';
  if (lower.includes('belanja') || lower.includes('shopping') || lower.includes('baju') || lower.includes('kaos')) return 'belanja';
  if (lower.includes('hibur') || lower.includes('bioskop') || lower.includes('nonton') || lower.includes('game') || lower.includes('wisata') || lower.includes('netflix') || lower.includes('spotify')) return 'hiburan';
  if (lower.includes('sehat') || lower.includes('obat') || lower.includes('apotek') || lower.includes('vitamin') || lower.includes('kacamata') || lower.includes('gym')) return 'kesehatan';
  if (lower.includes('didik') || lower.includes('buku') || lower.includes('tugas') || lower.includes('kuliah') || lower.includes('fotocopy')) return 'pendidikan';
  if (lower.includes('gaji') || lower.includes('salary') || lower.includes('honor') || lower.includes('tutor') || lower.includes('asisten')) return 'gaji';
  if (lower.includes('bonus') || lower.includes('cashback') || lower.includes('komisi') || lower.includes('tip') || lower.includes('reward')) return 'bonus';
  if (lower.includes('harian') || lower.includes('laundry') || lower.includes('barber') || lower.includes('skincare') || lower.includes('gas') || lower.includes('aqua')) return 'kebutuhan harian';
  if (lower.includes('kos') || lower.includes('kontrakan') || lower.includes('tinggal') || lower.includes('servis ac')) return 'tempat tinggal';
  if (lower.includes('tabung') || lower.includes('saving') || lower.includes('invest')) return 'tabungan';
  return lower;
}

function normalizeWallet(w: string | null | undefined): string | null {
  if (!w) return null;
  const lower = w.toLowerCase().trim();
  if (lower.includes('bca')) return 'bca';
  if (lower.includes('mandiri')) return 'mandiri';
  if (lower.includes('gopay')) return 'gopay';
  if (lower.includes('ovo')) return 'ovo';
  if (lower.includes('dana')) return 'dana';
  if (lower.includes('shopee')) return 'shopeepay';
  if (lower.includes('tunai') || lower.includes('cash') || lower.includes('fisik')) return 'tunai';
  return lower;
}

function normalizeGoal(g: string | null | undefined): string | null {
  if (!g) return null;
  const lower = g.toLowerCase().trim();
  if (lower.includes('laptop')) return 'laptop baru';
  if (lower.includes('darurat')) return 'dana darurat';
  if (lower.includes('bali') || lower.includes('liburan')) return 'liburan ke bali';
  if (lower.includes('rumah') || lower.includes('dp')) return 'dp rumah';
  if (lower.includes('umroh') || lower.includes('haji')) return 'umroh';
  if (lower.includes('sepatu')) return 'sepatu running';
  if (lower.includes('nikah')) return 'tabungan nikah';
  return lower;
}

interface EvaluationRecord {
  id: string;
  sentence: string;
  groundTruthAction: string;
  predictedAction: string;
  intentCorrect: boolean;
  jsonValid: boolean;
  latencyMs: number;
  gtAmount: string | null;
  predAmount: string | null;
  amountCorrect: boolean;
  gtCategory: string | null;
  predCategory: string | null;
  categoryCorrect: boolean;
  gtWallet: string | null;
  predWallet: string | null;
  walletCorrect: boolean;
  gtGoal: string | null;
  predGoal: string | null;
  goalCorrect: boolean;
  tags: string[];
}

async function main() {
  loadEnv();
  const apiKey = process.env.GROQ_API_KEY?.trim();
  if (!apiKey) {
    console.error('GROQ_API_KEY not configured.');
    process.exit(1);
  }

  const datasetPath = path.resolve(process.cwd(), 'evaluations/data/nlp_test_dataset_200.json');
  const dataset = JSON.parse(fs.readFileSync(datasetPath, 'utf8')) as NLPGroundTruth[];
  console.log(`🚀 Evaluasi NLP FinAI pada ${dataset.length} kalimat uji...`);

  const resultsDir = path.resolve(process.cwd(), 'evaluations/results');
  if (!fs.existsSync(resultsDir)) fs.mkdirSync(resultsDir, { recursive: true });

  const checkpointPath = path.join(resultsDir, 'nlp_checkpoint.json');
  let evaluatedRecords: EvaluationRecord[] = [];
  const processedIds = new Set<string>();

  if (fs.existsSync(checkpointPath)) {
    try {
      evaluatedRecords = JSON.parse(fs.readFileSync(checkpointPath, 'utf8'));
      evaluatedRecords.forEach((r) => processedIds.add(r.id));
      console.log(`⏩ Melanjutkan dari checkpoint: ${evaluatedRecords.length} kasus sudah tersimpan.`);
    } catch {}
  }

  const systemContent = `Kamu adalah FinAI Assistant. Ekstrak intent dan entitas user ke format JSON terstruktur.

Daftar Wallet: BCA, Mandiri, GoPay, OVO, Dana, ShopeePay, Tunai
Daftar Goal: Laptop Baru, Dana Darurat, Liburan ke Bali, DP Rumah, Umroh, Sepatu Running, Tabungan Nikah

Format output JSON wajib salah satu:
1. Catat transaksi baru:
{"type":"financial_action","action":"create_transaction","message":"...","payload":{"amount":"<angka murni>","category":"...","walletName":"<nama wallet>","transactionType":"EXPENSE"|"INCOME"},"requiresConfirmation":true}

2. Transfer antar dompet internal:
{"type":"financial_action","action":"transfer","message":"...","payload":{"amount":"<angka murni>","sourceWalletName":"<asal>","destinationWalletName":"<tujuan>"},"requiresConfirmation":true}

3. Setor ke target/goal:
{"type":"financial_action","action":"goal_contribution","message":"...","payload":{"amount":"<angka murni>","sourceWalletName":"<asal>","goalName":"<nama goal>"},"requiresConfirmation":true}

4. Konsultasi / saran finansial / cek anggaran / perencanaan:
{"type":"financial_plan","message":"...","data":{"targetName":"...","totalAmount":"..."}}

Balas HANYA JSON valid murni tanpa markdown fence.`;

  let index = 0;
  let activeModel = FINAI_GROK_MODEL;

  for (const item of dataset) {
    index++;
    if (processedIds.has(item.id)) continue;

    let success = false;
    let retries = 0;
    const maxRetries = 10;
    let duration = 0;
    let rawContent = '';
    let jsonValid = false;
    let parsedStructured: GrokStructuredResponse | null = null;

    while (!success && retries <= maxRetries) {
      const start = performance.now();
      try {
        const res = await fetch(`${FINAI_GROK_BASE_URL}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: activeModel,
            messages: [
              { role: 'system', content: systemContent },
              { role: 'user', content: item.sentence },
            ],
            temperature: 0.3,
            max_tokens: 450,
            response_format: { type: 'json_object' },
          }),
        });

        duration = performance.now() - start;

        if (res.status === 429) {
          retries++;
          const errBody = await res.text();

          // If daily quota on 20b is exceeded, switch to 120b sister model immediately
          if (errBody.includes('tokens per day') && activeModel === FINAI_GROK_MODEL) {
            console.log(`  🔄 [TPD Quota Limit] Kuota harian ${FINAI_GROK_MODEL} penuh. Mengalihkan ke model saudara openai/gpt-oss-120b...`);
            activeModel = 'openai/gpt-oss-120b';
            await sleep(1000);
            continue;
          }

          let waitMs = 4000;
          const matchSec = errBody.match(/try again in ([\d.]+)s/i);
          const matchMs = errBody.match(/try again in ([\d.]+)ms/i);
          if (matchSec) {
            waitMs = Math.ceil(parseFloat(matchSec[1]) * 1000) + 1500;
          } else if (matchMs) {
            waitMs = Math.max(Math.ceil(parseFloat(matchMs[1])), 3500) + retries * 1000;
          } else {
            waitMs = 3500 + retries * 1500;
          }

          console.log(`  ⏳ [429 for ${item.id}] Menunggu ${waitMs}ms (retry ${retries}/${maxRetries})...`);
          await sleep(waitMs);
          continue;
        }

        if (!res.ok) {
          const errBody = await res.text();
          throw new Error(`Groq HTTP ${res.status}: ${res.statusText} - ${errBody}`);
        }

        const data = await res.json();
        rawContent = data.choices?.[0]?.message?.content || '{}';
        parsedStructured = safeParseStructured(rawContent);
        jsonValid = parsedStructured !== null;
        success = true;
      } catch (err: any) {
        retries++;
        if (retries <= maxRetries) {
          console.log(`  ⏳ [Error retry ${retries}/${maxRetries} for ${item.id}] ${err.message}. Menunggu 3000ms...`);
          await sleep(3000);
        } else {
          console.error(`  ❌ Exceeded retries on ${item.id}: ${err.message}`);
          jsonValid = false;
        }
      }
    }

    // Determine predicted action and entities
    let predictedAction = 'financial_advice';
    let predAmount: string | null = null;
    let predCategory: string | null = null;
    let predWallet: string | null = null;
    let predGoal: string | null = null;

    if (parsedStructured) {
      if (parsedStructured.type === 'financial_action') {
        predictedAction = parsedStructured.action || 'create_transaction';
        const p = parsedStructured.payload || {};
        predAmount = normalizeAmount(p.amount);
        predCategory = p.category || null;
        predWallet = p.walletName || p.sourceWalletName || null;
        predGoal = p.goalName || null;
      } else if (parsedStructured.type === 'financial_plan') {
        predictedAction = 'financial_advice';
        const d = parsedStructured.data || {};
        predAmount = normalizeAmount(d.targetAmount);
        predGoal = d.targetName || null;
      } else {
        predictedAction = 'financial_advice';
        if (parsedStructured.data) {
          predCategory = parsedStructured.data.category || null;
          predAmount = normalizeAmount(parsedStructured.data.totalAmount || parsedStructured.data.targetAmount);
          predGoal = parsedStructured.data.name || null;
        }
      }
    }

    // Evaluate accuracy
    const gtAction = item.expected_action;
    const intentCorrect = predictedAction === gtAction;

    // Entity matching
    const normGtAmount = normalizeAmount(item.expected_amount);
    const normPredAmount = normalizeAmount(predAmount);
    const amountCorrect = normGtAmount === normPredAmount;

    const normGtCat = normalizeCategory(item.expected_category);
    const normPredCat = normalizeCategory(predCategory);
    const categoryCorrect = normGtCat === normPredCat || (normGtCat === null && normPredCat === null);

    const normGtWallet = normalizeWallet(item.expected_wallet);
    const normPredWallet = normalizeWallet(predWallet);
    const walletCorrect = normGtWallet === normPredWallet || (normGtWallet === null && normPredWallet === null);

    const normGtGoal = normalizeGoal(item.expected_goal);
    const normPredGoal = normalizeGoal(predGoal);
    const goalCorrect = normGtGoal === normPredGoal || (normGtGoal === null && normPredGoal === null);

    const record: EvaluationRecord = {
      id: item.id,
      sentence: item.sentence,
      groundTruthAction: gtAction,
      predictedAction,
      intentCorrect,
      jsonValid,
      latencyMs: Math.round(duration * 10) / 10,
      gtAmount: normGtAmount,
      predAmount: normPredAmount,
      amountCorrect,
      gtCategory: normGtCat,
      predCategory: normPredCat,
      categoryCorrect,
      gtWallet: normGtWallet,
      predWallet: normPredWallet,
      walletCorrect,
      gtGoal: normGtGoal,
      predGoal: normPredGoal,
      goalCorrect,
      tags: item.variation_tags,
    };

    evaluatedRecords.push(record);
    processedIds.add(item.id);

    const icon = intentCorrect ? '✅' : '⚠️';
    console.log(`[${index}/${dataset.length}] ${icon} ${item.id} | Intent: ${intentCorrect ? 'OK' : `${gtAction} -> ${predictedAction}`} | Latency: ${record.latencyMs}ms | "${item.sentence.slice(0, 42)}..."`);

    // Write checkpoint every record
    fs.writeFileSync(checkpointPath, JSON.stringify(evaluatedRecords, null, 2), 'utf8');

    // Safe pacing delay (2000ms with compact prompt)
    await sleep(2000);
  }

  // Compute Full Evaluation Statistics
  const total = evaluatedRecords.length;
  const jsonValidCount = evaluatedRecords.filter((r) => r.jsonValid).length;
  const jsonValidityRate = Math.round((jsonValidCount / total) * 1000) / 10;

  const intentCorrectCount = evaluatedRecords.filter((r) => r.intentCorrect).length;
  const intentAccuracy = Math.round((intentCorrectCount / total) * 1000) / 10;

  const intentStats: Record<string, { total: number; correct: number; accuracy: number }> = {};
  ['create_transaction', 'transfer', 'goal_contribution', 'financial_advice'].forEach((act) => {
    const actTotal = evaluatedRecords.filter((r) => r.groundTruthAction === act).length;
    const actCorrect = evaluatedRecords.filter((r) => r.groundTruthAction === act && r.intentCorrect).length;
    intentStats[act] = {
      total: actTotal,
      correct: actCorrect,
      accuracy: actTotal > 0 ? Math.round((actCorrect / actTotal) * 1000) / 10 : 0,
    };
  });

  function calcEntityMetrics(records: EvaluationRecord[], field: 'amount' | 'category' | 'wallet' | 'goal') {
    let tp = 0;
    let fp = 0;
    let fn = 0;
    let tn = 0;

    for (const r of records) {
      let gt: string | null = null;
      let pred: string | null = null;

      if (field === 'amount') {
        gt = r.gtAmount;
        pred = r.predAmount;
      } else if (field === 'category') {
        gt = r.gtCategory;
        pred = r.predCategory;
      } else if (field === 'wallet') {
        gt = r.gtWallet;
        pred = r.predWallet;
      } else if (field === 'goal') {
        gt = r.gtGoal;
        pred = r.predGoal;
      }

      if (gt !== null && pred !== null) {
        if (gt === pred) {
          tp++;
        } else {
          fp++;
          fn++;
        }
      } else if (gt !== null && pred === null) {
        fn++;
      } else if (gt === null && pred !== null) {
        fp++;
      } else {
        tn++;
      }
    }

    const precision = tp + fp > 0 ? tp / (tp + fp) : 1;
    const recall = tp + fn > 0 ? tp / (tp + fn) : 1;
    const f1 = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;

    return {
      tp,
      fp,
      fn,
      tn,
      precisionPct: Math.round(precision * 1000) / 10,
      recallPct: Math.round(recall * 1000) / 10,
      f1ScorePct: Math.round(f1 * 1000) / 10,
    };
  }

  const amountMetrics = calcEntityMetrics(evaluatedRecords, 'amount');
  const categoryMetrics = calcEntityMetrics(evaluatedRecords, 'category');
  const walletMetrics = calcEntityMetrics(evaluatedRecords, 'wallet');
  const goalMetrics = calcEntityMetrics(evaluatedRecords, 'goal');

  const combinedWalletGoalMetrics = {
    tp: walletMetrics.tp + goalMetrics.tp,
    fp: walletMetrics.fp + goalMetrics.fp,
    fn: walletMetrics.fn + goalMetrics.fn,
    precisionPct: Math.round(((walletMetrics.tp + goalMetrics.tp) / ((walletMetrics.tp + goalMetrics.tp) + (walletMetrics.fp + goalMetrics.fp) || 1)) * 1000) / 10,
    recallPct: Math.round(((walletMetrics.tp + goalMetrics.tp) / ((walletMetrics.tp + goalMetrics.tp) + (walletMetrics.fn + goalMetrics.fn) || 1)) * 1000) / 10,
  };
  const cPrec = combinedWalletGoalMetrics.precisionPct / 100;
  const cRec = combinedWalletGoalMetrics.recallPct / 100;
  const combinedWalletGoalF1 = cPrec + cRec > 0 ? Math.round(((2 * cPrec * cRec) / (cPrec + cRec)) * 1000) / 10 : 0;

  const latencies = evaluatedRecords.map((r) => r.latencyMs).filter((l) => l > 0).sort((a, b) => a - b);
  const minLatency = latencies.length > 0 ? latencies[0] : 0;
  const maxLatency = latencies.length > 0 ? latencies[latencies.length - 1] : 0;
  const sumLatency = latencies.reduce((a, b) => a + b, 0);
  const avgLatency = latencies.length > 0 ? Math.round((sumLatency / latencies.length) * 10) / 10 : 0;
  const medianLatency = latencies.length > 0 ? latencies[Math.floor(latencies.length * 0.5)] : 0;
  const p95Latency = latencies.length > 0 ? latencies[Math.floor(latencies.length * 0.95)] : 0;

  const finalSummary = {
    metadata: {
      datasetSize: total,
      model: FINAI_GROK_MODEL,
      evalDate: new Date().toISOString(),
      testedActions: ['create_transaction', 'transfer', 'goal_contribution', 'financial_advice'],
    },
    jsonValidityRate,
    intentAccuracy,
    intentBreakdown: intentStats,
    entityMetrics: {
      amount: amountMetrics,
      category: categoryMetrics,
      wallet: walletMetrics,
      goal: goalMetrics,
      wallet_or_goal_combined: {
        ...combinedWalletGoalMetrics,
        f1ScorePct: combinedWalletGoalF1,
      },
    },
    latencyBenchmark: {
      minMs: minLatency,
      maxMs: maxLatency,
      avgMs: avgLatency,
      medianMs: medianLatency,
      p95Ms: p95Latency,
    },
  };

  const finalJsonPath = path.join(resultsDir, 'nlp_evaluation_results.json');
  fs.writeFileSync(finalJsonPath, JSON.stringify({ summary: finalSummary, records: evaluatedRecords }, null, 2), 'utf8');

  const csvHeader = 'id,sentence,groundTruthAction,predictedAction,intentCorrect,jsonValid,latencyMs,gtAmount,predAmount,amountCorrect,gtCategory,predCategory,categoryCorrect,gtWallet,predWallet,walletCorrect,gtGoal,predGoal,goalCorrect,tags\n';
  const csvRows = evaluatedRecords.map((r) => {
    const esc = `"${r.sentence.replace(/"/g, '""')}"`;
    const tags = `"${r.tags.join(';')}"`;
    return `${r.id},${esc},${r.groundTruthAction},${r.predictedAction},${r.intentCorrect},${r.jsonValid},${r.latencyMs},${r.gtAmount || ''},${r.predAmount || ''},${r.amountCorrect},${r.gtCategory || ''},${r.predCategory || ''},${r.categoryCorrect},${r.gtWallet || ''},${r.predWallet || ''},${r.walletCorrect},${r.gtGoal || ''},${r.predGoal || ''},${r.goalCorrect},${tags}`;
  }).join('\n');
  const finalCsvPath = path.join(resultsDir, 'nlp_evaluation_results.csv');
  fs.writeFileSync(finalCsvPath, csvHeader + csvRows, 'utf8');

  console.log('\n======================================================');
  console.log('🏁 REKAPITULASI HASIL EVALUASI EKSTRAKSI NLP FINAI:');
  console.log('======================================================');
  console.log(`- Total Kalimat Uji: ${total}`);
  console.log(`- JSON Validity Rate: ${jsonValidityRate}% (${jsonValidCount}/${total})`);
  console.log(`- Intent Accuracy: ${intentAccuracy}% (${intentCorrectCount}/${total})`);
  console.log('  * create_transaction: ' + intentStats.create_transaction.accuracy + '%');
  console.log('  * transfer: ' + intentStats.transfer.accuracy + '%');
  console.log('  * goal_contribution: ' + intentStats.goal_contribution.accuracy + '%');
  console.log('  * financial_advice: ' + intentStats.financial_advice.accuracy + '%');
  console.log('- Entitas Amount: P=' + amountMetrics.precisionPct + '%, R=' + amountMetrics.recallPct + '%, F1=' + amountMetrics.f1ScorePct + '%');
  console.log('- Entitas Category: P=' + categoryMetrics.precisionPct + '%, R=' + categoryMetrics.recallPct + '%, F1=' + categoryMetrics.f1ScorePct + '%');
  console.log('- Entitas Wallet/Goal (Combined): P=' + combinedWalletGoalMetrics.precisionPct + '%, R=' + combinedWalletGoalMetrics.recallPct + '%, F1=' + combinedWalletGoalF1 + '%');
  console.log(`- Latensi Inferensi: Median=${medianLatency}ms | P95=${p95Latency}ms | Avg=${avgLatency}ms (Min=${minLatency}ms, Max=${maxLatency}ms)`);
  console.log(`📁 File JSON: ${finalJsonPath}`);
  console.log(`📁 File CSV: ${finalCsvPath}\n`);
}

main().catch((err) => {
  console.error('Fatal in NLP evaluation:', err);
  process.exit(1);
});
