import {
  Transaction,
  BudgetCategory,
  FinancialGoal,
  GoalItem,
  CashflowPoint,
  CategoryBreakdown,
  DaySpending,
  AIMessage,
  Wallet,
} from '@/types';

export const USER_PROFILE = {
  name: 'Yoga',
  fullName: 'Yoga Wicaksono',
  email: 'yoga@finai.design',
  avatar: '/avatar.png',
  tier: 'FinAI Pro Member',
  currency: 'IDR',
  availableBalance: 34850000,
  monthlyInflow: 18700000,
  monthlyOutflow: 12450000,
  netCashflow: 6250000,
  financialHealth: {
    score: 82,
    rating: 'Excellent',
    discipline: 92,
    savingsRate: 34.2,
    emergencyCushionMonths: 4.8,
    summary: 'Your financial core is exceptionally balanced this month. Cash reserve velocity is at an optimal 34% buffer.'
  },
  accounts: [
    { id: 'acc-1', name: 'BCA Priority', balance: 12500000, type: 'Rekening Bank', number: '••• 4821' },
    { id: 'acc-2', name: 'GoPay / OVO', balance: 1250000, type: 'E-Wallet', number: '••• 4019' },
    { id: 'acc-3', name: 'Uang Tunai', balance: 850000, type: 'Tunai', number: 'Dompet Fisik' },
    { id: 'acc-4', name: 'Tabungan Utama', balance: 20250000, type: 'Tabungan', number: '••• 9920' },
  ]
};

export const MOCK_WALLETS: Wallet[] = [
  {
    id: 'w-1',
    name: 'BCA',
    type: 'bank',
    balance: 12500000,
    currency: 'IDR',
    icon: 'Bank',
    colorTheme: 'periwinkle',
    accountIdentifier: '•••• 4821',
    holderName: 'Yoga W.',
    isArchived: false,
    createdDate: '10 Jan 2026',
    notes: 'Rekening operasional utama'
  },
  {
    id: 'w-2',
    name: 'Uang Tunai',
    type: 'cash',
    balance: 850000,
    currency: 'IDR',
    icon: 'Cash',
    colorTheme: 'mint',
    accountIdentifier: 'Dompet Fisik',
    holderName: 'Yoga W.',
    isArchived: false,
    createdDate: '15 Jan 2026',
    notes: 'Uang tunai di dompet fisik'
  },
  {
    id: 'w-3',
    name: 'GoPay',
    type: 'ewallet',
    balance: 1250000,
    currency: 'IDR',
    icon: 'Wallet',
    colorTheme: 'iceblue',
    accountIdentifier: '0812 •••• 4019',
    holderName: 'Yoga W.',
    isArchived: false,
    createdDate: '20 Jan 2026',
    notes: 'E-wallet transaksi harian'
  },
  {
    id: 'w-4',
    name: 'Mandiri',
    type: 'bank',
    balance: 8400000,
    currency: 'IDR',
    icon: 'Bank',
    colorTheme: 'periwinkle',
    accountIdentifier: '•••• 9920',
    holderName: 'Yoga W.',
    isArchived: false,
    createdDate: '05 Feb 2026',
    notes: 'Rekening sekunder & transfer'
  },
  {
    id: 'w-5',
    name: 'Tabungan Kuliah',
    type: 'savings',
    balance: 3000000,
    currency: 'IDR',
    icon: 'Savings',
    colorTheme: 'lavender',
    accountIdentifier: 'Tahapan Berjangka',
    holderName: 'Yoga W.',
    isArchived: false,
    createdDate: '01 Feb 2026',
    notes: 'Pos tabungan studi & pengembangan diri'
  },
  {
    id: 'w-6',
    name: 'Tabungan Liburan',
    type: 'savings',
    balance: 10500000,
    currency: 'IDR',
    icon: 'Savings',
    colorTheme: 'iceblue',
    accountIdentifier: 'Pos Liburan',
    holderName: 'Yoga W.',
    isArchived: false,
    createdDate: '15 Feb 2026',
    notes: 'Pos tabungan wisata impian'
  },
  {
    id: 'w-7',
    name: 'Dana Darurat',
    type: 'savings',
    balance: 6200000,
    currency: 'IDR',
    icon: 'Savings',
    colorTheme: 'mint',
    accountIdentifier: 'Pos Aman 6 Bulan',
    holderName: 'Yoga W.',
    isArchived: false,
    createdDate: '01 Jan 2026',
    notes: 'Pos cadangan darurat'
  }
];

