'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Utensils,
  Car,
  Film,
  ShoppingBag,
  Zap,
  Heart,
  BookOpen,
  Sparkles,
  Pencil,
  MoreVertical,
  Trash2,
  Eye,
  Copy,
} from 'lucide-react';
import { BudgetCategory, TransactionCategory } from '@/types';
import { formatIDR } from '@/lib/format';
import BudgetProgress from './BudgetProgress';
import BudgetHealth, { computeBudgetHealth } from './BudgetHealth';

export const getCategoryIconComponent = (category: TransactionCategory | string, size = 18) => {
  switch (category) {
    case 'food':
      return <Utensils size={size} />;
    case 'transport':
      return <Car size={size} />;
    case 'entertainment':
      return <Film size={size} />;
    case 'shopping':
      return <ShoppingBag size={size} />;
    case 'bills':
      return <Zap size={size} />;
    case 'health':
      return <Heart size={size} />;
    case 'education':
      return <BookOpen size={size} />;
    default:
      return <Sparkles size={size} />;
  }
};

export const getCategoryColorTheme = (category: TransactionCategory | string) => {
  switch (category) {
    case 'food':
      return { bg: 'bg-[#EDEAFC]', text: 'text-[#5F5ED4]', border: 'border-[#E4E2FB]' };
    case 'transport':
      return { bg: 'bg-[#D6E4FA]/60', text: 'text-[#3B6DB0]', border: 'border-[#BED6F9]' };
    case 'entertainment':
      return { bg: 'bg-[#FEF3C7]', text: 'text-[#B45309]', border: 'border-[#FDE68A]' };
    case 'shopping':
      return { bg: 'bg-[#D0EFE5]', text: 'text-[#1B7354]', border: 'border-[#A7E3D0]' };
    case 'bills':
      return { bg: 'bg-[#FCE2E0]', text: 'text-[#B83A38]', border: 'border-[#FAD0CD]' };
    case 'health':
      return { bg: 'bg-[#FCE7F3]', text: 'text-[#BE185D]', border: 'border-[#FBCFE8]' };
    case 'education':
      return { bg: 'bg-[#E0E7FF]', text: 'text-[#4338CA]', border: 'border-[#C7D2FE]' };
    default:
      return { bg: 'bg-[#F4F3F9]', text: 'text-[#7C7CE6]', border: 'border-[#E4E2FB]' };
  }
};

interface BudgetRowProps {
  budget: BudgetCategory;
  onSelect: (budget: BudgetCategory) => void;
  onEdit: (budget: BudgetCategory) => void;
  onDelete: (budget: BudgetCategory) => void;
  onDuplicate?: (budget: BudgetCategory) => void;
}

