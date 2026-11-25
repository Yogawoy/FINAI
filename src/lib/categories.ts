import type { GoalCategoryType, TransactionCategory } from '@/types';

export type CategoryScope = 'expense' | 'income' | 'both';

export interface TransactionCategoryMeta {
  id: TransactionCategory;
  label: string;
  shortLabel: string;
  appliesTo: CategoryScope;
  color: string;
  badgeTheme: {
    bg: string;
    text: string;
    border: string;
  };
  rowTheme: {
    bg: string;
    text: string;
    border: string;
    rowHover: string;
  };
  aliases: string[];
}

export const TRANSACTION_CATEGORIES: TransactionCategoryMeta[] = [
  {
    id: 'food',
    label: 'Makanan & Minuman',
    shortLabel: 'Makanan',
    appliesTo: 'expense',
    color: '#7C7CE6',
    badgeTheme: { bg: 'bg-[#EDEAFC]', text: 'text-[#5F5ED4]', border: 'border-[#E4E2FB]' },
    rowTheme: {
      bg: 'bg-gradient-to-tr from-[#E4E2FB] to-[#DDD9FA]',
      text: 'text-[#7C7CE6]',
      border: 'border-[#D8D4FA]',
      rowHover: 'hover:bg-[#F3F2FF]/60',
    },
    aliases: ['food', 'makanan', 'makanan & minuman', 'food & dining', 'kuliner', 'coffee', 'kopi'],
  },
  {
    id: 'transport',
    label: 'Transportasi',
    shortLabel: 'Transportasi',
    appliesTo: 'expense',
    color: '#8E9AF7',
    badgeTheme: { bg: 'bg-[#D6E4FA]/60', text: 'text-[#3B6DB0]', border: 'border-[#BED6F9]' },
    rowTheme: {
      bg: 'bg-gradient-to-tr from-[#D6E4FA] to-[#C9D8F5]',
      text: 'text-[#3E6FB0]',
      border: 'border-[#BED6F9]',
      rowHover: 'hover:bg-[#F0F5FE]/60',
    },
    aliases: ['transport', 'transportasi', 'transportation', 'kendaraan', 'bensin', 'ojek'],
  },
  {
    id: 'shopping',
    label: 'Belanja',
    shortLabel: 'Belanja',
    appliesTo: 'expense',
    color: '#10B981',
    badgeTheme: { bg: 'bg-[#D0EFE5]', text: 'text-[#1B7354]', border: 'border-[#A7E3D0]' },
    rowTheme: {
      bg: 'bg-gradient-to-tr from-[#D0EFE5] to-[#BCE6D9]',
      text: 'text-[#1B7354]',
      border: 'border-[#B2E9D7]',
      rowHover: 'hover:bg-[#EAF8F3]/50',
    },
    aliases: ['shopping', 'belanja', 'belanja & kebutuhan', 'shopping & goods'],
  },
  {
    id: 'bills',
    label: 'Tagihan & Utilitas',
    shortLabel: 'Tagihan',
    appliesTo: 'expense',
    color: '#F97316',
    badgeTheme: { bg: 'bg-[#FCE2E0]', text: 'text-[#B83A38]', border: 'border-[#FAD0CD]' },
    rowTheme: {
      bg: 'bg-gradient-to-tr from-[#FCE2E0] to-[#FAD4D2]',
      text: 'text-[#B83A38]',
      border: 'border-[#FAC2BE]',
      rowHover: 'hover:bg-[#FFF2F1]/60',
    },
    aliases: ['bills', 'tagihan', 'tagihan & utilitas', 'bills & utilities', 'utilitas', 'listrik', 'wifi', 'air', 'pulsa', 'bill'],
  },
  {
    id: 'daily_needs',
    label: 'Kebutuhan Harian',
    shortLabel: 'Kebutuhan Harian',
    appliesTo: 'expense',
    color: '#0EA5E9',
    badgeTheme: { bg: 'bg-[#E0F2FE]', text: 'text-[#0369A1]', border: 'border-[#BAE6FD]' },
    rowTheme: {
      bg: 'bg-gradient-to-tr from-[#E0F2FE] to-[#BAE6FD]',
      text: 'text-[#0369A1]',
      border: 'border-[#BAE6FD]',
      rowHover: 'hover:bg-[#F0F9FF]/60',
    },
    aliases: ['daily_needs', 'kebutuhan harian', 'harian', 'laundry', 'barber', 'skincare', 'galon', 'gas', 'sabun'],
  },
  {
    id: 'housing',
    label: 'Tempat Tinggal',
    shortLabel: 'Tempat Tinggal',
    appliesTo: 'expense',
    color: '#6366F1',
    badgeTheme: { bg: 'bg-[#EEF2FF]', text: 'text-[#4338CA]', border: 'border-[#C7D2FE]' },
    rowTheme: {
      bg: 'bg-gradient-to-tr from-[#E0E7FF] to-[#C7D2FE]',
      text: 'text-[#4338CA]',
      border: 'border-[#C7D2FE]',
      rowHover: 'hover:bg-[#EEF2FF]/60',
    },
    aliases: ['housing', 'tempat tinggal', 'kos', 'kontrakan', 'sewa', 'hunian', 'ipl', 'servis ac'],
  },
  {
    id: 'entertainment',
    label: 'Hiburan',
    shortLabel: 'Hiburan',
    appliesTo: 'expense',
    color: '#F59E0B',
    badgeTheme: { bg: 'bg-[#FEF3C7]', text: 'text-[#B45309]', border: 'border-[#FDE68A]' },
    rowTheme: {
      bg: 'bg-gradient-to-tr from-[#EBE9FE] to-[#DFDCFD]',
      text: 'text-[#6B66DA]',
      border: 'border-[#D5D2FB]',
      rowHover: 'hover:bg-[#F5F4FF]/60',
    },
    aliases: ['entertainment', 'hiburan', 'rekreasi', 'nonton', 'bioskop', 'game', 'netflix', 'spotify'],
  },
  {
    id: 'health',
    label: 'Kesehatan',
    shortLabel: 'Kesehatan',
    appliesTo: 'expense',
    color: '#EC4899',
    badgeTheme: { bg: 'bg-[#FCE7F3]', text: 'text-[#BE185D]', border: 'border-[#FBCFE8]' },
    rowTheme: {
      bg: 'bg-gradient-to-tr from-[#FCE2E0] to-[#FAD4D2]',
      text: 'text-[#B83A38]',
      border: 'border-[#FAC2BE]',
      rowHover: 'hover:bg-[#FFF2F1]/60',
    },
    aliases: ['health', 'kesehatan', 'health & medical', 'medis', 'obat', 'apotek', 'dokter', 'gym'],
  },
  {
    id: 'education',
    label: 'Pendidikan',
    shortLabel: 'Pendidikan',
    appliesTo: 'expense',
    color: '#9F7AEA',
    badgeTheme: { bg: 'bg-[#E0E7FF]', text: 'text-[#4338CA]', border: 'border-[#C7D2FE]' },
    rowTheme: {
      bg: 'bg-gradient-to-tr from-[#D6E4FA] to-[#C9D8F5]',
      text: 'text-[#3E6FB0]',
      border: 'border-[#BED6F9]',
      rowHover: 'hover:bg-[#F0F5FE]/60',
    },
    aliases: ['education', 'pendidikan', 'edukasi', 'kursus', 'kuliah', 'buku'],
  },
  {
    id: 'social',
    label: 'Sosial & Donasi',
    shortLabel: 'Sosial',
    appliesTo: 'expense',
    color: '#F43F5E',
    badgeTheme: { bg: 'bg-[#FFE4E6]', text: 'text-[#BE123C]', border: 'border-[#FECDD3]' },
    rowTheme: {
      bg: 'bg-gradient-to-tr from-[#FFE4E6] to-[#FECDD3]',
      text: 'text-[#BE123C]',
      border: 'border-[#FECDD3]',
      rowHover: 'hover:bg-[#FFF1F2]/60',
    },
    aliases: ['social', 'sosial', 'sosial & donasi', 'donasi', 'sedekah', 'zakat', 'infaq', 'kado', 'kondangan', 'sumbangan'],
  },
  {
    id: 'debt',
    label: 'Cicilan & Utang',
    shortLabel: 'Cicilan',
    appliesTo: 'expense',
    color: '#EF4444',
    badgeTheme: { bg: 'bg-[#FEE2E2]', text: 'text-[#B91C1C]', border: 'border-[#FECACA]' },
    rowTheme: {
      bg: 'bg-gradient-to-tr from-[#FEE2E2] to-[#FECACA]',
      text: 'text-[#B91C1C]',
      border: 'border-[#FECACA]',
      rowHover: 'hover:bg-[#FEF2F2]/60',
    },
    aliases: ['debt', 'cicilan', 'cicilan & utang', 'utang', 'hutang', 'pinjaman', 'kpr', 'paylater', 'kartu kredit'],
  },
  {
    id: 'electronics',
    label: 'Elektronik & Gadget',
    shortLabel: 'Elektronik',
    appliesTo: 'expense',
    color: '#06B6D4',
    badgeTheme: { bg: 'bg-[#CFFAFE]', text: 'text-[#0E7490]', border: 'border-[#A5F3FC]' },
    rowTheme: {
      bg: 'bg-gradient-to-tr from-[#CFFAFE] to-[#A5F3FC]',
      text: 'text-[#0E7490]',
      border: 'border-[#A5F3FC]',
      rowHover: 'hover:bg-[#ECFEFF]/60',
    },
    aliases: ['electronics', 'elektronik', 'elektronik & gadget', 'gadget', 'smartphone', 'handphone', 'laptop', 'aksesoris'],
  },
  {
    id: 'salary',
    label: 'Gaji & Pendapatan',
    shortLabel: 'Gaji',
    appliesTo: 'income',
    color: '#10B981',
    badgeTheme: { bg: 'bg-[#D0EFE5]', text: 'text-[#1B7354]', border: 'border-[#A7E3D0]' },
    rowTheme: {
      bg: 'bg-gradient-to-tr from-[#D0EFE5] to-[#BCE6D9]',
      text: 'text-[#1B7354]',
      border: 'border-[#B2E9D7]',
      rowHover: 'hover:bg-[#EAF8F3]/50',
    },
    aliases: ['salary', 'gaji', 'gaji pokok', 'gaji & pendapatan', 'pendapatan', 'upah'],
  },
  {
    id: 'freelance',
    label: 'Freelance',
    shortLabel: 'Freelance',
    appliesTo: 'income',
    color: '#3B82F6',
    badgeTheme: { bg: 'bg-[#D0EFE5]', text: 'text-[#1B7354]', border: 'border-[#A7E3D0]' },
    rowTheme: {
      bg: 'bg-gradient-to-tr from-[#D0EFE5] to-[#BCE6D9]',
      text: 'text-[#1B7354]',
      border: 'border-[#B2E9D7]',
      rowHover: 'hover:bg-[#EAF8F3]/50',
    },
    aliases: ['freelance', 'proyek freelance', 'jasa', 'proyek'],
  },
  {
    id: 'bonus',
    label: 'Bonus & Hadiah',
    shortLabel: 'Bonus',
    appliesTo: 'income',
    color: '#10B981',
    badgeTheme: { bg: 'bg-[#D0EFE5]', text: 'text-[#1B7354]', border: 'border-[#A7E3D0]' },
    rowTheme: {
      bg: 'bg-gradient-to-tr from-[#D0EFE5] to-[#BCE6D9]',
      text: 'text-[#1B7354]',
      border: 'border-[#B2E9D7]',
      rowHover: 'hover:bg-[#EAF8F3]/50',
    },
    aliases: ['bonus', 'bonus & hadiah', 'hadiah', 'thr', 'komisi', 'cashback', 'reward', 'uang saku'],
  },
  {
    id: 'business',
    label: 'Penjualan & Bisnis',
    shortLabel: 'Bisnis',
    appliesTo: 'income',
    color: '#14B8A6',
    badgeTheme: { bg: 'bg-[#D0EFE5]', text: 'text-[#1B7354]', border: 'border-[#A7E3D0]' },
    rowTheme: {
      bg: 'bg-gradient-to-tr from-[#D0EFE5] to-[#BCE6D9]',
      text: 'text-[#1B7354]',
      border: 'border-[#B2E9D7]',
      rowHover: 'hover:bg-[#EAF8F3]/50',
    },
    aliases: ['business', 'bisnis', 'penjualan', 'penjualan & bisnis', 'usaha', 'dagang', 'omzet'],
  },
  {
    id: 'investment',
    label: 'Investasi',
    shortLabel: 'Investasi',
    appliesTo: 'income',
    color: '#F59E0B',
    badgeTheme: { bg: 'bg-[#D0EFE5]', text: 'text-[#1B7354]', border: 'border-[#A7E3D0]' },
    rowTheme: {
      bg: 'bg-gradient-to-tr from-[#D0EFE5] to-[#BCE6D9]',
      text: 'text-[#1B7354]',
      border: 'border-[#B2E9D7]',
      rowHover: 'hover:bg-[#EAF8F3]/50',
    },
    aliases: ['investment', 'investasi', 'dividen', 'dividen investasi', 'tabungan'],
  },
  {
    id: 'other',
    label: 'Lainnya',
    shortLabel: 'Lainnya',
    appliesTo: 'both',
    color: '#757A95',
    badgeTheme: { bg: 'bg-[#F4F3F9]', text: 'text-[#7C7CE6]', border: 'border-[#E4E2FB]' },
    rowTheme: {
      bg: 'bg-gradient-to-tr from-[#E4E2FB] to-[#DDD9FA]',
      text: 'text-[#7C7CE6]',
      border: 'border-[#D8D4FA]',
      rowHover: 'hover:bg-[#F3F2FF]/60',
    },
    aliases: ['other', 'lainnya', 'lain-lain'],
  },
];