export const MOCK_TRANSACTIONS: Transaction[] = [
  // TODAY (2026-08-31)
  {
    id: 'tx-1',
    title: 'Ayam Geprek Sambal Matah',
    category: 'food',
    type: 'expense',
    amount: 28000,
    date: '2026-08-31',
    time: '12:42 PM',
    account: 'GoPay',
    paymentMethod: 'E-Wallet',
    icon: 'Utensils',
    note: 'Makan siang sama tim kantor'
  },
  {
    id: 'tx-2',
    title: 'GrabBike',
    category: 'transport',
    type: 'expense',
    amount: 18000,
    date: '2026-08-31',
    time: '10:15 AM',
    account: 'OVO',
    paymentMethod: 'E-Wallet',
    icon: 'Car',
    note: 'Berangkat ke kantor pagi'
  },
  {
    id: 'tx-3',
    title: 'Coffee Latte',
    category: 'food',
    type: 'expense',
    amount: 22000,
    date: '2026-08-31',
    time: '08:30 AM',
    account: 'Cash',
    paymentMethod: 'Cash',
    icon: 'Coffee',
    note: 'Kopi pagi di lobby'
  },

  // YESTERDAY (2026-08-30)
  {
    id: 'tx-4',
    title: 'Belanja Kebutuhan Supermarket',
    category: 'shopping',
    type: 'expense',
    amount: 450000,
    date: '2026-08-30',
    time: '18:42 PM',
    account: 'BCA Priority',
    paymentMethod: 'Bank',
    icon: 'ShoppingBag',
    note: 'Belanja sayur, buah, dan kebutuhan dapur'
  },
  {
    id: 'tx-5',
    title: 'Gaji Bulanan - PT FinTech',
    category: 'salary',
    type: 'income',
    amount: 12500000,
    date: '2026-08-30',
    time: '09:00 AM',
    account: 'BCA Priority',
    paymentMethod: 'Bank',
    icon: 'Building',
    note: 'Gaji pokok bulanan Agustus'
  },
  {
    id: 'tx-6',
    title: 'Obat & Vitamin C',
    category: 'health',
    type: 'expense',
    amount: 85000,
    date: '2026-08-30',
    time: '08:15 AM',
    account: 'Uang Tunai',
    paymentMethod: 'Cash',
    icon: 'Heart',
    note: 'Beli di Apotek K-24'
  },

  // 29 August 2026
  {
    id: 'tx-7',
    title: 'Proyek Freelance UI/UX',
    category: 'freelance',
    type: 'income',
    amount: 3800000,
    date: '2026-08-29',
    time: '17:20 PM',
    account: 'BCA Priority',
    paymentMethod: 'Bank',
    icon: 'Sparkles',
    note: 'Pembayaran termin 1 UI/UX design'
  },
  {
    id: 'tx-8',
    title: 'Token Listrik PLN',
    category: 'bills',
    type: 'expense',
    amount: 350000,
    date: '2026-08-29',
    time: '14:10 PM',
    account: 'BCA Priority',
    paymentMethod: 'Bank',
    icon: 'Zap',
    note: 'Token listrik rumah'
  },
  {
    id: 'tx-9',
    title: 'Buku Kursus React Native',
    category: 'education',
    type: 'expense',
    amount: 199000,
    date: '2026-08-29',
    time: '11:05 AM',
    account: 'GoPay',
    paymentMethod: 'E-Wallet',
    icon: 'BookOpen',
    note: 'Materi belajar frontend lanjutan'
  },

  // 28 August 2026
  {
    id: 'tx-10',
    title: 'Internet Fiber IndiHome',
    category: 'bills',
    type: 'expense',
    amount: 399000,
    date: '2026-08-28',
    time: '10:00 AM',
    account: 'BCA Priority',
    paymentMethod: 'Bank',
    icon: 'Wifi',
    note: 'Tagihan internet bulanan 100Mbps'
  },
  {
    id: 'tx-11',
    title: 'Tiket Bioskop XXI IMAX',
    category: 'entertainment',
    type: 'expense',
    amount: 130000,
    date: '2026-08-28',
    time: '19:45 PM',
    account: 'OVO',
    paymentMethod: 'E-Wallet',
    icon: 'Film',
    note: 'Nonton film sama teman'
  },

  // 27 August 2026
  {
    id: 'tx-12',
    title: 'Pertamax Turbo Refuel',
    category: 'transport',
    type: 'expense',
    amount: 250000,
    date: '2026-08-27',
    time: '16:30 PM',
    account: 'GoPay',
    paymentMethod: 'E-Wallet',
    icon: 'Car',
    note: 'Isi bensin full tank'
  },
  {
    id: 'tx-13',
    title: 'Bebek Goreng H. Slamet',
    category: 'food',
    type: 'expense',
    amount: 65000,
    date: '2026-08-27',
    time: '13:00 PM',
    account: 'Cash',
    paymentMethod: 'Cash',
    icon: 'Utensils',
    note: 'Makan siang dinas luar'
  },

  // 26 August 2026
  {
    id: 'tx-14',
    title: 'Dividen Reksadana Saham',
    category: 'investment',
    type: 'income',
    amount: 450000,
    date: '2026-08-26',
    time: '11:15 AM',
    account: 'Bibit Mutual Funds',
    paymentMethod: 'Bank',
    icon: 'TrendingUp',
    note: 'Bagi hasil investasi bulanan'
  },
  {
    id: 'tx-15',
    title: 'Uniqlo Casual Polo',
    category: 'shopping',
    type: 'expense',
    amount: 299000,
    date: '2026-08-26',
    time: '15:20 PM',
    account: 'BCA Priority',
    paymentMethod: 'Bank',
    icon: 'ShoppingBag',
    note: 'Baju kerja kantor'
  },

  // 25 August 2026
  {
    id: 'tx-16',
    title: 'Gym Membership Gold',
    category: 'health',
    type: 'expense',
    amount: 450000,
    date: '2026-08-25',
    time: '07:30 AM',
    account: 'BCA Priority',
    paymentMethod: 'Bank',
    icon: 'Heart',
    note: 'Langganan fitness bulanan'
  },
  {
    id: 'tx-17',
    title: 'Netflix Subscription',
    category: 'entertainment',
    type: 'expense',
    amount: 186000,
    date: '2026-08-25',
    time: '00:01 AM',
    account: 'BCA Priority',
    paymentMethod: 'Bank',
    icon: 'Film',
    note: 'Paket Premium 4K Family'
  },

  // 24 August 2026
  {
    id: 'tx-18',
    title: 'Sate Khas Senayan',
    category: 'food',
    type: 'expense',
    amount: 145000,
    date: '2026-08-24',
    time: '19:15 PM',
    account: 'GoPay',
    paymentMethod: 'E-Wallet',
    icon: 'Utensils',
    note: 'Makan malam keluarga'
  },
  {
    id: 'tx-19',
    title: 'Konsultasi Dokter Gigi',
    category: 'health',
    type: 'expense',
    amount: 350000,
    date: '2026-08-24',
    time: '10:30 AM',
    account: 'BCA Priority',
    paymentMethod: 'Bank',
    icon: 'Heart',
    note: 'Pembersihan karang gigi'
  },

  // 22 August 2026
  {
    id: 'tx-20',
    title: 'Kursus UI Design Interaction',
    category: 'education',
    type: 'expense',
    amount: 499000,
    date: '2026-08-22',
    time: '14:00 PM',
    account: 'BCA Priority',
    paymentMethod: 'Bank',
    icon: 'BookOpen',
    note: 'Workshop online Framer Motion'
  },
  {
    id: 'tx-21',
    title: 'Penjualan Barang Bekas',
    category: 'other',
    type: 'income',
    amount: 600000,
    date: '2026-08-22',
    time: '16:45 PM',
    account: 'GoPay',
    paymentMethod: 'E-Wallet',
    icon: 'Sparkles',
    note: 'Jual monitor second di Tokopedia'
  },

  // 20 August 2026
  {
    id: 'tx-22',
    title: 'Spotify Duo Plan',
    category: 'entertainment',
    type: 'expense',
    amount: 74900,
    date: '2026-08-20',
    time: '01:00 AM',
    account: 'GoPay',
    paymentMethod: 'E-Wallet',
    icon: 'Film',
    note: 'Langganan musik bulanan'
  },
  {
    id: 'tx-23',
    title: 'Laundry Kiloan Premium',
    category: 'other',
    type: 'expense',
    amount: 60000,
    date: '2026-08-20',
    time: '11:00 AM',
    account: 'Cash',
    paymentMethod: 'Cash',
    icon: 'Sparkles',
    note: 'Cuci setrika baju mingguan'
  },

  // 18 August 2026
  {
    id: 'tx-24',
    title: 'Service Motor Honda',
    category: 'transport',
    type: 'expense',
    amount: 220000,
    date: '2026-08-18',
    time: '09:30 AM',
    account: 'Cash',
    paymentMethod: 'Cash',
    icon: 'Car',
    note: 'Ganti oli mesin dan servis rutin'
  },
  {
    id: 'tx-25',
    title: 'Bonus Kinerja Kuartal 2',
    category: 'salary',
    type: 'income',
    amount: 2500000,
    date: '2026-08-18',
    time: '15:00 PM',
    account: 'BCA Priority',
    paymentMethod: 'Bank',
    icon: 'Building',
    note: 'Bonus performa tim Q2'
  }
];

