'use client';

import React from 'react';
import { formatIDR } from '@/data/mockData';

export interface FinancialTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    name: string;
    dataKey: string;
    color?: string;
    payload?: {
      label: string;
      fullDate?: string;
      income: number;
      expense: number;
      [key: string]: any;
    };
  }>;
  label?: string;
}

export default function FinancialTooltip({
  active,
  payload,
  label,
}: FinancialTooltipProps) {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0]?.payload;
  if (!data) return null;

  const income = data.income ?? 0;
  const expense = data.expense ?? 0;
  const diff = income - expense;
  const isPositive = diff >= 0;
  const displayTitle = data.fullDate || label || 'Periode';

  return (
    <div className="bg-white rounded-[16px] border border-[#E8EAF2] p-4 shadow-[0_10px_30px_rgba(36,38,54,0.08)] min-w-[220px] sm:min-w-[240px] space-y-3 pointer-events-none select-none">
      {/* Title */}
      <div className="text-xs font-bold text-[#242636] pb-2 border-b border-[#E8EAF2]/80">
        {displayTitle}
      </div>

      {/* Breakdown Rows */}
      <div className="space-y-2 text-xs">
        {/* Pemasukan */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#7C7CE6] shrink-0" />
            <span className="text-[#757A95] font-medium">Pemasukan</span>
          </div>
          <span className="font-bold text-[#242636] tabular-nums">
            {formatIDR(income)}
          </span>
        </div>

        {/* Pengeluaran */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#7FA6FF] shrink-0" />
            <span className="text-[#757A95] font-medium">Pengeluaran</span>
          </div>
          <span className="font-bold text-[#242636] tabular-nums">
            {formatIDR(expense)}
          </span>
        </div>
      </div>

      {/* Selisih */}
      <div className="pt-2 border-t border-[#E8EAF2]/80 flex items-center justify-between text-xs">
        <span className="text-[#757A95] font-semibold">Selisih</span>
        <span
          className={`font-black tabular-nums ${
            isPositive ? 'text-[#45B99A]' : 'text-[#E47777]'
          }`}
        >
          {isPositive ? '+' : '-'} {formatIDR(Math.abs(diff))}
        </span>
      </div>
    </div>
  );
}