export default function BudgetRow({
  budget,
  onSelect,
  onEdit,
  onDelete,
  onDuplicate,
}: BudgetRowProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const percentage = budget.limit > 0 ? Math.round((budget.spent / budget.limit) * 100) : 0;
  const remaining = budget.limit - budget.spent;
  const isOver = remaining < 0 || percentage > 100;
  const healthStatus = computeBudgetHealth(percentage);
  const colorTheme = getCategoryColorTheme(budget.category);

  const periodLabel =
    budget.period === 'weekly' ? 'Bulanan' : budget.period === 'custom' ? 'Kustom' : 'Bulanan';

  return (
    <div
      onClick={() => onSelect(budget)}
      className="group relative bg-white hover:bg-[#FAF9FE] p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-black/[0.05] hover:border-[#7C7CE6]/30 shadow-2xs hover:shadow-xs transition-all duration-200 cursor-pointer space-y-3.5"
    >
      {/* 1. Baris Atas: Kategori & Icon (Kiri) + Status & Menu Aksi (Kanan) */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3.5 min-w-0">
          <div
            className={`w-11 h-11 rounded-2xl ${colorTheme.bg} ${colorTheme.text} ${colorTheme.border} border flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform`}
          >
            {getCategoryIconComponent(budget.category, 20)}
          </div>

          <div className="min-w-0">
            <h4 className="text-sm sm:text-base font-bold text-[#242636] group-hover:text-[#5F5ED4] transition-colors truncate">
              {budget.name}
            </h4>
            <p className="text-xs text-[#757A95] truncate font-medium mt-0.5">
              <span>{periodLabel}</span>
              {budget.dailyVelocity ? ` • ${budget.dailyVelocity}` : ''}
            </p>
          </div>
        </div>

        {/* Sisi Kanan Atas: Health Badge & Aksi */}
        <div
          className="flex items-center gap-2 shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <BudgetHealth status={healthStatus} percentage={percentage} size="sm" />

          {/* Tombol Edit */}
          <button
            type="button"
            onClick={() => onEdit(budget)}
            className="px-2.5 py-1.5 rounded-xl bg-black/[0.03] hover:bg-[#E4E2FB] text-[#757A95] hover:text-[#5F5ED4] text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
            title="Edit Anggaran"
          >
            <Pencil size={13} />
            <span className="hidden sm:inline">Edit</span>
          </button>

          {/* More Options Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="w-8 h-8 rounded-xl bg-black/[0.03] hover:bg-black/[0.06] text-[#757A95] hover:text-[#242636] flex items-center justify-center transition-colors cursor-pointer"
              title="Pilihan Lainnya"
            >
              <MoreVertical size={14} />
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {isMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={() => setIsMenuOpen(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 5 }}
                    transition={{ duration: 0.12 }}
                    className="absolute right-0 top-9 z-30 w-48 bg-white rounded-2xl shadow-[0_10px_25px_rgba(36,38,54,0.12)] border border-black/[0.06] p-1.5 space-y-0.5"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        onSelect(budget);
                      }}
                      className="w-full px-3 py-2 rounded-xl text-left text-xs font-semibold text-[#242636] hover:bg-[#F4F3F9] flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <Eye size={14} className="text-[#7C7CE6]" />
                      <span>Lihat Detail</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        onEdit(budget);
                      }}
                      className="w-full px-3 py-2 rounded-xl text-left text-xs font-semibold text-[#242636] hover:bg-[#F4F3F9] flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <Pencil size={14} className="text-[#757A95]" />
                      <span>Edit Batas Anggaran</span>
                    </button>

                    {onDuplicate && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsMenuOpen(false);
                          onDuplicate(budget);
                        }}
                        className="w-full px-3 py-2 rounded-xl text-left text-xs font-semibold text-[#242636] hover:bg-[#F4F3F9] flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <Copy size={14} className="text-[#7C7CE6]" />
                        <span>Duplikat Anggaran</span>
                      </button>
                    )}

                    <div className="h-px bg-black/[0.04] my-1" />

                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        onDelete(budget);
                      }}
                      className="w-full px-3 py-2 rounded-xl text-left text-xs font-semibold text-[#B83A38] hover:bg-[#FFF0EF] flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <Trash2 size={14} className="text-[#B83A38]" />
                      <span>Hapus Anggaran</span>
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* 2. Baris Bawah: Bagian Progress Bar Lebar, Rapi & Elegan */}
      <div className="space-y-2 pt-1 border-t border-black/[0.04]">
        {/* Spent vs Limit Header */}
        <div className="flex items-baseline justify-between text-xs sm:text-sm">
          <div className="flex items-baseline gap-1.5">
            <span className="text-[#757A95] font-semibold text-xs">Terpakai:</span>
            <span className="text-[#242636] font-black text-sm sm:text-base">
              {formatIDR(budget.spent)}
            </span>
            <span className="text-[#757A95] font-normal text-xs">
              dari {formatIDR(budget.limit)}
            </span>
          </div>

          <div>
            <span
              className={`font-black text-sm sm:text-base ${
                percentage > 90
                  ? 'text-[#B83A38]'
                  : percentage >= 70
                  ? 'text-[#B45309]'
                  : 'text-[#5F5ED4]'
              }`}
            >
              {percentage}%
            </span>
          </div>
        </div>

        {/* Progress Bar Component (Full Width Track) */}
        <BudgetProgress percentage={percentage} size="md" />

        {/* Remaining Headroom info */}
        <div className="flex items-center justify-between text-xs text-[#757A95]">
          <span className={isOver ? 'text-[#B83A38] font-bold' : 'text-[#757A95] font-medium'}>
            {isOver ? 'Melebihi anggaran: ' : 'Sisa aman: '}
            <strong className={isOver ? 'text-[#B83A38]' : 'text-[#242636]'}>
              {formatIDR(Math.abs(remaining))}
            </strong>
          </span>

          <span className="text-[11px] font-semibold text-[#7C7CE6]">
            {isOver ? 'Melebihi Limit' : `${Math.max(0, 100 - percentage)}% ruang aman tersisa`}
          </span>
        </div>
      </div>
    </div>
  );
}
