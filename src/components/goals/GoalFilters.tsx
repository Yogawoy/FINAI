'use client';

import React from 'react';
import { Search, ArrowUpDown, Target, Sparkles, AlertTriangle, CheckCircle } from 'lucide-react';
import CustomSelect from '@/components/ui/CustomSelect';

export type GoalFilterStatus = 'all' | 'active' | 'completed' | 'attention';
export type GoalSortOption = 'newest' | 'deadline_asc' | 'progress_desc' | 'progress_asc';

interface GoalFiltersProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedFilter: GoalFilterStatus;
  onFilterChange: (f: GoalFilterStatus) => void;
  selectedSort: GoalSortOption;
  onSortChange: (s: GoalSortOption) => void;
  totalCount: number;
}

export default function GoalFilters({
  searchQuery,
  onSearchChange,
  selectedFilter,
  onFilterChange,
  selectedSort,
  onSortChange,
  totalCount,
}: GoalFiltersProps) {
  const filterOptions: { id: GoalFilterStatus; label: string }[] = [
    { id: 'all', label: 'Semua Target' },
    { id: 'active', label: 'Aktif' },
    { id: 'completed', label: 'Tercapai' },
    { id: 'attention', label: 'Perlu Perhatian' },
  ];

  const sortOptions = [
    { value: 'newest', label: 'Terbaru Ditambahkan' },
    { value: 'deadline_asc', label: 'Target Terdekat' },
    { value: 'progress_desc', label: 'Progress Tertinggi' },
    { value: 'progress_asc', label: 'Progress Terendah' },
  ];

  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3.5">
      {/* 1. Status Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
        {filterOptions.map((opt) => {
          const isActive = selectedFilter === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onFilterChange(opt.id)}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer select-none ${
                isActive
                  ? 'bg-[#242636] text-white shadow-xs'
                  : 'bg-white text-[#757A95] hover:text-[#242636] hover:bg-[#F4F3F9] border border-black/[0.05]'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* 2. Search & Sort Controls */}
      <div className="flex items-center gap-2.5">
        {/* Search Input */}
        <div className="relative flex-1 sm:w-56 md:w-64">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#757A95] pointer-events-none"
          />
          <input
            type="text"
            placeholder="Cari target impian..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-black/[0.06] rounded-2xl text-xs sm:text-sm text-[#242636] placeholder-[#757A95] focus:outline-none focus:border-[#7C7CE6] transition-colors shadow-2xs"
          />
        </div>

        {/* Sort Dropdown */}
        <div className="w-48 sm:w-52">
          <CustomSelect
            value={selectedSort}
            onChange={(val) => onSortChange(val as GoalSortOption)}
            options={sortOptions}
            placeholder="Urutkan"
          />
        </div>
      </div>
    </div>
  );
}
