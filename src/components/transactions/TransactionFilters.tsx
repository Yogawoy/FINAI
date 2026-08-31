'use client';

import React from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { TransactionCategory, TransactionType } from '@/types';

export type DateFilterType = 'all' | 'today' | 'week' | 'month';

interface TransactionFiltersProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  selectedType: 'all' | TransactionType;
  onTypeChange: (val: 'all' | TransactionType) => void;
  selectedCategory: string;
  onCategoryChange: (val: string) => void;
  selectedDateFilter: DateFilterType;
  onDateFilterChange: (val: DateFilterType) => void;
  onOpenFilterModal: () => void;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
}

const CATEGORY_ITEMS: { id: string; label: string; cat?: TransactionCategory }[] = [
  { id: 'all', label: 'Semua Kategori' },
  { id: 'food', label: 'Makanan' },
  { id: 'transport', label: 'Transportasi' },
  { id: 'bills', label: 'Tagihan' },
  { id: 'entertainment', label: 'Hiburan' },
  { id: 'shopping', label: 'Belanja' },
  { id: 'health', label: 'Kesehatan' },
  { id: 'education', label: 'Pendidikan' },
  { id: 'salary', label: 'Gaji' },
  { id: 'freelance', label: 'Freelance' },
  { id: 'investment', label: 'Investasi' },
  { id: 'other', label: 'Lainnya' },
];

const DATE_FILTER_ITEMS: { id: DateFilterType; label: string }[] = [
  { id: 'all', label: 'Semua Tanggal' },
  { id: 'today', label: 'Hari Ini' },
  { id: 'week', label: 'Minggu Ini' },
  { id: 'month', label: 'Bulan Ini' },
];

export default function TransactionFilters({
  searchQuery,
  onSearchChange,
  selectedType,
  onTypeChange,
  selectedCategory,
  onCategoryChange,
  selectedDateFilter,
  onDateFilterChange,
  onOpenFilterModal,
  onResetFilters,
  hasActiveFilters,
}: TransactionFiltersProps) {
  return (
    <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white/85 backdrop-blur-md border border-white/90 shadow-[0_8px_30px_rgba(48,51,74,0.03)] space-y-4">
      {/* Top Row: Search Input + Type Toggle + Date Range + More Filters Button */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7C7CE6]"
          />
          <input
            type="text"
            placeholder="Cari mutasi transaksi..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 bg-[#F8F9FD] border border-black/[0.06] rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#7C7CE6]/40 focus:bg-white transition-all text-[#242636]"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#757A95] hover:text-[#242636] p-0.5 rounded-full"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Right Filter Group: Type Toggle & Date Range & Filter Button */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {/* Type Toggle */}
          <div className="flex items-center gap-1 p-1 bg-black/[0.03] rounded-2xl shrink-0">
            {(['all', 'expense', 'income'] as const).map((t) => (
              <button
                key={t}
                onClick={() => onTypeChange(t)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                  selectedType === t
                    ? 'bg-white text-[#242636] shadow-xs'
                    : 'text-[#757A95] hover:text-[#242636]'
                }`}
              >
                {t === 'all' ? 'Semua' : t === 'expense' ? 'Pengeluaran' : 'Pemasukan'}
              </button>
            ))}
          </div>

          {/* Date Filter Dropdown / Pills */}
          <div className="flex items-center gap-1 bg-black/[0.03] p-1 rounded-2xl shrink-0">
            {DATE_FILTER_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => onDateFilterChange(item.id)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedDateFilter === item.id
                    ? 'bg-[#EDEAFC] text-[#5F5ED4] shadow-2xs font-extrabold'
                    : 'text-[#757A95] hover:text-[#242636]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Filter Modal Button */}
          <button
            onClick={onOpenFilterModal}
            className="p-2.5 rounded-2xl bg-[#F8F9FD] hover:bg-[#EDEAFC] text-[#757A95] hover:text-[#5F5ED4] border border-black/[0.06] transition-colors cursor-pointer shrink-0"
            title="Filter Lanjutan"
          >
            <SlidersHorizontal size={16} />
          </button>
        </div>
      </div>

      {/* Bottom Row: Category Horizontal Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORY_ITEMS.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                isSelected
                  ? 'bg-[#7C7CE6] text-white border-[#7C7CE6] shadow-[0_4px_12px_rgba(124,124,230,0.25)] font-bold'
                  : 'bg-[#F8F9FD] text-[#757A95] border-black/[0.04] hover:bg-black/[0.03] hover:text-[#242636]'
              }`}
            >
              {cat.label}
            </button>
          );
        })}

        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            className="text-xs font-bold text-[#B83A38] hover:underline px-2 cursor-pointer shrink-0 ml-1"
          >
            Reset Filter
          </button>
        )}
      </div>
    </div>
  );
}
