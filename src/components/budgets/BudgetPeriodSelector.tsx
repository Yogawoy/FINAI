'use client';

import React from 'react';
import { BudgetPeriod } from '@/types';

interface BudgetPeriodSelectorProps {
  period: BudgetPeriod;
  onPeriodChange: (p: BudgetPeriod) => void;
}

const PERIOD_OPTIONS: { id: BudgetPeriod; label: string }[] = [
  { id: 'monthly', label: 'Bulanan' },
  { id: 'weekly', label: 'Mingguan' },
  { id: 'custom', label: 'Kustom' },
];

export default function BudgetPeriodSelector({
  period,
  onPeriodChange,
}: BudgetPeriodSelectorProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-bold text-[#757A95] uppercase tracking-wider block">
        Periode Anggaran
      </label>
      <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#F4F3F9] rounded-2xl">
        {PERIOD_OPTIONS.map((opt) => {
          const isActive = period === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onPeriodChange(opt.id)}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-white text-[#5F5ED4] shadow-xs border border-[#7C7CE6]/20'
                  : 'text-[#757A95] hover:text-[#242636]'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
