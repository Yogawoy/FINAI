'use client';

import React from 'react';
import { formatIDR } from '@/lib/format';

interface SpendingBreakdownItem {
  category: string;
  total: number;
  percentage?: number;
}

interface SpendingBreakdownCardProps {
  items: SpendingBreakdownItem[];
  period?: string;
}

export default function SpendingBreakdownCard({ items, period }: SpendingBreakdownCardProps) {
  if (!items || items.length === 0) {
    return (
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E8EAF2] shadow-[0_6px_24px_rgba(36,38,54,0.04)] max-w-md">
        <span className="px-2.5 py-0.5 rounded-full bg-[#EDEAFC] text-[#5F5ED4] text-[10px] font-bold uppercase tracking-wider">
          Pengeluaran Terbesar
        </span>
        <p className="text-xs text-[#757A95] mt-3">Belum ada data pengeluaran untuk ditampilkan.</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E8EAF2] shadow-[0_6px_24px_rgba(36,38,54,0.04)] space-y-3 max-w-md">
      <div className="flex items-center justify-between">
        <span className="px-2.5 py-0.5 rounded-full bg-[#EDEAFC] text-[#5F5ED4] text-[10px] font-bold uppercase tracking-wider">
          Pengeluaran Terbesar
        </span>
        {period && <span className="text-[11px] text-[#757A95] font-medium">{period}</span>}
      </div>

      <div className="space-y-2">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[#242636]">{item.category}</span>
            <div className="text-right">
              <span className="font-black tabular-nums text-[#242636] block">{formatIDR(item.total)}</span>
              {typeof item.percentage === 'number' && (
                <span className="text-[10px] text-[#757A95]">{item.percentage}%</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