export const EXPENSE_CATEGORIES = TRANSACTION_CATEGORIES.filter(
  (c) => c.appliesTo === 'expense' || c.appliesTo === 'both'
);

export const INCOME_CATEGORIES = TRANSACTION_CATEGORIES.filter(
  (c) => c.appliesTo === 'income' || c.appliesTo === 'both'
);

export const BUDGET_CATEGORIES = EXPENSE_CATEGORIES;

const TRANSACTION_ALIAS_MAP = new Map<string, TransactionCategoryMeta>();
for (const meta of TRANSACTION_CATEGORIES) {
  TRANSACTION_ALIAS_MAP.set(meta.id, meta);
  TRANSACTION_ALIAS_MAP.set(meta.label.toLowerCase(), meta);
  TRANSACTION_ALIAS_MAP.set(meta.shortLabel.toLowerCase(), meta);
  for (const alias of meta.aliases) {
    TRANSACTION_ALIAS_MAP.set(alias.toLowerCase(), meta);
  }
}

export function findTransactionCategory(raw?: string | null): TransactionCategoryMeta | undefined {
  if (!raw) return undefined;
  return TRANSACTION_ALIAS_MAP.get(raw.toLowerCase().trim());
}

export function normalizeTransactionCategory(raw?: string | null): TransactionCategory {
  return findTransactionCategory(raw)?.id ?? 'other';
}

