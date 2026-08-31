'use client';

import React from 'react';
import { CircleCheck } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { Wallet } from '@/types';
import { formatIDR } from '@/data/mockData';
import { getWalletIconComponent, formatWalletTypeLabel } from './WalletCard';

interface WalletSuccessModalProps {
  wallet: Wallet | null;
  isOpen: boolean;
  onClose: () => void;
  onViewWallets: () => void;
  onAddAnother: () => void;
}

export default function WalletSuccessModal({
  wallet,
  isOpen,
  onClose,
  onViewWallets,
  onAddAnother,
}: WalletSuccessModalProps) {
  if (!wallet) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="sm"
      hideHeader
      className="p-6 sm:p-7"
    >
      <div className="space-y-5 text-center relative">
        {/* Top Mint Checkmark Area */}
        <div className="relative pt-2">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#D0EFE5] to-[#BCE6D9] border border-[#A8DFD0] text-[#1B7354] flex items-center justify-center mx-auto shadow-[0_8px_25px_rgba(27,115,84,0.18)]">
            <CircleCheck size={32} strokeWidth={2.4} />
          </div>
        </div>

        {/* Title & Description */}
        <div className="space-y-1">
          <h3 className="text-lg sm:text-xl font-bold text-[#242636] tracking-tight">
            Dompet Berhasil Dibuat
          </h3>
          <p className="text-xs sm:text-[13px] text-[#757A95] leading-relaxed max-w-xs mx-auto">
            Dompet baru telah berhasil ditambahkan.
          </p>
        </div>

        {/* Wallet Preview Card */}
        <div className="p-3.5 rounded-2xl bg-[#F8F9FD] border border-black/[0.05] flex items-center justify-between text-left">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#E4E2FB] text-[#7C7CE6] flex items-center justify-center shrink-0">
              {getWalletIconComponent(wallet.icon || 'Bank', 18)}
            </div>
            <div className="min-w-0">
              <h4 className="text-xs sm:text-sm font-bold text-[#242636] truncate">
                {wallet.name}
              </h4>
              <span className="text-[11px] text-[#757A95]">
                {formatWalletTypeLabel(wallet.type)}
              </span>
            </div>
          </div>

          <div className="text-right shrink-0 ml-2">
            <div className="text-xs sm:text-sm font-extrabold text-[#242636] tabular-nums">
              {formatIDR(wallet.balance)}
            </div>
            <span className="font-mono text-[10px] text-[#757A95]">
              {wallet.accountIdentifier || '•••• 4821'}
            </span>
          </div>
        </div>

        {/* Action Buttons: View My Wallets & Add Another Wallet */}
        <div className="space-y-2 pt-1">
          <button
            type="button"
            onClick={() => {
              onClose();
              onViewWallets();
            }}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-[#7C7CE6] to-[#8C8BE8] text-white font-bold text-xs sm:text-sm shadow-[0_8px_20px_rgba(124,124,230,0.35)] hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer"
          >
            Lihat Dompet Saya
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onAddAnother();
            }}
            className="w-full py-1.5 text-center text-xs font-semibold text-[#757A95] hover:text-[#242636] transition-colors cursor-pointer"
          >
            Tambah Dompet Lainnya
          </button>
        </div>
      </div>
    </Modal>
  );
}
