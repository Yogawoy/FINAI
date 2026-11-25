'use client';

import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { Transaction } from '@/types';
import {
  getTransactionCategoryLabel,
  getTransactionCategoryTheme,
} from '@/lib/categories';
import { renderTransactionCategoryIcon } from '@/components/categories/CategoryIcon';
import { formatIDR } from '@/lib/format';

interface TransactionRowProps {
  transaction: Transaction;
  onClick: (tx: Transaction) => void;
  onEdit: (tx: Transaction, e: React.MouseEvent) => void;
  onDelete: (tx: Transaction, e: React.MouseEvent) => void;
}

export const getCategoryIcon = (category: string) =>
  renderTransactionCategoryIcon(category, 18);

export const getCategoryColor = (category: string, type: 'income' | 'expense') =>
  getTransactionCategoryTheme(category, type).row;

export const formatCategoryLabel = (category: string) =>
  getTransactionCategoryLabel(category);

export default function TransactionRow({
  transaction,
  onClick,
  onEdit,
  onDelete,
}: TransactionRowProps) {
  const isIncome = transaction.type === 'income';
  const colorStyle = getCategoryColor(transaction.category, transaction.type);

  return (
    <div
      onClick={() => onClick(transaction)}
      className={`group relative flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-white/70 ${colorStyle.rowHover} hover:bg-white border border-transparent hover:border-black/[0.04] hover:shadow-[0_6px_25px_rgba(48,51,74,0.05)] transition-all cursor-pointer select-none`}
    >
      {/* Sisi Kiri: Ikon + Nama Transaksi + Metadata */}
      <div className="flex items-center gap-3.5 min-w-0">
        {/* Ikon Kategori dengan Gradien Lembut */}
        <div
          className={`w-11 h-11 rounded-2xl ${colorStyle.bg} ${colorStyle.text} border ${colorStyle.border} flex items-center justify-center shrink-0 shadow-xs group-hover:scale-108 transition-transform`}
        >
          {getCategoryIcon(transaction.category)}
        </div>

        {/* Nama & Info */}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm sm:text-[15px] font-bold text-[#242636] group-hover:text-[#7C7CE6] transition-colors truncate">
              {transaction.title}
            </h4>
            {transaction.paymentMethod && (
              <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-black/[0.03] border border-black/[0.04] text-[10px] font-bold text-[#757A95]">
                {transaction.paymentMethod}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-[#757A95] mt-0.5">
            <span className="font-medium">{formatCategoryLabel(transaction.category)}</span>
            <span>·</span>
            <span>{transaction.time}</span>
          </div>
        </div>
      </div>

      {/* Sisi Kanan: Nominal + Tombol Aksi Cepat */}
      <div className="flex items-center gap-3 shrink-0 ml-3">
        {/* Nominal */}
        <div
          className={`text-sm sm:text-base font-extrabold tabular-nums text-right ${
            isIncome ? 'text-[#1B7354]' : 'text-[#242636]'
          }`}
        >
          {isIncome ? '+' : '-'}{formatIDR(transaction.amount)}
        </div>

        {/* Tombol Aksi Hover (Desktop) */}
        <div className="hidden sm:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={(e) => onEdit(transaction, e)}
            className="p-1.5 rounded-xl bg-[#E4E2FB]/70 hover:bg-[#E4E2FB] text-[#7C7CE6] transition-colors cursor-pointer border border-[#7C7CE6]/20"
            title="Ubah Transaksi"
          >
            <Pencil size={13} />
          </button>
          <button
            type="button"
            onClick={(e) => onDelete(transaction, e)}
            className="p-1.5 rounded-xl bg-[#FCE2E0]/70 hover:bg-[#FCE2E0] text-[#B83A38] transition-colors cursor-pointer border border-[#B83A38]/20"
            title="Hapus Transaksi"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