export const MOCK_BUDGETS: BudgetCategory[] = [
  {
    id: 'b-1',
    name: 'Makanan & Minuman',
    category: 'food',
    spent: 1080000,
    limit: 1500000,
    color: '#7C7CE6',
    icon: 'Utensils',
    dailyVelocity: 'Kecepatan belanja harian Rp36.000/hari',
    status: 'safe',
    period: 'monthly',
    startDate: '2026-08-01',
    endDate: '2026-08-31',
    healthStatus: 'almost_there',
  },
  {
    id: 'b-2',
    name: 'Transportasi',
    category: 'transport',
    spent: 480000,
    limit: 1000000,
    color: '#8E9AF7',
    icon: 'Car',
    dailyVelocity: 'Sangat aman dan terkontrol (Rp16.000/hari)',
    status: 'safe',
    period: 'monthly',
    startDate: '2026-08-01',
    endDate: '2026-08-31',
    healthStatus: 'on_track',
  },
  {
    id: 'b-3',
    name: 'Hiburan & Rekreasi',
    category: 'entertainment',
    spent: 360000,
    limit: 600000,
    color: '#D6E4FA',
    icon: 'Film',
    dailyVelocity: 'Aman di bawah batas bulanan',
    status: 'safe',
    period: 'monthly',
    startDate: '2026-08-01',
    endDate: '2026-08-31',
    healthStatus: 'on_track',
  },
  {
    id: 'b-4',
    name: 'Belanja & Kebutuhan',
    category: 'shopping',
    spent: 420000,
    limit: 700000,
    color: '#1B7354',
    icon: 'ShoppingBag',
    dailyVelocity: 'Pembelian terencana dengan baik',
    status: 'safe',
    period: 'monthly',
    startDate: '2026-08-01',
    endDate: '2026-08-31',
    healthStatus: 'on_track',
  },
  {
    id: 'b-5',
    name: 'Tagihan & Utilitas',
    category: 'bills',
    spent: 890000,
    limit: 1200000,
    color: '#F97316',
    icon: 'Zap',
    dailyVelocity: 'Tagihan rutin dan operasional rumah',
    status: 'warning',
    period: 'monthly',
    startDate: '2026-08-01',
    endDate: '2026-08-31',
    healthStatus: 'almost_there',
  },
  {
    id: 'b-6',
    name: 'Kesehatan & Medis',
    category: 'health',
    spent: 200000,
    limit: 500000,
    color: '#D0EFE5',
    icon: 'Heart',
    dailyVelocity: 'Buffer kesehatan & suplemen terjaga',
    status: 'safe',
    period: 'monthly',
    startDate: '2026-08-01',
    endDate: '2026-08-31',
    healthStatus: 'on_track',
  },
];

