import fs from 'node:fs';
import path from 'node:path';
import { FinancialProfileInput, SAWFinancialEngine } from '../../src/lib/ai/saw-engine';

export interface FinancialScenario {
  id: string;
  category: string;
  name: string;
  description: string;
  profile: FinancialProfileInput;
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

const rawScenarios: Array<{
  id: string;
  category: string;
  name: string;
  description: string;
  profile: FinancialProfileInput;
}> = [
  // 1. Surplus Sehat (Healthy Surplus)
  {
    id: 'SCN-01',
    category: 'Surplus Sehat',
    name: 'Profesional Muda Hemat',
    description: 'Pemasukan 15jt, pengeluaran 5jt, saldo 35jt, anggaran terkontrol rapi.',
    profile: {
      monthlyIncome: 15_000_000,
      monthlyExpense: 5_000_000,
      totalBalance: 35_000_000,
      totalBudgetLimit: 6_000_000,
      totalBudgetSpent: 4_800_000,
      totalGoalTarget: 50_000_000,
      totalGoalCurrent: 20_000_000,
    },
  },
  {
    id: 'SCN-02',
    category: 'Surplus Sehat',
    name: 'Keluarga Baru Mapan',
    description: 'Pemasukan gabungan 22jt, pengeluaran 9jt, cadangan likuiditas 60jt.',
    profile: {
      monthlyIncome: 22_000_000,
      monthlyExpense: 9_000_000,
      totalBalance: 60_000_000,
      totalBudgetLimit: 10_000_000,
      totalBudgetSpent: 8_500_000,
      totalGoalTarget: 100_000_000,
      totalGoalCurrent: 45_000_000,
    },
  },
  {
    id: 'SCN-03',
    category: 'Surplus Sehat',
    name: 'Freelancer Sukses Berdisiplin',
    description: 'Pemasukan 18jt, pengeluaran 6.5jt, likuiditas darurat 40jt.',
    profile: {
      monthlyIncome: 18_000_000,
      monthlyExpense: 6_500_000,
      totalBalance: 40_000_000,
      totalBudgetLimit: 7_500_000,
      totalBudgetSpent: 6_000_000,
      totalGoalTarget: 30_000_000,
      totalGoalCurrent: 18_000_000,
    },
  },
  {
    id: 'SCN-04',
    category: 'Surplus Sehat',
    name: 'Karyawan Senior Frugal',
    description: 'Pemasukan 12jt, pengeluaran 4jt, saldo 28jt, tabungan 66%.',
    profile: {
      monthlyIncome: 12_000_000,
      monthlyExpense: 4_000_000,
      totalBalance: 28_000_000,
      totalBudgetLimit: 4_500_000,
      totalBudgetSpent: 3_800_000,
      totalGoalTarget: 20_000_000,
      totalGoalCurrent: 15_000_000,
    },
  },
  {
    id: 'SCN-05',
    category: 'Surplus Sehat',
    name: 'Eksekutif Muda Dana Melimpah',
    description: 'Pemasukan 35jt, pengeluaran 12jt, saldo 90jt, rasio tabungan 65%.',
    profile: {
      monthlyIncome: 35_000_000,
      monthlyExpense: 12_000_000,
      totalBalance: 90_000_000,
      totalBudgetLimit: 14_000_000,
      totalBudgetSpent: 11_000_000,
      totalGoalTarget: 150_000_000,
      totalGoalCurrent: 70_000_000,
    },
  },

  // 2. Defisit Arus Kas (Cash Flow Deficit)
  {
    id: 'SCN-06',
    category: 'Defisit Arus Kas',
    name: 'Defisit Berat Konsumtif',
    description: 'Pemasukan 5jt tapi pengeluaran 7.8jt, saldo menipis jadi 1jt.',
    profile: {
      monthlyIncome: 5_000_000,
      monthlyExpense: 7_800_000,
      totalBalance: 1_000_000,
      totalBudgetLimit: 5_000_000,
      totalBudgetSpent: 7_500_000,
      totalGoalTarget: 10_000_000,
      totalGoalCurrent: 500_000,
    },
  },
  {
    id: 'SCN-07',
    category: 'Defisit Arus Kas',
    name: 'Biaya Rumah Tangga Membengkak',
    description: 'Pemasukan 8jt, pengeluaran 11jt karena perbaikan rumah mendadak.',
    profile: {
      monthlyIncome: 8_000_000,
      monthlyExpense: 11_000_000,
      totalBalance: 2_500_000,
      totalBudgetLimit: 8_000_000,
      totalBudgetSpent: 10_800_000,
    },
  },
  {
    id: 'SCN-08',
    category: 'Defisit Arus Kas',
    name: 'Mahasiswa Akhir Menipis',
    description: 'Pemasukan kiriman 2jt, pengeluaran 3.2jt, saldo tersisa 250rb.',
    profile: {
      monthlyIncome: 2_000_000,
      monthlyExpense: 3_200_000,
      totalBalance: 250_000,
      totalBudgetLimit: 2_000_000,
      totalBudgetSpent: 3_100_000,
    },
  },
  {
    id: 'SCN-09',
    category: 'Defisit Arus Kas',
    name: 'Pekerja Lepas Sepi Proyek',
    description: 'Pemasukan hanya 3jt, pengeluaran rutin 5.5jt, saldo 800rb.',
    profile: {
      monthlyIncome: 3_000_000,
      monthlyExpense: 5_500_000,
      totalBalance: 800_000,
      totalBudgetLimit: 4_000_000,
      totalBudgetSpent: 5_200_000,
    },
  },
  {
    id: 'SCN-10',
    category: 'Defisit Arus Kas',
    name: 'Gaya Hidup Melebihi Kemampuan',
    description: 'Pemasukan 10jt, pengeluaran kartu kredit membengkak 16jt, saldo 2jt.',
    profile: {
      monthlyIncome: 10_000_000,
      monthlyExpense: 16_000_000,
      totalBalance: 2_000_000,
      totalBudgetLimit: 9_000_000,
      totalBudgetSpent: 15_500_000,
    },
  },

  // 3. Anggaran Lewat Batas (Overbudget)
  {
    id: 'SCN-11',
    category: 'Anggaran Lewat Batas',
    name: 'Overbudget Makan & Hiburan',
    description: 'Income 7jt, belanja habis 6.8jt, pos makan tembus 180% limit.',
    profile: {
      monthlyIncome: 7_000_000,
      monthlyExpense: 6_800_000,
      totalBalance: 4_000_000,
      totalBudgetLimit: 4_500_000,
      totalBudgetSpent: 6_500_000,
    },
  },
  {
    id: 'SCN-12',
    category: 'Anggaran Lewat Batas',
    name: 'Kalap Belanja Promo Tanggal Kembar',
    description: 'Income 9jt, expense 8.7jt, belanja online 200% dari alokasi.',
    profile: {
      monthlyIncome: 9_000_000,
      monthlyExpense: 8_700_000,
      totalBalance: 5_000_000,
      totalBudgetLimit: 6_000_000,
      totalBudgetSpent: 8_400_000,
    },
  },
  {
    id: 'SCN-13',
    category: 'Anggaran Lewat Batas',
    name: 'Overbudget Ekstrem Kendaraan',
    description: 'Income 6jt, expense 5.9jt, servis kendaraan 250% budget.',
    profile: {
      monthlyIncome: 6_000_000,
      monthlyExpense: 5_900_000,
      totalBalance: 3_000_000,
      totalBudgetLimit: 3_500_000,
      totalBudgetSpent: 5_600_000,
    },
  },
  {
    id: 'SCN-14',
    category: 'Anggaran Lewat Batas',
    name: 'Banyak Undangan Pernikahan',
    description: 'Income 8.5jt, expense 8.2jt, pos sosial membengkak 170%.',
    profile: {
      monthlyIncome: 8_500_000,
      monthlyExpense: 8_200_000,
      totalBalance: 6_000_000,
      totalBudgetLimit: 5_000_000,
      totalBudgetSpent: 7_800_000,
    },
  },
  {
    id: 'SCN-15',
    category: 'Anggaran Lewat Batas',
    name: 'Langganan Digital Menumpuk',
    description: 'Income 11jt, expense 10.5jt, anggaran hobi dan langganan tembus 160%.',
    profile: {
      monthlyIncome: 11_000_000,
      monthlyExpense: 10_500_000,
      totalBalance: 7_000_000,
      totalBudgetLimit: 7_000_000,
      totalBudgetSpent: 10_000_000,
    },
  },

  // 4. Saldo Nol / Sangat Rendah (Zero / Depleted Liquidity)
  {
    id: 'SCN-16',
    category: 'Saldo Nol / Menipis',
    name: 'Saldo Nol Total Habis',
    description: 'Saldo dompet 0, pemasukan 3jt, pengeluaran 3.2jt, darurat total.',
    profile: {
      monthlyIncome: 3_000_000,
      monthlyExpense: 3_200_000,
      totalBalance: 0,
      totalBudgetLimit: 3_000_000,
      totalBudgetSpent: 3_100_000,
    },
  },
  {
    id: 'SCN-17',
    category: 'Saldo Nol / Menipis',
    name: 'Buffer Darurat Kritis Kurang 3 Hari',
    description: 'Saldo tersisa 150rb, pengeluaran harian 80rb, risiko gagal bayar.',
    profile: {
      monthlyIncome: 4_000_000,
      monthlyExpense: 4_300_000,
      totalBalance: 150_000,
      totalBudgetLimit: 3_800_000,
      totalBudgetSpent: 4_200_000,
    },
  },
  {
    id: 'SCN-18',
    category: 'Saldo Nol / Menipis',
    name: 'Pekerja Baru Belum Gajian',
    description: 'Saldo 200rb, pengeluaran bulanan 2.5jt, belum ada income bulan ini.',
    profile: {
      monthlyIncome: 0,
      monthlyExpense: 2_500_000,
      totalBalance: 200_000,
      totalBudgetLimit: 2_500_000,
      totalBudgetSpent: 2_400_000,
    },
  },
  {
    id: 'SCN-19',
    category: 'Saldo Nol / Menipis',
    name: 'Terkuras Membayar Uang Pangkal',
    description: 'Pemasukan 6jt, pengeluaran 8jt, seluruh saldo terkuras sisa 50rb.',
    profile: {
      monthlyIncome: 6_000_000,
      monthlyExpense: 8_000_000,
      totalBalance: 50_000,
      totalBudgetLimit: 6_000_000,
      totalBudgetSpent: 7_800_000,
    },
  },
  {
    id: 'SCN-20',
    category: 'Saldo Nol / Menipis',
    name: 'Gali Lubang Tutup Lubang',
    description: 'Saldo 100rb, income 5jt, expense 5.4jt, tanpa cadangan kas sama sekali.',
    profile: {
      monthlyIncome: 5_000_000,
      monthlyExpense: 5_400_000,
      totalBalance: 100_000,
      totalBudgetLimit: 5_000_000,
      totalBudgetSpent: 5_300_000,
    },
  },

  // 5. Multi-Dompet Terfragmentasi (Multi-Wallet Fragmentation)
  {
    id: 'SCN-21',
    category: 'Multi-Dompet',
    name: 'Saldo Tersebar di 5 E-Wallet',
    description: 'Income 8jt, expense 5.5jt, saldo 12jt terbagi di BCA, Gopay, OVO, Dana, ShopeePay.',
    profile: {
      monthlyIncome: 8_000_000,
      monthlyExpense: 5_500_000,
      totalBalance: 12_000_000,
      totalBudgetLimit: 6_000_000,
      totalBudgetSpent: 5_200_000,
    },
  },
  {
    id: 'SCN-22',
    category: 'Multi-Dompet',
    name: 'Dominasi Rekening Bisnis vs Pribadi',
    description: 'Income 14jt, expense 9jt, saldo 25jt di 2 rekening bank dan kas fisik.',
    profile: {
      monthlyIncome: 14_000_000,
      monthlyExpense: 9_000_000,
      totalBalance: 25_000_000,
      totalBudgetLimit: 10_000_000,
      totalBudgetSpent: 8_600_000,
    },
  },
  {
    id: 'SCN-23',
    category: 'Multi-Dompet',
    name: 'E-Wallet Berlebih Tunai Kosong',
    description: 'Income 6.5jt, expense 4.8jt, saldo 9jt di e-wallet tanpa pegangan tunai.',
    profile: {
      monthlyIncome: 6_500_000,
      monthlyExpense: 4_800_000,
      totalBalance: 9_000_000,
      totalBudgetLimit: 5_500_000,
      totalBudgetSpent: 4_500_000,
    },
  },
  {
    id: 'SCN-24',
    category: 'Multi-Dompet',
    name: 'Tabungan Kunci di Deposito',
    description: 'Income 10jt, expense 7jt, saldo 50jt tapi dana cair hanya 3jt di rekening aktif.',
    profile: {
      monthlyIncome: 10_000_000,
      monthlyExpense: 7_000_000,
      totalBalance: 15_000_000,
      totalBudgetLimit: 7_500_000,
      totalBudgetSpent: 6_800_000,
    },
  },
  {
    id: 'SCN-25',
    category: 'Multi-Dompet',
    name: 'Distribusi Saldo Cukup Rata',
    description: 'Income 16jt, expense 10jt, saldo 30jt di 3 bank nasional.',
    profile: {
      monthlyIncome: 16_000_000,
      monthlyExpense: 10_000_000,
      totalBalance: 30_000_000,
      totalBudgetLimit: 11_000_000,
      totalBudgetSpent: 9_700_000,
    },
  },

  // 6. Beban Kontribusi Target (Goal Strain)
  {
    id: 'SCN-26',
    category: 'Kontribusi Target',
    name: 'Nabung Ambisius DP Rumah',
    description: 'Income 10jt, expense 5jt, setor target 4.5jt per bulan, arus kas tersisa mepet.',
    profile: {
      monthlyIncome: 10_000_000,
      monthlyExpense: 5_000_000,
      totalBalance: 20_000_000,
      totalBudgetLimit: 5_500_000,
      totalBudgetSpent: 4_900_000,
      totalGoalTarget: 80_000_000,
      totalGoalCurrent: 35_000_000,
    },
  },
  {
    id: 'SCN-27',
    category: 'Kontribusi Target',
    name: 'Setoran 3 Target Bersamaan',
    description: 'Income 12jt, expense 7jt, nabung laptop, nikah, dan liburan total 4jt.',
    profile: {
      monthlyIncome: 12_000_000,
      monthlyExpense: 7_000_000,
      totalBalance: 22_000_000,
      totalBudgetLimit: 8_000_000,
      totalBudgetSpent: 6_800_000,
      totalGoalTarget: 60_000_000,
      totalGoalCurrent: 25_000_000,
    },
  },
  {
    id: 'SCN-28',
    category: 'Kontribusi Target',
    name: 'Target Terlalu Berat Melebihi Surplus',
    description: 'Income 5jt, expense 4.2jt, memaksakan setor target 1.5jt (defisit tersembunyi).',
    profile: {
      monthlyIncome: 5_000_000,
      monthlyExpense: 4_200_000,
      totalBalance: 3_000_000,
      totalBudgetLimit: 4_500_000,
      totalBudgetSpent: 4_100_000,
      totalGoalTarget: 25_000_000,
      totalGoalCurrent: 4_000_000,
    },
  },
  {
    id: 'SCN-29',
    category: 'Kontribusi Target',
    name: 'Target Dana Darurat Hampir Tercapai',
    description: 'Income 9jt, expense 5.5jt, saldo 25jt, progres target 90%.',
    profile: {
      monthlyIncome: 9_000_000,
      monthlyExpense: 5_500_000,
      totalBalance: 25_000_000,
      totalBudgetLimit: 6_000_000,
      totalBudgetSpent: 5_300_000,
      totalGoalTarget: 20_000_000,
      totalGoalCurrent: 18_000_000,
    },
  },
  {
    id: 'SCN-30',
    category: 'Kontribusi Target',
    name: 'Alokasi Tabungan Seimbang 50/30/20',
    description: 'Income 15jt, expense 7.5jt, tabungan 3jt teralokasi otomatis ke goal.',
    profile: {
      monthlyIncome: 15_000_000,
      monthlyExpense: 7_500_000,
      totalBalance: 32_000_000,
      totalBudgetLimit: 8_500_000,
      totalBudgetSpent: 7_200_000,
      totalGoalTarget: 50_000_000,
      totalGoalCurrent: 22_000_000,
    },
  },

  // 7. Kasus Ekstrem & Unik (Extreme Edge Cases)
  {
    id: 'SCN-31',
    category: 'Kasus Ekstrem',
    name: 'Zero Activity Baru Buka Akun',
    description: 'Semua nilai 0 rupiah, belum ada transaksi tercatat.',
    profile: {
      monthlyIncome: 0,
      monthlyExpense: 0,
      totalBalance: 0,
      totalBudgetLimit: 0,
      totalBudgetSpent: 0,
    },
  },
  {
    id: 'SCN-32',
    category: 'Kasus Ekstrem',
    name: 'Pemasukan Sangat Besar Sekali Waktu',
    description: 'Income 80jt (pesangon/jual aset), expense 10jt, saldo 120jt.',
    profile: {
      monthlyIncome: 80_000_000,
      monthlyExpense: 10_000_000,
      totalBalance: 120_000_000,
      totalBudgetLimit: 12_000_000,
      totalBudgetSpent: 9_500_000,
    },
  },
  {
    id: 'SCN-33',
    category: 'Kasus Ekstrem',
    name: 'Pensiunan Kaya Aset Tanpa Gaji',
    description: 'Income 0, expense bulanan 6jt, saldo 150jt (cadangan likuiditas 25 bulan).',
    profile: {
      monthlyIncome: 0,
      monthlyExpense: 6_000_000,
      totalBalance: 150_000_000,
      totalBudgetLimit: 6_500_000,
      totalBudgetSpent: 5_800_000,
    },
  },
  {
    id: 'SCN-34',
    category: 'Kasus Ekstrem',
    name: 'Income Sangat Tinggi Tapi 100% Habis',
    description: 'Income 50jt, expense 50jt, saldo hanya 1jt (gaya hidup ultra boros).',
    profile: {
      monthlyIncome: 50_000_000,
      monthlyExpense: 50_000_000,
      totalBalance: 1_000_000,
      totalBudgetLimit: 40_000_000,
      totalBudgetSpent: 49_000_000,
    },
  },
  {
    id: 'SCN-35',
    category: 'Kasus Ekstrem',
    name: 'Defisit Bencana 5x Lipat Income',
    description: 'Income 4jt, expense 20jt akibat musibah medis, saldo minus/kritis 100rb.',
    profile: {
      monthlyIncome: 4_000_000,
      monthlyExpense: 20_000_000,
      totalBalance: 100_000,
      totalBudgetLimit: 4_000_000,
      totalBudgetSpent: 19_500_000,
    },
  },
  // 8. Kondisi Finansial Stabil & Moderat (Stable Profiles: Skor SAW 0.60 - 0.79)
  {
    id: 'SCN-36',
    category: 'Finansial Stabil',
    name: 'Karyawan Menengah Moderat',
    description: 'Income 10jt, expense 7.5jt (75% rasio), saldo 7.5jt (1 bulan buffer), budget 96% terpakai.',
    profile: {
      monthlyIncome: 10_000_000,
      monthlyExpense: 7_500_000,
      totalBalance: 7_500_000,
      totalBudgetLimit: 7_500_000,
      totalBudgetSpent: 7_200_000,
    },
  },
  {
    id: 'SCN-37',
    category: 'Finansial Stabil',
    name: 'Pegawai Negeri Golongan III',
    description: 'Income 8jt, expense 6jt (75% rasio), saldo 6jt (buffer 1 bulan), anggaran 90% disiplin.',
    profile: {
      monthlyIncome: 8_000_000,
      monthlyExpense: 6_000_000,
      totalBalance: 6_000_000,
      totalBudgetLimit: 6_000_000,
      totalBudgetSpent: 5_500_000,
    },
  },
  {
    id: 'SCN-38',
    category: 'Finansial Stabil',
    name: 'Guru Swasta Berkeluarga',
    description: 'Income 7jt, expense 5.4jt (77% rasio), saldo 8jt (buffer 1.5 bulan).',
    profile: {
      monthlyIncome: 7_000_000,
      monthlyExpense: 5_400_000,
      totalBalance: 8_000_000,
      totalBudgetLimit: 5_500_000,
      totalBudgetSpent: 5_100_000,
    },
  },
  {
    id: 'SCN-39',
    category: 'Finansial Stabil',
    name: 'Desainer UI/UX In-House',
    description: 'Income 12jt, expense 9.2jt (76% rasio), saldo 12jt (buffer 1.3 bulan).',
    profile: {
      monthlyIncome: 12_000_000,
      monthlyExpense: 9_200_000,
      totalBalance: 12_000_000,
      totalBudgetLimit: 9_500_000,
      totalBudgetSpent: 8_900_000,
    },
  },
  {
    id: 'SCN-40',
    category: 'Finansial Waspada',
    name: 'Single Worker Tabungan Tipis',
    description: 'Income 6jt, expense 5.2jt (86% rasio), saldo 3.5jt (buffer 0.67 bulan).',
    profile: {
      monthlyIncome: 6_000_000,
      monthlyExpense: 5_200_000,
      totalBalance: 3_500_000,
      totalBudgetLimit: 5_300_000,
      totalBudgetSpent: 5_000_000,
    },
  },
];

async function main() {
  const dataDir = path.resolve(process.cwd(), 'evaluations/data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Calculate deterministic ground truth for every scenario using SAW engine
  const scenarios: FinancialScenario[] = rawScenarios.map((s) => {
    const saw = SAWFinancialEngine.evaluate(s.profile);
    return {
      id: s.id,
      category: s.category,
      name: s.name,
      description: s.description,
      profile: s.profile,
      groundTruth: {
        netCashFlow: saw.metrics.netCashFlow,
        savingsRatePercent: saw.metrics.savingsRatePercent,
        expenseRatioPercent: saw.metrics.expenseRatioPercent,
        budgetUtilizationPercent: saw.metrics.budgetUtilizationPercent,
        liquidityMonths: saw.metrics.liquidityMonths,
        sawScore: saw.sawScore,
        score100: saw.normalizedScore100,
        deterministicStatus: saw.status,
      },
    };
  });

  // 1. Write JSON
  const jsonPath = path.join(dataDir, 'financial_scenarios_50.json');
  fs.writeFileSync(jsonPath, JSON.stringify(scenarios, null, 2), 'utf8');

  // 2. Write CSV
  const csvHeader = 'id,category,name,income,expense,balance,budget_limit,budget_spent,net_cash_flow,savings_rate_pct,expense_ratio_pct,budget_util_pct,liquidity_months,saw_score,status\n';
  const csvRows = scenarios.map((s) => {
    const p = s.profile;
    const g = s.groundTruth;
    return `${s.id},"${s.category}","${s.name}",${p.monthlyIncome},${p.monthlyExpense},${p.totalBalance},${p.totalBudgetLimit || 0},${p.totalBudgetSpent || 0},${g.netCashFlow},${g.savingsRatePercent},${g.expenseRatioPercent},${g.budgetUtilizationPercent},${g.liquidityMonths},${g.sawScore},${g.deterministicStatus}`;
  }).join('\n');

  const csvPath = path.join(dataDir, 'financial_scenarios_50.csv');
  fs.writeFileSync(csvPath, csvHeader + csvRows, 'utf8');

  console.log(`✅ Berhasil membuat ${scenarios.length} skenario profil finansial evaluasi.`);
  console.log(`📁 File JSON: ${jsonPath}`);
  console.log(`📁 File CSV: ${csvPath}`);

  // Summary by status
  const statusCounts = scenarios.reduce((acc, cur) => {
    acc[cur.groundTruth.deterministicStatus] = (acc[cur.groundTruth.deterministicStatus] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log('\n📊 Distribusi Status Finansial Deterministik (Ground Truth SAW):');
  for (const [k, v] of Object.entries(statusCounts)) {
    console.log(`  - ${k}: ${v} skenario (${((v / scenarios.length) * 100).toFixed(1)}%)`);
  }
}

main().catch(console.error);
