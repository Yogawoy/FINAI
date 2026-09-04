'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Building2,
  Wallet as WalletIcon,
  Banknote,
  CreditCard,
  PiggyBank,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import { Wallet, WalletColorTheme } from '@/types';
import { formatIDR } from '@/lib/format';

interface WalletCardProps {
  wallet: Wallet;
  onClick?: (wallet: Wallet) => void;
  onEdit?: (wallet: Wallet, e: React.MouseEvent) => void;
  onDelete?: (wallet: Wallet, e: React.MouseEvent) => void;
  isMasked?: boolean;
  className?: string;
  size?: 'normal' | 'large' | 'compact';
}

export const getWalletIconComponent = (iconName: string, size = 18) => {
  switch (iconName?.toLowerCase()) {
    case 'bank':
    case 'building2':
      return <Building2 size={size} />;
    case 'cash':
    case 'banknote':
      return <Banknote size={size} />;
    case 'card':
    case 'creditcard':
      return <CreditCard size={size} />;
    case 'savings':
    case 'piggybank':
      return <PiggyBank size={size} />;
    case 'investment':
    case 'trendingup':
      return <TrendingUp size={size} />;
    case 'other':
    case 'sparkles':
      return <Sparkles size={size} />;
    case 'wallet':
    default:
      return <WalletIcon size={size} />;
  }
};

export const getWalletThemeClasses = (theme: WalletColorTheme | string) => {
  switch (theme) {
    case 'blue':
      return {
        bgGradient: 'bg-gradient-to-br from-[#3B82F6] via-[#4F92FA] to-[#2563EB]',
        shadow: 'shadow-[0_14px_35px_rgba(59,130,246,0.32)]',
        chipBg: 'bg-white/20 text-white border-white/30',
        accentBg: 'bg-[#D6E4FA]',
        accentText: 'text-[#3E6FB0]',
      };
    case 'mint':
      return {
        bgGradient: 'bg-gradient-to-br from-[#10B981] via-[#1EB889] to-[#059669]',
        shadow: 'shadow-[0_14px_35px_rgba(16,185,129,0.32)]',
        chipBg: 'bg-white/20 text-white border-white/30',
        accentBg: 'bg-[#D0EFE5]',
        accentText: 'text-[#1B7354]',
      };
    case 'peach':
      return {
        bgGradient: 'bg-gradient-to-br from-[#F87171] via-[#FA8080] to-[#DC4B4B]',
        shadow: 'shadow-[0_14px_35px_rgba(248,113,113,0.32)]',
        chipBg: 'bg-white/20 text-white border-white/30',
        accentBg: 'bg-[#FCE2E0]',
        accentText: 'text-[#B83A38]',
      };
    case 'neutral':
      return {
        bgGradient: 'bg-gradient-to-br from-[#64748B] via-[#718096] to-[#475569]',
        shadow: 'shadow-[0_14px_35px_rgba(100,116,139,0.32)]',
        chipBg: 'bg-white/20 text-white border-white/30',
        accentBg: 'bg-[#E2E8F0]',
        accentText: 'text-[#475569]',
      };
    case 'lavender':
      return {
        bgGradient: 'bg-gradient-to-br from-[#8B82DF] via-[#A098E8] to-[#7B72D4]',
        shadow: 'shadow-[0_14px_35px_rgba(139,130,223,0.35)]',
        chipBg: 'bg-white/20 text-white border-white/30',
        accentBg: 'bg-[#E4E2FB]',
        accentText: 'text-[#5F5ED4]',
      };
    case 'periwinkle':
    default:
      return {
        bgGradient: 'bg-gradient-to-br from-[#6A69DC] via-[#7C7CE6] to-[#5554C8]',
        shadow: 'shadow-[0_14px_35px_rgba(106,105,220,0.35)]',
        chipBg: 'bg-white/20 text-white border-white/30',
        accentBg: 'bg-[#E4E2FB]',
        accentText: 'text-[#5F5ED4]',
      };
  }
};

export const formatWalletTypeLabel = (type: string) => {
  switch (type) {
    case 'bank':
      return 'Rekening Bank';
    case 'ewallet':
      return 'E-Wallet';
    case 'cash':
      return 'Uang Tunai';
    case 'savings':
      return 'Tabungan';
    case 'investment':
      return 'Investasi';
    default:
      return 'Lainnya';
  }
};

export default function WalletCard({
  wallet,
  onClick,
  onEdit,
  onDelete,
  isMasked = false,
  className = '',
  size = 'normal',
}: WalletCardProps) {
  const themeStyle = getWalletThemeClasses(wallet.colorTheme || 'periwinkle');

  // Format account identifier to 16-digit card look if short
  const formattedCardNumber = React.useMemo(() => {
    const raw = wallet.accountIdentifier || '4821';
    if (raw.includes('•••• •••• ••••')) return raw;
    if (raw.startsWith('•••• ')) return `•••• •••• ${raw}`;
    return `•••• •••• •••• ${raw.replace(/\D/g, '').slice(-4) || '4821'}`;
  }, [wallet.accountIdentifier]);

  return (
    <motion.div
      whileHover={onClick ? { y: -3, scale: 1.01 } : {}}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      onClick={() => onClick?.(wallet)}
      className={`relative w-full rounded-[24px] p-5 sm:p-6 text-white ${themeStyle.bgGradient} ${themeStyle.shadow} border border-white/30 overflow-hidden flex flex-col justify-between select-none min-h-[190px] sm:min-h-[205px] ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      {/* Decorative ambient background overlays */}
      <div className="absolute -right-8 -top-8 w-36 h-36 rounded-full bg-white/15 blur-xl pointer-events-none" />
      <div className="absolute -left-8 -bottom-8 w-32 h-32 rounded-full bg-black/10 blur-xl pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.22),transparent_70%)] pointer-events-none" />

      {/* Top Row: Brand on left & Frosted circular icon badge on right */}
      <div className="relative z-10 flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold tracking-wider text-white/90 drop-shadow-xs">
            Dompet FinAI
          </span>
        </div>

        {/* Circular frosted glass icon badge */}
        <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center text-white shadow-xs">
          {getWalletIconComponent(wallet.icon || 'Bank', 18)}
        </div>
      </div>

      {/* Middle Area: Wallet Name, Type & Large Balance */}
      <div className="relative z-10 my-auto pt-2 pb-1">
        <div className="flex items-baseline justify-between gap-2">
          <div>
            <h4 className="text-base sm:text-lg font-extrabold text-white tracking-tight leading-tight">
              {wallet.name || 'BCA'}
            </h4>
            <span className="text-[11px] font-medium text-white/80 block mt-0.5">
              {formatWalletTypeLabel(wallet.type)}
            </span>
          </div>
        </div>

        {/* Large Prominent Balance */}
        <div className="text-xl sm:text-2xl font-extrabold text-white tracking-tight tabular-nums mt-2">
          {isMasked ? 'Rp ••••••••' : formatIDR(wallet.balance)}
        </div>
      </div>

      {/* Bottom Area: Card Number, Holder Name & Expiry */}
      <div className="relative z-10 pt-2 space-y-1.5 border-t border-white/15">
        <div className="font-mono text-white/90 text-xs sm:text-[13px] tracking-widest">
          {formattedCardNumber}
        </div>

        <div className="flex items-center justify-between text-[11px] text-white/85 pt-0.5">
          <span className="font-semibold uppercase tracking-wide">
            {wallet.holderName || 'Yoga W.'}
          </span>
          <span className="font-mono text-white/75">
            {wallet.expiry || '08/26'}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
