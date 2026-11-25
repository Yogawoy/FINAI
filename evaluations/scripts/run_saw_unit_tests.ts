import assert from 'node:assert/strict';
import { SAWFinancialEngine, FinancialProfileInput } from '../../src/lib/ai/saw-engine';
import fs from 'node:fs';
import path from 'node:path';

interface TestCase {
  id: string;
  name: string;
  profile: FinancialProfileInput;
  expectedStatus: 'Strong' | 'Stable' | 'Warning' | 'Critical';
  minScore?: number;
  maxScore?: number;
  notes: string;
}

const testCases: TestCase[] = [
  {
    id: 'TC-SAW-01',
    name: 'Kasus Nilai Nol Mutlak (Zero Division Immunity)',
    profile: {
      totalBalance: 0,
      monthlyIncome: 0,
      monthlyExpense: 0,
      totalBudgetLimit: 0,
      totalBudgetSpent: 0,
    },
    expectedStatus: 'Warning', // Baseline neutral 0.45
    minScore: 0.40,
    maxScore: 0.55,
    notes: 'Menguji ketahanan sistem terhadap pembagian nol (0/0) saat user baru mendaftar tanpa transaksi.',
  },
  {
    id: 'TC-SAW-02',
    name: 'Surplus Finansial Prima (Strong Profile)',
    profile: {
      totalBalance: 25_000_000,
      monthlyIncome: 12_000_000,
      monthlyExpense: 4_000_000,
      totalBudgetLimit: 4_500_000,
      totalBudgetSpent: 3_200_000,
    },
    expectedStatus: 'Strong',
    minScore: 0.80,
    maxScore: 1.00,
    notes: 'Pengeluaran rendah (33% dari income), tabungan 66%, likuiditas > 6 bulan.',
  },
  {
    id: 'TC-SAW-03',
    name: 'Kondisi Finansial Stabil Moderat (Stable Profile)',
    profile: {
      totalBalance: 8_000_000,
      monthlyIncome: 7_500_000,
      monthlyExpense: 5_000_000,
      totalBudgetLimit: 5_000_000,
      totalBudgetSpent: 4_800_000,
    },
    expectedStatus: 'Stable',
    minScore: 0.60,
    maxScore: 0.79,
    notes: 'Arus kas positif (33%), anggaran terkendali 96%, likuiditas 1.6 bulan.',
  },
  {
    id: 'TC-SAW-03B',
    name: 'Kondisi Finansial Waspada (Warning Status Benchmark)',
    profile: {
      totalBalance: 12_000_000,
      monthlyIncome: 10_000_000,
      monthlyExpense: 8_500_000,
      totalBudgetLimit: 8_000_000,
      totalBudgetSpent: 7_400_000,
    },
    expectedStatus: 'Warning',
    minScore: 0.45,
    maxScore: 0.59,
    notes: 'Tabungan 15% (di bawah target optimal 20%), pengeluaran 85%, anggaran mendekati batas, tergolong status Warning.',
  },
  {
    id: 'TC-SAW-04',
    name: 'Arus Kas Sangat Ketat & Anggaran Terlampaui (Borderline Critical Profile)',
    profile: {
      totalBalance: 2_000_000,
      monthlyIncome: 5_000_000,
      monthlyExpense: 4_700_000,
      totalBudgetLimit: 4_000_000,
      totalBudgetSpent: 4_600_000,
    },
    expectedStatus: 'Critical',
    minScore: 0.25,
    maxScore: 0.39,
    notes: 'Surplus hanya 6%, anggaran terlampaui 115%, dan buffer darurat hanya 0.4 bulan (< 2 minggu), tepat diklasifikasikan Critical.',
  },
  {
    id: 'TC-SAW-05',
    name: 'Defisit Ekstrem & Arus Kas Negatif (Severe Deficit Profile)',
    profile: {
      totalBalance: 500_000,
      monthlyIncome: 3_000_000,
      monthlyExpense: 6_500_000,
      totalBudgetLimit: 3_000_000,
      totalBudgetSpent: 6_200_000,
    },
    expectedStatus: 'Critical',
    minScore: 0.00,
    maxScore: 0.20,
    notes: 'Pengeluaran lebih dari 2x pemasukan, pembengkakan anggaran 200%, buffer kurang dari 3 hari.',
  },
  {
    id: 'TC-SAW-06',
    name: 'Saldo Nol & Pengeluaran Berjalan (Zero Balance Critical)',
    profile: {
      totalBalance: 0,
      monthlyIncome: 2_000_000,
      monthlyExpense: 2_800_000,
      totalBudgetLimit: 2_000_000,
      totalBudgetSpent: 2_500_000,
    },
    expectedStatus: 'Critical',
    minScore: 0.00,
    maxScore: 0.25,
    notes: 'Likuiditas nol total dengan defisit bulanan.',
  },
  {
    id: 'TC-SAW-07',
    name: 'Anggaran Terlampaui Ekstrem (Severe Budget Overrun Critical)',
    profile: {
      totalBalance: 10_000_000,
      monthlyIncome: 10_000_000,
      monthlyExpense: 9_500_000,
      totalBudgetLimit: 3_000_000,
      totalBudgetSpent: 9_000_000, // 300% of budget
    },
    expectedStatus: 'Critical',
    minScore: 0.15,
    maxScore: 0.39,
    notes: 'Kepatuhan anggaran terdegradasi total (300% overspend), mengindikasikan krisis tata kelola pengeluaran.',
  },
  {
    id: 'TC-SAW-08',
    name: 'Income Tinggi Tapi Boros Total (High Income Low Buffer Critical)',
    profile: {
      totalBalance: 3_000_000,
      monthlyIncome: 30_000_000,
      monthlyExpense: 29_500_000,
      totalBudgetLimit: 20_000_000,
      totalBudgetSpent: 28_000_000,
    },
    expectedStatus: 'Critical',
    minScore: 0.10,
    maxScore: 0.39,
    notes: 'Membuktikan bahwa pendapatan besar tanpa tabungan dan likuiditas (< 3 hari cadangan) diklasifikasikan rawan krisis (Critical).',
  },
  {
    id: 'TC-SAW-09',
    name: 'Dana Darurat Sangat Besar Tapi Tidak Ada Income (Asset-Rich No Income)',
    profile: {
      totalBalance: 100_000_000,
      monthlyIncome: 0,
      monthlyExpense: 5_000_000,
      totalBudgetLimit: 5_000_000,
      totalBudgetSpent: 5_000_000,
    },
    expectedStatus: 'Critical',
    minScore: 0.15,
    maxScore: 0.30,
    notes: 'Tanpa pemasukan bulanan (skor C1=0, C2=0), SAW mencerminkan risiko arus kas jangka panjang.',
  },
  {
    id: 'TC-SAW-10',
    name: 'Threshold Boundary Case (Kategori Strong)',
    profile: {
      totalBalance: 18_000_000,
      monthlyIncome: 10_000_000,
      monthlyExpense: 4_500_000,
      totalBudgetLimit: 5_000_000,
      totalBudgetSpent: 4_000_000,
    },
    expectedStatus: 'Strong',
    minScore: 0.80,
    maxScore: 1.00,
    notes: 'Profil prima dengan tabungan 55%, likuiditas > 3 bulan, dan anggaran 80% disiplin.',
  },
];

