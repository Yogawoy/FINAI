'use client';

import React from 'react';
import { Trash2, AlertTriangle, AlertCircle } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { Wallet } from '@/types';
import { formatIDR } from '@/data/mockData';
import { getWalletIconComponent, formatWalletTypeLabel } from './WalletCard';

interface DeleteWalletModalProps {
  wallet: Wallet | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelete: (walletId: string) => void;
}

export default function DeleteWalletModal({
  wallet,
  isOpen,
  onClose,
  onConfirmDelete,
}: DeleteWalletModalProps) {
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
        {/* Top Soft Coral Trash Icon with Warning Badge */}
        <div className="relative pt-2">
          <div className="w-16 h-16 rounded-full bg-[#FFF0EF] border border-[#FAD0CD] text-[#B83A38] flex items-center justify-center mx-auto shadow-[0_8px_25px_rgba(184,58,56,0.12)] relative">
            <Trash2 size={24} strokeWidth={2.2} />
            {/* Small exclamation badge */}
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#B83A38] text-white flex items-center justify-center border-2 border-white shadow-xs">
              <AlertTriangle size={12} />
            </div>
          </div>
        </div>

        {/* Title & Description */}
        <div className="space-y-1">
          <h3 className="text-lg sm:text-xl font-bold text-[#242636] tracking-tight">
            Hapus Dompet?
          </h3>
          <p className="text-xs sm:text-[13px] text-[#757A95] leading-relaxed max-w-xs mx-auto">
            Dompet dan data mutasi terkait akan dihapus secara permanen.
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
              <div className="text-[11px] text-[#757A95]">
                <span>{formatWalletTypeLabel(wallet.type)}</span>
                <span className="block text-[10px] mt-0.5">Dibuat: {wallet.createdDate || '15 Jul 2026'}</span>
              </div>
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

        {/* Warning Banner */}
        <div className="p-2.5 rounded-xl bg-[#FFF1F0] border border-[#FAC2BE] flex items-center gap-2 text-left text-xs font-semibold text-[#B83A38]">
          <AlertCircle size={15} className="shrink-0" />
          <span>Seluruh catatan transaksi yang terhubung dengan dompet ini juga akan terhapus.</span>
        </div>

        {/* Bottom Action Buttons: Cancel & Delete Wallet */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-4 rounded-2xl bg-black/[0.03] hover:bg-black/[0.06] text-[#757A95] hover:text-[#242636] font-bold text-xs sm:text-sm transition-all cursor-pointer"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={() => {
              onConfirmDelete(wallet.id);
              onClose();
            }}
            className="py-2.5 px-4 rounded-2xl bg-[#FCE2E0] hover:bg-[#FAD0CD] text-[#B83A38] font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 border border-[#FAC2BE] transition-all shadow-2xs active:scale-[0.98] cursor-pointer"
          >
            <Trash2 size={14} />
            <span>Hapus Dompet</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}
