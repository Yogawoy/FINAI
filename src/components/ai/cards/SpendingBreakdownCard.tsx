'use client';

import React from 'react';
import { PieChart, TrendingDown, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';
import { formatIDR } from '@/lib/format';

interface SpendingBreakdownItem {
  category: string;
  total: number;
  percentage?: number;
}

interface SpendingBreakdownCardProps {
  items: SpendingBreakdownItem[];
  period?: string;
  totalAmount?: number;
  note?: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  bills: 'bg-[#EF4444]',
  tagihan: 'bg-[#EF4444]',
  food: 'bg-[#F59E0B]',
  makanan: 'bg-[#F59E0B]',
  transport: 'bg-[#3B82F6]',
  transportasi: 'bg-[#3B82F6]',
  shopping: 'bg-[#EC4899]',
  belanja: 'bg-[#EC4899]',
  other: 'bg-[#8B5CF6]',
  lainnya: 'bg-[#8B5CF6]',
};

const getCategoryColor = (name: string) => {
  const key = name.toLowerCase().trim();
  return CATEGORY_COLORS[key] || 'bg-[#7C7CE6]';
};

export default function SpendingBreakdownCard({
  items,
  period,
  totalAmount,
  note,
}: SpendingBreakdownCardProps) {
  const computedTotal = totalAmount || items.reduce((acc, item) => acc + item.total, 0);

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
    <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E8EAF2] shadow-[0_6px_24px_rgba(36,38,54,0.04)] space-y-4 max-w-md">
      {/* Header Badge & Period */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#EDEAFC] text-[#5F5ED4] flex items-center justify-center">
            <PieChart size={13} />
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-[#EDEAFC] text-[#5F5ED4] text-[10px] font-bold uppercase tracking-wider">
            Rincian Pengeluaran
          </span>
        </div>
        {period && (
          <span className="text-[11px] font-semibold text-[#757A95] bg-[#F8F9FD] px-2 py-0.5 rounded-lg border border-black/[0.04]">
            {period}
          </span>
        )}
      </div>

      {/* Total Spending Highlight */}
      {computedTotal > 0 && (
        <div className="p-3 rounded-xl bg-gradient-to-r from-[#FAF9FE] to-[#F3F2FC] border border-[#E4E2FB] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-[#757A95] uppercase tracking-wider block">
              Total Pengeluaran
            </span>
            <span className="text-base sm:text-lg font-black text-[#242636] tabular-nums">
              {formatIDR(computedTotal)}
            </span>
          </div>
          <div className="w-8 h-8 rounded-xl bg-white text-[#D94F4F] flex items-center justify-center shadow-2xs">
            <TrendingDown size={16} />
          </div>
        </div>
      )}

      {/* Category Breakdown List */}
      <div className="space-y-3 pt-1">
        {items.map((item, idx) => {
          const pct =
            typeof item.percentage === 'number'
              ? Math.min(100, Math.max(0, item.percentage))
              : computedTotal > 0
              ? Math.round((item.total / computedTotal) * 100)
              : 0;
          const colorClass = getCategoryColor(item.category);

          return (
            <div key={idx} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${colorClass}`} />
                  <span className="font-bold text-[#242636]">{item.category}</span>
                </div>
                <div className="flex items-center gap-1.5 font-bold tabular-nums">
                  <span className="text-[#242636]">{formatIDR(item.total)}</span>
                  <span className="text-[10px] font-semibold text-[#757A95] bg-[#F4F3F9] px-1.5 py-0.5 rounded-md">
                    {pct}%
                  </span>
                </div>
              </div>

              {/* Progress Bar Track */}
              <div className="w-full h-1.5 rounded-full bg-black/[0.04] overflow-hidden">
                <div
                  className={`h-full rounded-full ${colorClass} transition-all duration-500`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Note / Surplus Footer */}
      {note && (
        <div className="p-3 rounded-xl bg-[#EBF7F2] border border-[#D0EFE5] flex items-start gap-2.5 text-xs text-[#1B7354]">
          <CheckCircle2 size={15} className="shrink-0 mt-0.5 text-[#1B7354]" />
          <p className="leading-relaxed font-medium">{note}</p>
        </div>
      )}
    </div>
  );
}