export interface DailySpendingPoint {
  day: string;
  dayFull: string;
  amount: number;
  label: string;
}

export const MOCK_BUDGET_DAILY_TREND: DailySpendingPoint[] = [
  { day: 'Sen', dayFull: 'Senin', amount: 80000, label: 'Rp80K' },
  { day: 'Sel', dayFull: 'Selasa', amount: 120000, label: 'Rp120K' },
  { day: 'Rab', dayFull: 'Rabu', amount: 60000, label: 'Rp60K' },
  { day: 'Kam', dayFull: 'Kamis', amount: 150000, label: 'Rp150K' },
  { day: 'Jum', dayFull: 'Jumat', amount: 90000, label: 'Rp90K' },
  { day: 'Sab', dayFull: 'Sabtu', amount: 130000, label: 'Rp130K' },
  { day: 'Min', dayFull: 'Minggu', amount: 70000, label: 'Rp70K' },
];

export const MOCK_CATEGORY_TRANSACTIONS: Record<string, { id: string; title: string; amount: number; date: string; time: string; wallet: string }[]> = {
  food: [
    { id: 'tx-f1', title: 'Ayam Geprek Sambal Korek', amount: 28000, date: '31 Aug 2026', time: '12:45', wallet: 'Cash' },
    { id: 'tx-f2', title: 'Coffee Latte & Pastry', amount: 22000, date: '31 Aug 2026', time: '09:15', wallet: 'GoPay' },
    { id: 'tx-f3', title: 'Groceries Supermarket', amount: 150000, date: '30 Aug 2026', time: '17:30', wallet: 'BCA' },
    { id: 'tx-f4', title: 'Makan Siang Bersama Tim', amount: 45000, date: '29 Aug 2026', time: '13:00', wallet: 'GoPay' },
    { id: 'tx-f5', title: 'Dinner Seafood Warung', amount: 85000, date: '28 Aug 2026', time: '19:40', wallet: 'Cash' },
  ],
  transport: [
    { id: 'tx-t1', title: 'GoRide ke Kantor Sudirman', amount: 24000, date: '31 Aug 2026', time: '08:30', wallet: 'GoPay' },
    { id: 'tx-t2', title: 'Isi Bensin Pertamax', amount: 100000, date: '29 Aug 2026', time: '18:15', wallet: 'Cash' },
    { id: 'tx-t3', title: 'Kereta Commuter Line', amount: 12000, date: '28 Aug 2026', time: '07:45', wallet: 'GoPay' },
    { id: 'tx-t4', title: 'GrabCar Pulang Hujan', amount: 55000, date: '27 Aug 2026', time: '20:10', wallet: 'GoPay' },
  ],
  entertainment: [
    { id: 'tx-e1', title: 'Tiket Bioskop XXI (2 Tiket)', amount: 110000, date: '30 Aug 2026', time: '19:00', wallet: 'BCA' },
    { id: 'tx-e2', title: 'Board Game Cafe Pass', amount: 75000, date: '28 Aug 2026', time: '15:30', wallet: 'GoPay' },
    { id: 'tx-e3', title: 'Steam Game Summer Sale', amount: 175000, date: '24 Aug 2026', time: '21:00', wallet: 'BCA' },
  ],
  shopping: [
    { id: 'tx-s1', title: 'Kemeja Katun Kasual', amount: 299000, date: '29 Aug 2026', time: '16:20', wallet: 'BCA' },
    { id: 'tx-s2', title: 'Personal Care & Skincare', amount: 121000, date: '26 Aug 2026', time: '14:00', wallet: 'GoPay' },
  ],
  bills: [
    { id: 'tx-b1', title: 'Tagihan Listrik PLN Pascabayar', amount: 450000, date: '20 Aug 2026', time: '10:00', wallet: 'BCA' },
    { id: 'tx-b2', title: 'Internet Fiber Optik 50 Mbps', amount: 380000, date: '18 Aug 2026', time: '11:30', wallet: 'BCA' },
    { id: 'tx-b3', title: 'Langganan Spotify Family', amount: 60000, date: '15 Aug 2026', time: '09:00', wallet: 'GoPay' },
  ],
  health: [
    { id: 'tx-h1', title: 'Multivitamin & Zinc Guardian', amount: 120000, date: '25 Aug 2026', time: '13:10', wallet: 'GoPay' },
    { id: 'tx-h2', title: 'Obat Apotek & Plester', amount: 80000, date: '21 Aug 2026', time: '17:00', wallet: 'Cash' },
  ],
};

