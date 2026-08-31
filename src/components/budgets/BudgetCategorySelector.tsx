'use client';

import React from 'react';
import {
  Utensils,
  Car,
  Gamepad2,
  ShoppingBag,
  MoreHorizontal,
} from 'lucide-react';
import { TransactionCategory } from '@/types';

export interface CategoryOption {
  id: TransactionCategory;
  label: string;
  icon: React.ReactNode;
  defaultColor: string;
}

export const BUDGET_CATEGORIES: CategoryOption[] = [
  {
    id: 'food',
    label: 'Makanan & Minuman',
    icon: <Utensils size={18} />,
    defaultColor: '#7C7CE6',
  },
  {
    id: 'transport',
    label: 'Transportasi',
    icon: <Car size={18} />,
    defaultColor: '#8E9AF7',
  },
  {
    id: 'entertainment',
    label: 'Hiburan',
    icon: <Gamepad2 size={18} />,
    defaultColor: '#F59E0B',
  },
  {
    id: 'shopping',
    label: 'Belanja',
    icon: <ShoppingBag size={18} />,
    defaultColor: '#10B981',
  },
  {
    id: 'other',
    label: 'Lainnya',
    icon: <MoreHorizontal size={18} />,
    defaultColor: '#8B5CF6',
  },
];

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
      <div className="grid grid-cols-5 gap-2">
        {BUDGET_CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.id)}
              className={`p-2.5 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer text-center min-h-[72px] ${
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
