'use client';

import React from 'react';
import { Archive, AlertCircle } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { Wallet } from '@/types';
import { formatIDR } from '@/data/mockData';
import { getWalletIconComponent, getWalletThemeClasses } from './WalletCard';

interface ArchiveWalletDialogProps {
  wallet: Wallet | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmArchive: (walletId: string) => void;
}

export default function ArchiveWalletDialog({
  wallet,
  isOpen,
  onClose,
  onConfirmArchive,
}: ArchiveWalletDialogProps) {
  if (!wallet) return null;

  const themeStyle = getWalletThemeClasses(wallet.colorTheme || 'periwinkle');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="sm"
      hideHeader
      className="p-6 sm:p-7"
    >
      <div className="space-y-5 text-center relative">
        {/* Top Icon */}
        <div className="relative pt-2">
          <div className="w-16 h-16 rounded-full bg-[#FFF0EF] border border-[#FAD0CD] text-[#B83A38] flex items-center justify-center mx-auto shadow-[0_8px_25px_rgba(184,58,56,0.12)]">
            <Archive size={26} />
          </div>
        </div>

        {/* Title & Description */}
        <div className="space-y-1">
          <h3 className="text-lg sm:text-xl font-bold text-[#242636] tracking-tight">
            Archive this wallet?
          </h3>
          <p className="text-xs sm:text-[13px] text-[#757A95] leading-relaxed max-w-xs mx-auto">
            Your transaction history will remain available. The wallet will no longer appear in your active wallet list.
          </p>
        </div>

        {/* Wallet Preview Item */}
        <div className="p-3.5 rounded-2xl bg-[#F8F9FD] border border-black/[0.05] flex items-center justify-between text-left">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-10 h-10 rounded-xl ${themeStyle.accentBg} ${themeStyle.accentText} flex items-center justify-center shrink-0`}>
              {getWalletIconComponent(wallet.icon)}
            </div>
            <div className="min-w-0">
              <h4 className="text-xs sm:text-sm font-bold text-[#242636] truncate">
                {wallet.name}
              </h4>
              <span className="text-[11px] text-[#757A95]">
                {wallet.accountIdentifier || 'Active Wallet'}
              </span>
            </div>
          </div>

          <div className="text-xs sm:text-sm font-extrabold text-[#242636] tabular-nums shrink-0 ml-2">
            {formatIDR(wallet.balance)}
          </div>
        </div>

        {/* Buttons: Cancel & Archive */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-4 rounded-2xl bg-black/[0.03] hover:bg-black/[0.06] text-[#757A95] hover:text-[#242636] font-bold text-xs sm:text-sm transition-all cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() => {
              onConfirmArchive(wallet.id);
              onClose();
            }}
            className="py-2.5 px-4 rounded-2xl bg-gradient-to-r from-[#DE4C49] to-[#C93B38] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-[0_8px_20px_rgba(222,76,73,0.3)] hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer"
          >
            <Archive size={14} />
            <span>Archive</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}