export const MOCK_GOALS: FinancialGoal[] = [
  {
    id: 'g-1',
    title: 'Laptop Workstation',
    category: 'Work Gear',
    currentAmount: 17000000,
    targetAmount: 25000000,
    deadline: 'Dec 2026',
    icon3d: 'laptop',
    monthlyContribution: 2000000,
    status: 'On track (68%)'
  },
  {
    id: 'g-2',
    title: 'Japan Travel',
    category: 'Leisure',
    currentAmount: 8500000,
    targetAmount: 20000000,
    deadline: 'April 2027',
    icon3d: 'travel',
    monthlyContribution: 1500000,
    status: 'Building pace (42%)'
  },
  {
    id: 'g-3',
    title: 'Emergency Shield',
    category: 'Safety Net',
    currentAmount: 38000000,
    targetAmount: 60000000,
    deadline: 'Aug 2027',
    icon3d: 'shield',
    monthlyContribution: 3000000,
    status: 'Core priority (63%)'
  }
];

export const MOCK_GOALS_LIST: GoalItem[] = [
  {
    id: 'goal-1',
    title: 'Laptop Baru',
    category: 'laptop',
    targetAmount: 12000000,
    currentAmount: 8160000,
    targetDate: '2026-12-31',
    frequency: 'monthly',
    monthlySaving: 960000,
    sourceWalletId: 'w-1',
    sourceWalletName: 'Bank BCA •••• 4821',
    destinationWalletId: 'w-5',
    destinationWalletName: 'Tabungan Kuliah',
    colorTheme: 'periwinkle',
    status: 'on_track',
    notes: 'MacBook Pro untuk kerja & desain UI/UX',
    contributions: [
      {
        id: 'c-1',
        amount: 500000,
        date: '30 Agu 2026',
        sourceWalletId: 'w-1',
        sourceWalletName: 'Bank BCA',
        destinationWalletId: 'w-5',
        destinationWalletName: 'Tabungan Kuliah',
        note: 'Sisihan freelance',
      },
      {
        id: 'c-2',
        amount: 250000,
        date: '15 Agu 2026',
        sourceWalletId: 'w-1',
        sourceWalletName: 'Bank BCA',
        destinationWalletId: 'w-5',
        destinationWalletName: 'Tabungan Kuliah',
        note: 'Bonus mingguan',
      },
      {
        id: 'c-3',
        amount: 500000,
        date: '01 Agu 2026',
        sourceWalletId: 'w-1',
        sourceWalletName: 'Bank BCA',
        destinationWalletId: 'w-5',
        destinationWalletName: 'Tabungan Kuliah',
        note: 'Gaji pokok',
      },
    ],
  },
  {
    id: 'goal-2',
    title: 'Liburan Jepang',
    category: 'travel',
    targetAmount: 25000000,
    currentAmount: 10500000,
    targetDate: '2027-06-30',
    frequency: 'monthly',
    monthlySaving: 1610000,
    sourceWalletId: 'w-3',
    sourceWalletName: 'GoPay',
    destinationWalletId: 'w-6',
    destinationWalletName: 'Tabungan Liburan',
    colorTheme: 'lavender',
    status: 'needs_attention',
    notes: 'Tiket pesawat & penginapan Tokyo - Kyoto 7 hari',
    contributions: [
      {
        id: 'c-4',
        amount: 1000000,
        date: '28 Agu 2026',
        sourceWalletId: 'w-3',
        sourceWalletName: 'GoPay',
        destinationWalletId: 'w-6',
        destinationWalletName: 'Tabungan Liburan',
        note: 'Cashback e-wallet',
      },
      {
        id: 'c-5',
        amount: 500000,
        date: '10 Agu 2026',
        sourceWalletId: 'w-1',
        sourceWalletName: 'Bank BCA',
        destinationWalletId: 'w-6',
        destinationWalletName: 'Tabungan Liburan',
        note: 'Tabungan rutin',
      },
    ],
  },
  {
    id: 'goal-3',
    title: 'Dana Darurat',
    category: 'emergency',
    targetAmount: 20000000,
    currentAmount: 6200000,
    targetDate: '2027-12-31',
    frequency: 'monthly',
    monthlySaving: 575000,
    sourceWalletId: 'w-1',
    sourceWalletName: 'Bank BCA •••• 4821',
    destinationWalletId: 'w-7',
    destinationWalletName: 'Dana Darurat',
    colorTheme: 'mint',
    status: 'on_track',
    notes: 'Target 6 bulan biaya operasional aman',
    contributions: [
      {
        id: 'c-6',
        amount: 1000000,
        date: '25 Agu 2026',
        sourceWalletId: 'w-1',
        sourceWalletName: 'Bank BCA',
        destinationWalletId: 'w-7',
        destinationWalletName: 'Dana Darurat',
        note: 'Alokasi dana darurat',
      },
      {
        id: 'c-7',
        amount: 750000,
        date: '05 Agu 2026',
        sourceWalletId: 'w-4',
        sourceWalletName: 'Bank Mandiri',
        destinationWalletId: 'w-7',
        destinationWalletName: 'Dana Darurat',
        note: 'Simpanan awal bulan',
      },
    ],
  },
  {
    id: 'goal-4',
    title: 'Motor',
    category: 'vehicle',
    targetAmount: 30000000,
    currentAmount: 22500000,
    targetDate: '2027-03-31',
    frequency: 'monthly',
    monthlySaving: 1070000,
    sourceWalletId: 'w-1',
    sourceWalletName: 'Bank BCA •••• 4821',
    destinationWalletId: 'w-5',
    destinationWalletName: 'Tabungan Kuliah',
    colorTheme: 'iceblue',
    status: 'on_track',
    notes: 'DP & pelunasan kendaraan harian kantor',
    contributions: [
      {
        id: 'c-8',
        amount: 1500000,
        date: '30 Agu 2026',
        sourceWalletId: 'w-1',
        sourceWalletName: 'Bank BCA',
        destinationWalletId: 'w-5',
        destinationWalletName: 'Tabungan Kuliah',
        note: 'Tabungan bulanan motor',
      },
    ],
  },
];