export function normalizeCategoryKey(raw?: string | null): string {
  const matched = findTransactionCategory(raw);
  if (matched) return matched.id;
  const cleaned = raw?.toLowerCase().trim();
  return cleaned || 'other';
}

export function getTransactionCategoryLabel(
  raw?: string | null,
  variant: 'full' | 'short' = 'full'
): string {
  const matched = findTransactionCategory(raw);
  if (matched) {
    return variant === 'short' ? matched.shortLabel : matched.label;
  }
  const trimmed = raw?.trim();
  return trimmed || 'Lainnya';
}

export function getTransactionCategoryColor(raw?: string | null): string {
  return findTransactionCategory(raw)?.color ?? '#757A95';
}

export function getTransactionCategoryTheme(
  raw?: string | null,
  txType?: 'income' | 'expense'
) {
  const fallback = TRANSACTION_CATEGORIES[TRANSACTION_CATEGORIES.length - 1];
  const matched = findTransactionCategory(raw) ?? fallback;

  if (txType === 'income') {
    return {
      badge: { bg: 'bg-[#D0EFE5]', text: 'text-[#1B7354]', border: 'border-[#A7E3D0]' },
      row: {
        bg: 'bg-gradient-to-tr from-[#D0EFE5] to-[#BCE6D9]',
        text: 'text-[#1B7354]',
        border: 'border-[#B2E9D7]',
        rowHover: 'hover:bg-[#EAF8F3]/50',
      },
    };
  }

  return {
    badge: matched.badgeTheme,
    row: matched.rowTheme,
  };
}

