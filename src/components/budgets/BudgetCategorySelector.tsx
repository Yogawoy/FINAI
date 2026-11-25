'use client';

import React from 'react';
import { TransactionCategory } from '@/types';
import { BUDGET_CATEGORIES as CANONICAL_BUDGET_CATEGORIES } from '@/lib/categories';
import { renderTransactionCategoryIcon } from '@/components/categories/CategoryIcon';

export interface CategoryOption {
  id: TransactionCategory;
  label: string;
  icon: React.ReactNode;
  defaultColor: string;
}

export const BUDGET_CATEGORIES: CategoryOption[] = CANONICAL_BUDGET_CATEGORIES.map((c) => ({
  id: c.id,
  label: c.label,
  icon: renderTransactionCategoryIcon(c.id, 18),
  defaultColor: c.color,
}));

interface BudgetCategorySelectorProps {
  selectedCategory: TransactionCategory;
  onSelectCategory: (category: TransactionCategory) => void;
}

export default function BudgetCategorySelector({
  selectedCategory,
  onSelectCategory,
}: BudgetCategorySelectorProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-bold text-[#757A95] uppercase tracking-wider block">
        Kategori Anggaran
      </label>
      <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-0.5">
        {BUDGET_CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.id)}
              className={`p-2 rounded-2xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer text-center min-h-[64px] ${
                isSelected
                  ? 'bg-[#EDEAFC] border-[#7C7CE6] text-[#5F5ED4] shadow-xs font-bold'
                  : 'bg-[#F8F9FD] border-black/[0.05] text-[#757A95] hover:bg-black/[0.02] hover:text-[#242636]'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center transition-colors ${
                  isSelected ? 'text-[#5F5ED4]' : 'text-[#757A95]'
                }`}
              >
                {cat.icon}
              </div>
              <span className="text-[10px] leading-tight line-clamp-2 px-0.5">
                {cat.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