export const MOCK_CASHFLOW: CashflowPoint[] = [
  { month: 'Mar', income: 14000000, expense: 9800000, savings: 4200000 },
  { month: 'Apr', income: 15500000, expense: 10200000, savings: 5300000 },
  { month: 'May', income: 16000000, expense: 11100000, savings: 4900000 },
  { month: 'Jun', income: 14500000, expense: 9900000, savings: 4600000 },
  { month: 'Jul', income: 17200000, expense: 11800000, savings: 5400000 },
  { month: 'Aug', income: 18700000, expense: 12450000, savings: 6250000 }
];

export const MOCK_CATEGORY_BREAKDOWN: CategoryBreakdown[] = [
  { name: 'Food & Dining', amount: 2150000, percentage: 34, color: '#7C7CE6', category: 'food' },
  { name: 'Shopping & Goods', amount: 1700000, percentage: 27, color: '#9EB3F7', category: 'shopping' },
  { name: 'Bills & Utilities', amount: 1250000, percentage: 20, color: '#E4E2FB', category: 'bills' },
  { name: 'Transportation', amount: 720000, percentage: 12, color: '#D0EFE5', category: 'transport' },
  { name: 'Entertainment', amount: 450000, percentage: 7, color: '#FCE2E0', category: 'entertainment' }
];

export const MOCK_DAY_SPENDING: DaySpending[] = [
  { day: 'Mon', amount: 120000, avg: 150000 },
  { day: 'Tue', amount: 85000, avg: 150000 },
  { day: 'Wed', amount: 210000, avg: 150000 },
  { day: 'Thu', amount: 145000, avg: 150000 },
  { day: 'Fri', amount: 320000, avg: 150000 },
  { day: 'Sat', amount: 450000, avg: 150000 },
  { day: 'Sun', amount: 390000, avg: 150000 }
];

export const INITIAL_AI_MESSAGES: AIMessage[] = [
  {
    id: 'ai-1',
    sender: 'assistant',
    content: 'Good morning, Yoga! Your financial status is in excellent condition today. You have saved 34.2% of your monthly cashflow. What financial analysis would you like to explore?',
    timestamp: '09:00 AM',
    quickInsights: [
      { label: 'Available Liquidity', value: 'Rp34.850.000' },
      { label: 'Top Spending Category', value: 'Food & Dining (34%)' },
      { label: 'Health Score', value: '82 / 100' }
    ]
  }
];

export const formatIDR = (val: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  })
    .format(val)
    .replace('Rp', 'Rp');
};
