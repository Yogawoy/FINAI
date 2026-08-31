'use client';

import React, { useState, useEffect } from 'react';
import { Search, X, SlidersHorizontal, Check } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { TransactionCategory, TransactionType } from '@/types';
import { DateFilterType } from './TransactionFilters';

interface FilterTransactionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  onSearchChange: (val: string) => void;
  selectedType: 'all' | TransactionType;
  onTypeChange: (val: 'all' | TransactionType) => void;
  selectedCategory: string;
  onCategoryChange: (val: string) => void;
  selectedDateFilter: DateFilterType;
  onDateFilterChange: (val: DateFilterType) => void;
  onResetFilters: () => void;
}

const CATEGORY_CHIPS = [
  { id: 'all', label: 'Semua Kategori' },
  { id: 'food', label: 'Makanan' },
  { id: 'transport', label: 'Transportasi' },
  { id: 'shopping', label: 'Belanja' },
  { id: 'bills', label: 'Tagihan' },
  { id: 'entertainment', label: 'Hiburan' },
  { id: 'health', label: 'Kesehatan' },
  { id: 'education', label: 'Pendidikan' },
  { id: 'other', label: 'Lainnya' },
];

const DATE_RANGE_CHIPS: { id: DateFilterType; label: string }[] = [
  { id: 'today', label: 'Hari Ini' },
  { id: 'week', label: 'Minggu Ini' },
  { id: 'month', label: 'Bulan Ini' },
  { id: 'all', label: 'Semua' },
];

export default function FilterTransactionsModal({
  isOpen,
  onClose,
  searchQuery,
  onSearchChange,
  selectedType,
  onTypeChange,
  selectedCategory,
  onCategoryChange,
  selectedDateFilter,
  onDateFilterChange,
  onResetFilters,
}: FilterTransactionsModalProps) {
  const [tempSearch, setTempSearch] = useState(searchQuery);
  const [tempType, setTempType] = useState(selectedType);
  const [tempCategory, setTempCategory] = useState(selectedCategory);
  const [tempDate, setTempDate] = useState(selectedDateFilter);

  useEffect(() => {
    if (isOpen) {
      setTempSearch(searchQuery);
      setTempType(selectedType);
      setTempCategory(selectedCategory);
      setTempDate(selectedDateFilter);
    }
  }, [isOpen, searchQuery, selectedType, selectedCategory, selectedDateFilter]);

  const handleApply = () => {
    onSearchChange(tempSearch);
    onTypeChange(tempType);
    onCategoryChange(tempCategory);
    onDateFilterChange(tempDate);
    onClose();
  };

  const handleReset = () => {
    setTempSearch('');
    setTempType('all');
    setTempCategory('all');
    setTempDate('all');
    onResetFilters();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="md"
      title="Filter Transaksi"
    >
      <div className="space-y-5">
        {/* 1. Search input */}
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7C7CE6]"
          />
          <input
            type="text"
            placeholder="Cari kata kunci transaksi..."
            value={tempSearch}
            onChange={(e) => setTempSearch(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 bg-[#F8F9FD] border border-black/[0.06] rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#7C7CE6]/40 focus:bg-white text-[#242636]"
          />
          {tempSearch && (
            <button
              onClick={() => setTempSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#757A95] hover:text-[#242636]"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* 2. Type Selector */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-[#757A95] block">
            Tipe Transaksi
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['all', 'expense', 'income'] as const).map((t) => {
              const isSelected = tempType === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTempType(t)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#EDEAFC] text-[#5F5ED4] border-[#7C7CE6] shadow-xs'
                      : 'bg-white text-[#757A95] border-black/[0.06] hover:bg-[#F8F9FD] hover:text-[#242636]'
                  }`}
                >
                  {t === 'all' ? 'Semua' : t === 'expense' ? 'Pengeluaran' : 'Pemasukan'}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Category Selector */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-[#757A95] block">
            Kategori
          </label>
          <div className="flex flex-wrap gap-1.5">
            {CATEGORY_CHIPS.map((cat) => {
              const isSelected = tempCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setTempCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#7C7CE6] text-white border-[#7C7CE6] shadow-xs'
                      : 'bg-white text-[#757A95] border-black/[0.06] hover:bg-[#F8F9FD]'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Date Range Selector */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-[#757A95] block">
            Rentang Tanggal
          </label>
          <div className="grid grid-cols-4 gap-2">
            {DATE_RANGE_CHIPS.map((d) => {
              const isSelected = tempDate === d.id;
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setTempDate(d.id)}
                  className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#EDEAFC] text-[#5F5ED4] border-[#7C7CE6] shadow-xs'
                      : 'bg-white text-[#757A95] border-black/[0.06] hover:bg-[#F8F9FD]'
                  }`}
                >
                  {d.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 5. Bottom Actions: Reset & Apply */}
        <div className="flex items-center justify-between pt-3 border-t border-black/[0.05]">
          <button
            type="button"
            onClick={handleReset}
            className="text-xs font-bold text-[#B83A38] hover:underline cursor-pointer"
          >
            Reset Semua Filter
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 rounded-xl text-xs font-bold text-[#757A95] hover:bg-black/[0.04] cursor-pointer transition-colors"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="py-2 px-5 rounded-xl bg-gradient-to-r from-[#7C7CE6] to-[#8C8BE8] text-white font-bold text-xs shadow-xs hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer"
            >
              Terapkan Filter
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
