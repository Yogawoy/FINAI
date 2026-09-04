'use client';

import React from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { Transaction } from '@/types';
import { formatIDR } from '@/lib/format';
import { getCategoryIcon } from './TransactionRow';

interface DeleteTransactionDialogProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelete: (txId: string) => void;
}

export default function DeleteTransactionDialog({
  transaction,
  isOpen,
  onClose,
  onConfirmDelete,
}: DeleteTransactionDialogProps) {
  if (!transaction) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="sm"
      hideHeader
      className="p-6 sm:p-7"
    >
      <div className="space-y-5 text-center relative">
        {/* Top Circular Warning & Trash Icon Area */}
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
            Hapus Transaksi?
          </h3>
          <p className="text-xs sm:text-[13px] text-[#757A95] leading-relaxed max-w-xs mx-auto">
            Apakah Anda yakin ingin menghapus transaksi ini? Tindakan ini tidak dapat dibatalkan.
          </p>
        </div>

        {/* Transaction Preview Card */}
        <div className="p-3.5 rounded-2xl bg-[#F8F9FD] border border-black/[0.05] flex items-center justify-between text-left">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#FFF0EF] text-[#B83A38] border border-[#FAD0CD] flex items-center justify-center shrink-0">
              {getCategoryIcon(transaction.category)}
            </div>
            <div className="min-w-0">
              <h4 className="text-xs sm:text-sm font-bold text-[#242636] truncate">
                {transaction.title}
              </h4>
              <span className="text-[11px] text-[#757A95]">
                {transaction.date} · {transaction.time}
              </span>
            </div>
          </div>

          <div className="text-xs sm:text-sm font-extrabold text-[#B83A38] shrink-0 ml-2">
            {transaction.type === 'income' ? '+' : '-'} {formatIDR(transaction.amount)}
          </div>
        </div>

        {/* Bottom Actions: Cancel & Delete */}
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
              onConfirmDelete(transaction.id);
              onClose();
            }}
            className="py-2.5 px-4 rounded-2xl bg-[#FCE2E0] hover:bg-[#FAD0CD] text-[#B83A38] font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 border border-[#FAC2BE] shadow-2xs hover:brightness-95 active:scale-[0.98] transition-all cursor-pointer"
          >
            <Trash2 size={14} />
            <span>Hapus Transaksi</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}
