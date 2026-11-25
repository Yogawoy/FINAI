import React from 'react';
import {
  Building2,
  Smartphone,
  Banknote,
  CreditCard,
  PiggyBank,
  TrendingUp,
  Sparkles,
} from 'lucide-react';

export interface WalletThemeInput {
  id?: string;
  name?: string | null;
  type?: string | null;
  color?: string | null;
  colorTheme?: string | null;
  icon?: string | null;
  institution?: string | null;
}

export interface WalletTheme {
  key: 'indigo' | 'teal' | 'blue' | 'slate' | 'navy' | 'peach' | 'lavender';
  gradient: string;
  bgGradient: string;
  glow: string;
  shadow: string;
  accentBg: string;
  accentText: string;
  chipBg: string;
  subLabel: string;
  typeLabel: string;
}

const THEMES: Record<WalletTheme['key'], Omit<WalletTheme, 'subLabel' | 'typeLabel'>> = {
  indigo: {
    key: 'indigo',
    gradient: 'from-[#818CF8] via-[#6366F1] to-[#4F46E5]',
    bgGradient: 'bg-gradient-to-br from-[#818CF8] via-[#6366F1] to-[#4F46E5]',
    glow: 'bg-[#6366F1]',
    shadow: 'shadow-[0_18px_36px_-10px_rgba(79,70,229,0.42)]',
    accentBg: 'bg-[#E4E2FB]',
    accentText: 'text-[#4F46E5]',
    chipBg: 'bg-white/20 text-white border-white/30',
  },
  teal: {
    key: 'teal',
    gradient: 'from-[#14B8A6] via-[#0D9488] to-[#0F766E]',
    bgGradient: 'bg-gradient-to-br from-[#14B8A6] via-[#0D9488] to-[#0F766E]',
    glow: 'bg-[#0D9488]',
    shadow: 'shadow-[0_18px_36px_-10px_rgba(13,148,136,0.40)]',
    accentBg: 'bg-[#CCFBF1]',
    accentText: 'text-[#0F766E]',
    chipBg: 'bg-white/20 text-white border-white/30',
  },
  blue: {
    key: 'blue',
    gradient: 'from-[#4B89FF] via-[#3B7AF5] to-[#2563EB]',
    bgGradient: 'bg-gradient-to-br from-[#4B89FF] via-[#3B7AF5] to-[#2563EB]',
    glow: 'bg-[#2563EB]',
    shadow: 'shadow-[0_18px_36px_-10px_rgba(37,99,235,0.42)]',
    accentBg: 'bg-[#DBEAFE]',
    accentText: 'text-[#1D4ED8]',
    chipBg: 'bg-white/20 text-white border-white/30',
  },
  slate: {
    key: 'slate',
    gradient: 'from-[#475569] via-[#334155] to-[#1E293B]',
    bgGradient: 'bg-gradient-to-br from-[#475569] via-[#334155] to-[#1E293B]',
    glow: 'bg-[#334155]',
    shadow: 'shadow-[0_18px_36px_-10px_rgba(30,41,59,0.42)]',
    accentBg: 'bg-[#E2E8F0]',
    accentText: 'text-[#334155]',
    chipBg: 'bg-white/20 text-white border-white/30',
  },
  navy: {
    key: 'navy',
    gradient: 'from-[#4F46E5] via-[#3730A3] to-[#1E1B4B]',
    bgGradient: 'bg-gradient-to-br from-[#4F46E5] via-[#3730A3] to-[#1E1B4B]',
    glow: 'bg-[#3730A3]',
    shadow: 'shadow-[0_18px_36px_-10px_rgba(49,46,129,0.45)]',
    accentBg: 'bg-[#E0E7FF]',
    accentText: 'text-[#3730A3]',
    chipBg: 'bg-white/20 text-white border-white/30',
  },
  peach: {
    key: 'peach',
    gradient: 'from-[#FB7185] via-[#F43F5E] to-[#E11D48]',
    bgGradient: 'bg-gradient-to-br from-[#FB7185] via-[#F43F5E] to-[#E11D48]',
    glow: 'bg-[#F43F5E]',
    shadow: 'shadow-[0_18px_36px_-10px_rgba(225,29,72,0.38)]',
    accentBg: 'bg-[#FFE4E6]',
    accentText: 'text-[#BE123C]',
    chipBg: 'bg-white/20 text-white border-white/30',
  },
  lavender: {
    key: 'lavender',
    gradient: 'from-[#A78BFA] via-[#8B5CF6] to-[#6D28D9]',
    bgGradient: 'bg-gradient-to-br from-[#A78BFA] via-[#8B5CF6] to-[#6D28D9]',
    glow: 'bg-[#8B5CF6]',
    shadow: 'shadow-[0_18px_36px_-10px_rgba(109,40,217,0.40)]',
    accentBg: 'bg-[#EDE9FE]',
    accentText: 'text-[#6D28D9]',
    chipBg: 'bg-white/20 text-white border-white/30',
  },
};

