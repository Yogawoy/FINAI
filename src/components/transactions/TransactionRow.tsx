'use client';

import React from 'react';
import {
  Utensils,
  Car,
  Coffee,
  ShoppingBag,
  Zap,
  Film,
  Heart,
  BookOpen,
  Sparkles,
  Building,
  TrendingUp,
  Pencil,
  Trash2,
} from 'lucide-react';
import { Transaction } from '@/types';
import { formatIDR } from '@/lib/format';

interface TransactionRowProps {
  transaction: Transaction;
  onClick: (tx: Transaction) => void;
  onEdit: (tx: Transaction, e: React.MouseEvent) => void;
  onDelete: (tx: Transaction, e: React.MouseEvent) => void;
}

export const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'food':
      return <Utensils size={18} />;
    case 'transport':
      return <Car size={18} />;
    case 'coffee':
      return <Coffee size={18} />;
    case 'shopping':
      return <ShoppingBag size={18} />;
    case 'bills':
      return <Zap size={18} />;
    case 'entertainment':
      return <Film size={18} />;
    case 'health':
      return <Heart size={18} />;
    case 'education':
      return <BookOpen size={18} />;
    case 'salary':
      return <Building size={18} />;
    case 'freelance':
      return <Sparkles size={18} />;
    case 'investment':
      return <TrendingUp size={18} />;
    default:
      return <Sparkles size={18} />;
  }
};

export const getCategoryColor = (category: string, type: 'income' | 'expense') => {
  if (type === 'income') {
    return {
      bg: 'bg-gradient-to-tr from-[#D0EFE5] to-[#BCE6D9]',
      text: 'text-[#1B7354]',
      border: 'border-[#B2E9D7]',
      rowHover: 'hover:bg-[#EAF8F3]/50',
    };
  }

  switch (category) {
    case 'food':
      return {
        bg: 'bg-gradient-to-tr from-[#E4E2FB] to-[#DDD9FA]',
        text: 'text-[#7C7CE6]',
        border: 'border-[#D8D4FA]',
        rowHover: 'hover:bg-[#F3F2FF]/60',
      };
    case 'transport':
      return {
        bg: 'bg-gradient-to-tr from-[#D6E4FA] to-[#C9D8F5]',
        text: 'text-[#3E6FB0]',
        border: 'border-[#BED6F9]',
        rowHover: 'hover:bg-[#F0F5FE]/60',
      };
    case 'bills':
      return {
        bg: 'bg-gradient-to-tr from-[#FCE2E0] to-[#FAD4D2]',
        text: 'text-[#B83A38]',
        border: 'border-[#FAC2BE]',
        rowHover: 'hover:bg-[#FFF2F1]/60',
      };
    case 'entertainment':
      return {
        bg: 'bg-gradient-to-tr from-[#EBE9FE] to-[#DFDCFD]',
        text: 'text-[#6B66DA]',
        border: 'border-[#D5D2FB]',
        rowHover: 'hover:bg-[#F5F4FF]/60',
      };
    case 'shopping':
      return {
        bg: 'bg-gradient-to-tr from-[#D0EFE5] to-[#BCE6D9]',
        text: 'text-[#1B7354]',
        border: 'border-[#B2E9D7]',
        rowHover: 'hover:bg-[#EAF8F3]/50',
      };
    case 'health':
      return {
        bg: 'bg-gradient-to-tr from-[#FCE2E0] to-[#FAD4D2]',
        text: 'text-[#B83A38]',
        border: 'border-[#FAC2BE]',
        rowHover: 'hover:bg-[#FFF2F1]/60',
      };
    case 'education':
      return {
        bg: 'bg-gradient-to-tr from-[#D6E4FA] to-[#C9D8F5]',
        text: 'text-[#3E6FB0]',
        border: 'border-[#BED6F9]',
        rowHover: 'hover:bg-[#F0F5FE]/60',
      };
    default:
      return {
        bg: 'bg-gradient-to-tr from-[#E4E2FB] to-[#DDD9FA]',
        text: 'text-[#7C7CE6]',
        border: 'border-[#D8D4FA]',
        rowHover: 'hover:bg-[#F3F2FF]/60',
      };
  }
};

export const formatCategoryLabel = (category: string) => {
  switch (category) {
    case 'food':
      return 'Makanan & Minuman';
    case 'transport':
      return 'Transportasi';
    case 'bills':
      return 'Tagihan & Utilitas';
    case 'entertainment':
      return 'Hiburan';
    case 'shopping':
      return 'Belanja';
    case 'health':
      return 'Kesehatan';
    case 'education':
      return 'Pendidikan';
    case 'salary':
      return 'Gaji Pokok';
    case 'freelance':
      return 'Proyek Freelance';
    case 'investment':
      return 'Dividen Investasi';
    default:
      return 'Lainnya';
  }
};

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