// ---------------------------------------------------------------------------
// Goal Categories (Target Impian)
// ---------------------------------------------------------------------------

export interface GoalCategoryMeta {
  id: GoalCategoryType;
  label: string;
  shortLabel: string;
  aliases: string[];
}

export const GOAL_CATEGORIES: GoalCategoryMeta[] = [
  {
    id: 'laptop',
    label: 'Gadget / Laptop',
    shortLabel: 'Gadget',
    aliases: ['laptop', 'gadget', 'gadget / laptop', 'teknologi', 'teknologi & kerja'],
  },
  {
    id: 'travel',
    label: 'Liburan & Wisata',
    shortLabel: 'Liburan',
    aliases: ['travel', 'liburan', 'wisata', 'liburan & wisata'],
  },
  {
    id: 'emergency',
    label: 'Dana Darurat',
    shortLabel: 'Darurat',
    aliases: ['emergency', 'darurat', 'dana darurat'],
  },
  {
    id: 'vehicle',
    label: 'Kendaraan',
    shortLabel: 'Kendaraan',
    aliases: ['vehicle', 'kendaraan', 'motor', 'mobil'],
  },
  {
    id: 'home',
    label: 'Rumah & Properti',
    shortLabel: 'Properti',
    aliases: ['home', 'rumah', 'properti', 'rumah & properti'],
  },
  {
    id: 'course',
    label: 'Pendidikan',
    shortLabel: 'Pendidikan',
    aliases: ['course', 'pendidikan', 'edukasi', 'edukasi / kursus', 'kursus', 'kuliah'],
  },
  {
    id: 'wedding',
    label: 'Pernikahan',
    shortLabel: 'Pernikahan',
    aliases: ['wedding', 'pernikahan', 'nikah'],
  },
  {
    id: 'worship',
    label: 'Ibadah / Umroh',
    shortLabel: 'Ibadah',
    aliases: ['worship', 'ibadah', 'ibadah / umroh', 'umroh', 'haji', 'kurban'],
  },
  {
    id: 'business',
    label: 'Modal Usaha',
    shortLabel: 'Modal Usaha',
    aliases: ['business', 'modal usaha', 'usaha', 'bisnis', 'toko'],
  },
  {
    id: 'other',
    label: 'Lainnya',
    shortLabel: 'Lainnya',
    aliases: ['other', 'lainnya'],
  },
];

const GOAL_ALIAS_MAP = new Map<string, GoalCategoryMeta>();
for (const meta of GOAL_CATEGORIES) {
  GOAL_ALIAS_MAP.set(meta.id, meta);
  GOAL_ALIAS_MAP.set(meta.label.toLowerCase(), meta);
  for (const alias of meta.aliases) {
    GOAL_ALIAS_MAP.set(alias.toLowerCase(), meta);
  }
}

export function findGoalCategory(raw?: string | null): GoalCategoryMeta | undefined {
  if (!raw) return undefined;
  return GOAL_ALIAS_MAP.get(raw.toLowerCase().trim());
}

export function normalizeGoalCategory(raw?: string | null): GoalCategoryType {
  return findGoalCategory(raw)?.id ?? 'other';
}

export function getGoalCategoryLabel(raw?: string | null): string {
  const matched = findGoalCategory(raw);
  if (matched) return matched.label;
  const trimmed = raw?.trim();
  return trimmed || 'Lainnya';
}
