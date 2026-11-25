'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Wifi } from 'lucide-react';
import { Wallet, WalletColorTheme } from '@/types';
import { formatIDR } from '@/lib/format';
import {
  getWalletTheme,
  getWalletIcon,
  getWalletTypeLabels,
  formatEmbossedCardNumber,
} from '@/lib/walletTheme';
import {
  CardMaterialLayers,
  EmvGoldChip,
  CardNetworkEmblem,
} from '@/components/wallet/PhysicalCardSurface';

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
  return getWalletIcon(iconName, size);
};

export const getWalletThemeClasses = (theme: WalletColorTheme | string) => {
  const resolved = getWalletTheme({ color: theme });
  return {
    bgGradient: resolved.bgGradient,
    shadow: resolved.shadow,
    chipBg: resolved.chipBg,
    accentBg: resolved.accentBg,
    accentText: resolved.accentText,
  };
};

export const formatWalletTypeLabel = (type: string) => {
  const { typeLabel } = getWalletTypeLabels(type);
  switch ((type || '').toLowerCase()) {
    case 'bank':
      return 'Rekening Bank';
    case 'ewallet':
    case 'e_wallet':
      return 'E-Wallet';
    case 'cash':
      return 'Uang Tunai';
    default:
      return typeLabel;
  }
};

export default function WalletCard({
  wallet,
  onClick,
  isMasked = false,
  className = '',
}: WalletCardProps) {
  const theme = getWalletTheme({
    id: wallet.id,
    name: wallet.name,
    type: wallet.type,
    colorTheme: wallet.colorTheme,
    icon: wallet.icon,
  });

  const formattedCardNumber = React.useMemo(
    () => formatEmbossedCardNumber(wallet.accountIdentifier),
    [wallet.accountIdentifier]
  );

  return (
    <motion.div
      whileHover={onClick ? { y: -3, scale: 1.01 } : {}}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      onClick={() => onClick?.(wallet)}
      className={`group relative w-full h-[215px] sm:h-[225px] rounded-2xl p-5 text-white ${theme.bgGradient} ${theme.shadow} border border-white/25 ring-1 ring-inset ring-white/15 overflow-hidden flex flex-col justify-between select-none ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      <CardMaterialLayers enableHoverSweep />

      {/* Top Row: Nama Dompet & Sublabel Mikro (Kiri) + Emblem Jaringan Minimalis & Ikon Tipe (Kanan) */}
      <div className="relative z-10 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h4 className="text-sm sm:text-[15px] font-bold tracking-wide text-white truncate leading-tight drop-shadow-[0_1px_1px_rgba(0,0,0,0.18)]">
            {wallet.name || 'Dompet FinAI'}
          </h4>
          <span className="text-[9px] tracking-[0.22em] uppercase text-white/70 font-semibold block mt-0.5 leading-none">
            {theme.subLabel}
          </span>
        </div>

        <CardNetworkEmblem icon={getWalletIcon(wallet, 14)} />
      </div>

      {/* Middle Row: Chip EMV Emas Metalik + Contactless (Kiri) & Saldo Tersedia (Kanan) */}
      <div className="relative z-10 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 shrink-0">
          <EmvGoldChip idSuffix={`col-${wallet.id}`} />
          <Wifi
            size={17}
            className="text-white/80 rotate-90 drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)]"
            aria-hidden="true"
          />
        </div>

        <div className="text-right min-w-0">
          <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.16em] text-white/75 block mb-0.5">
            SALDO TERSEDIA
          </span>
          <div className="text-xl sm:text-2xl font-bold tracking-tight text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.22)] tabular-nums truncate leading-tight">
            {isMasked ? 'Rp ••••••••' : formatIDR(wallet.balance)}
          </div>
        </div>
      </div>

      {/* Bottom Row: Nomor Kartu Embossed + Card Holder & Valid Thru */}
      <div className="relative z-10 space-y-2">
        <div className="font-mono text-[14px] sm:text-[15px] tracking-[0.22em] text-white/95 drop-shadow-[0_1.5px_1px_rgba(0,0,0,0.38)] truncate">
          {formattedCardNumber}
        </div>

        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <span className="text-[8px] tracking-[0.18em] text-white/60 uppercase block leading-none mb-1">
              CARD HOLDER
            </span>
            <span className="text-xs font-semibold tracking-[0.14em] uppercase text-white/95 truncate block leading-none drop-shadow-[0_1px_1px_rgba(0,0,0,0.25)]">
              {wallet.holderName || 'PENGGUNA FINAI'}
            </span>
          </div>

          <div className="text-right shrink-0">
            <span className="text-[8px] tracking-[0.18em] text-white/60 uppercase block leading-none mb-1">
              VALID THRU
            </span>
            <span className="font-mono text-xs tracking-widest text-white/90 leading-none block drop-shadow-[0_1px_1px_rgba(0,0,0,0.25)]">
              {wallet.expiry || '11/29'}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