async function main() {
  console.log('🧪 Memulai Pengujian Unit Mesin SAW (Simple Additive Weighting)...\n');
  const results: any[] = [];
  let passed = 0;
  let failed = 0;

  for (const tc of testCases) {
    const start = performance.now();
    const res = SAWFinancialEngine.evaluate(tc.profile);
    const duration = performance.now() - start;

    let pass = true;
    let errMsg = '';

    try {
      assert.equal(res.status, tc.expectedStatus, `Status mismatch: got ${res.status}, expected ${tc.expectedStatus}`);
      if (tc.minScore !== undefined) {
        assert.ok(res.sawScore >= tc.minScore, `Score ${res.sawScore} below min ${tc.minScore}`);
      }
      if (tc.maxScore !== undefined) {
        assert.ok(res.sawScore <= tc.maxScore, `Score ${res.sawScore} above max ${tc.maxScore}`);
      }
      assert.ok(!Number.isNaN(res.sawScore), 'SAW score cannot be NaN');
      assert.ok(Number.isFinite(res.sawScore), 'SAW score must be finite');
    } catch (e: any) {
      pass = false;
      errMsg = e.message;
    }

    if (pass) {
      console.log(`  ✅ [PASS] ${tc.id}: ${tc.name} -> Score: ${res.sawScore} (${res.status}) [${duration.toFixed(3)}ms]`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${tc.id}: ${tc.name} -> Error: ${errMsg}`);
      failed++;
    }

    results.push({
      testId: tc.id,
      name: tc.name,
      profile: tc.profile,
      expectedStatus: tc.expectedStatus,
      actualStatus: res.status,
      sawScore: res.sawScore,
      score100: res.normalizedScore100,
      criteria: res.criteria,
      metrics: res.metrics,
      passed: pass,
      latencyMs: duration,
      notes: tc.notes,
    });
  }

  // Ensure output directory
  const outDir = path.resolve(process.cwd(), 'evaluations/results');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(outDir, 'saw_engine_results.json'),
    JSON.stringify({ summary: { total: testCases.length, passed, failed }, results }, null, 2),
    'utf8'
  );

  console.log(`\n======================================================`);
  console.log(`🏁 HASIL PENGUJIAN UNIT MESIN SAW: ${passed} LULUS, ${failed} GAGAL`);
  console.log(`======================================================\n`);

  if (failed > 0) process.exit(1);
}

main().catch((e) => {
  console.error('Fatal error in SAW test:', e);
  process.exit(1);
});
