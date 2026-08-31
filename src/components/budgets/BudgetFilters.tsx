'use client';

import React from 'react';
import { Search, X } from 'lucide-react';
import { BudgetHealthStatus } from '@/types';

export type BudgetFilterType = 'all' | BudgetHealthStatus;

interface BudgetFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedFilter: BudgetFilterType;
  onFilterChange: (filter: BudgetFilterType) => void;
  counts: {
    all: number;
    on_track: number;
    almost_there: number;
    over_budget: number;
  };
}

export default function BudgetFilters({
  searchQuery,
  onSearchChange,
  selectedFilter,
  onFilterChange,
  counts,
}: BudgetFiltersProps) {
  const FILTER_TABS: { id: BudgetFilterType; label: string; count: number }[] = [
    { id: 'all', label: 'Semua Anggaran', count: counts.all },
    { id: 'on_track', label: 'Terkontrol Aman', count: counts.on_track },
    { id: 'almost_there', label: 'Mendekati Batas', count: counts.almost_there },
    { id: 'over_budget', label: 'Melebihi Batas', count: counts.over_budget },
  ];

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
      {/* Search Input Box */}
      <div className="relative flex-1 max-w-sm">
        <Search
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#757A95] pointer-events-none"
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Cari pos anggaran atau kategori..."
          className="w-full pl-9 pr-8 py-2.5 bg-white rounded-2xl border border-black/[0.06] text-xs sm:text-sm text-[#242636] placeholder-[#757A95]/70 focus:outline-none focus:ring-2 focus:ring-[#7C7CE6]/30 focus:border-[#7C7CE6] transition-all shadow-2xs"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#757A95] hover:text-[#242636] cursor-pointer"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Filter Pill Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
        {FILTER_TABS.map((tab) => {
          const isActive = selectedFilter === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onFilterChange(tab.id)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                isActive
                  ? 'bg-[#7C7CE6] text-white shadow-[0_4px_12px_rgba(124,124,230,0.3)]'
                  : 'bg-white text-[#757A95] hover:text-[#242636] hover:bg-[#F4F3F9] border border-black/[0.04]'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-black/[0.05] text-[#757A95]'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
