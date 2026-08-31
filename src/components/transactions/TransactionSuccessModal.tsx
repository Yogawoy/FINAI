'use client';

import React from 'react';
import { CircleCheck, Sparkles } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { Transaction } from '@/types';
import { formatIDR } from '@/data/mockData';
import { getCategoryIcon } from './TransactionRow';

interface TransactionSuccessModalProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
  onViewTransaction: (tx: Transaction) => void;
  actionType?: 'added' | 'updated';
}

export default function TransactionSuccessModal({
  transaction,
  isOpen,
  onClose,
  onViewTransaction,
  actionType = 'added',
}: TransactionSuccessModalProps) {
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
        {/* Top Mint Checkmark Icon Area */}
        <div className="relative pt-2">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#D0EFE5] to-[#BCE6D9] border border-[#A8DFD0] text-[#1B7354] flex items-center justify-center mx-auto shadow-[0_8px_25px_rgba(27,115,84,0.18)]">
            <CircleCheck size={32} strokeWidth={2.4} />
          </div>
        </div>

        {/* Title & Subtitle */}
        <div className="space-y-1">
          <h3 className="text-lg sm:text-xl font-bold text-[#242636] tracking-tight">
            {actionType === 'updated' ? 'Transaksi Diperbarui' : 'Transaksi Berhasil'}
          </h3>
          <p className="text-xs sm:text-[13px] text-[#757A95] leading-relaxed max-w-xs mx-auto">
            Transaksi telah berhasil dicatat.
          </p>
        </div>

        {/* Transaction Preview Card */}
        <div className="p-3.5 rounded-2xl bg-[#F8F9FD] border border-black/[0.05] flex items-center justify-between text-left">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#EDEAFC] text-[#7C7CE6] border border-[#E4E2FB] flex items-center justify-center shrink-0">
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

          <div
            className={`text-xs sm:text-sm font-extrabold shrink-0 ml-2 ${
              transaction.type === 'income' ? 'text-[#1B7354]' : 'text-[#B83A38]'
            }`}
          >
            {transaction.type === 'income' ? '+' : '-'} {formatIDR(transaction.amount)}
          </div>
        </div>

        {/* Bottom Actions: View Transaction & Close */}
        <div className="space-y-2 pt-1">
          <button
            type="button"
            onClick={() => {
              onClose();
              onViewTransaction(transaction);
            }}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-[#208B67] to-[#1B7354] text-white font-bold text-xs sm:text-sm shadow-[0_8px_20px_rgba(27,115,84,0.3)] hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer"
          >
            Lihat Transaksi
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-1.5 text-center text-xs font-semibold text-[#757A95] hover:text-[#242636] transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </Modal>
  );
}