export function getWalletTypeLabels(type?: string | null): {
  subLabel: string;
  typeLabel: string;
} {
  switch ((type || '').toLowerCase()) {
    case 'bank':
      return { subLabel: 'DEBIT CARD', typeLabel: 'Bank' };
    case 'e_wallet':
    case 'ewallet':
      return { subLabel: 'E-WALLET CARD', typeLabel: 'E-Wallet' };
    case 'cash':
      return { subLabel: 'CASH RESERVE', typeLabel: 'Tunai' };
    case 'savings':
      return { subLabel: 'SAVINGS', typeLabel: 'Tabungan' };
    case 'investment':
      return { subLabel: 'INVESTMENT', typeLabel: 'Investasi' };
    default:
      return { subLabel: 'FINAI CARD', typeLabel: type || 'Rekening' };
  }
}

export function getWalletTheme(wallet: WalletThemeInput): WalletTheme {
  const { subLabel, typeLabel } = getWalletTypeLabels(wallet.type);
  const rawColor = (wallet.color ?? wallet.colorTheme ?? '').trim().toLowerCase();
  const isPreview = wallet.id === 'preview-card';

  const resolveKey = (): WalletTheme['key'] => {
    // 1. Explicit custom color selection (ignore DB default 'periwinkle' unless previewing)
    if (rawColor) {
      if (rawColor === 'blue') return 'blue';
      if (rawColor === 'mint' || rawColor === 'teal') return 'teal';
      if (rawColor === 'neutral' || rawColor === 'slate') return 'slate';
      if (rawColor === 'peach') return 'peach';
      if (rawColor === 'lavender') return 'lavender';
      if (rawColor === 'navy') return 'navy';
      if (rawColor === 'indigo') return 'indigo';
      if (rawColor === 'periwinkle' && isPreview) return 'indigo';
    }

    // 2. Semantic detection from wallet name / institution
    const text = `${wallet.name || ''} ${wallet.institution || ''}`.toLowerCase();
    if (/(gopay|ovo|dana|shopeepay|linkaja|isaku|sakuku|e-?wallet)/i.test(text)) {
      return 'teal';
    }
    if (/(bca|mandiri|bri|bni|cimb|permata|danamon|btn|bsi|jago|jenius|seabank|ocbc|panin)/i.test(text)) {
      return 'blue';
    }
    if (/(cash|tunai|dompet fisik|kas\b)/i.test(text)) {
      return 'slate';
    }

    // 3. Fallback by wallet type
    switch ((wallet.type || '').toLowerCase()) {
      case 'e_wallet':
      case 'ewallet':
        return 'teal';
      case 'cash':
        return 'slate';
      case 'savings':
      case 'investment':
        return 'navy';
      case 'bank':
        return 'indigo';
      default:
        return 'indigo';
    }
  };

  const palette = THEMES[resolveKey()];
  return {
    ...palette,
    subLabel,
    typeLabel,
  };
}

export function getWalletIcon(
  walletOrType: WalletThemeInput | string | null | undefined,
  size = 18
): React.ReactNode {
  const iconHint =
    typeof walletOrType === 'string'
      ? walletOrType
      : walletOrType?.type || walletOrType?.icon || '';

  switch (iconHint.toLowerCase()) {
    case 'bank':
    case 'building2':
      return React.createElement(Building2, { size });
    case 'e_wallet':
    case 'ewallet':
    case 'smartphone':
    case 'wallet':
      return React.createElement(Smartphone, { size });
    case 'cash':
    case 'banknote':
      return React.createElement(Banknote, { size });
    case 'savings':
    case 'piggybank':
      return React.createElement(PiggyBank, { size });
    case 'investment':
    case 'trendingup':
      return React.createElement(TrendingUp, { size });
    case 'other':
    case 'sparkles':
      return React.createElement(Sparkles, { size });
    case 'card':
    case 'creditcard':
    default:
      return React.createElement(CreditCard, { size });
  }
}

export const CARD_NOISE_TEXTURE_URI =
  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.9'/%3E%3C/svg%3E\")";

export function formatEmbossedCardNumber(rawIdentifier?: string | null): string {
  const raw = (rawIdentifier || '').trim();
  const digits = raw.replace(/\D/g, '');
  const last4 = digits.length >= 4 ? digits.slice(-4) : '4821';
  return `••••  ••••  ••••  ${last4}`;
}
