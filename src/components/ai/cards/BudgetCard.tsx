'use client';

import React from 'react';
import {
  PieChart,
  Calendar,
  TrendingUp,
  AlertTriangle,
  ShoppingBag,
  Utensils,
  Car,
  Zap,
  CheckCircle2,
} from 'lucide-react';
import { formatIDR } from '@/lib/format';

interface BudgetCardProps {
  category: string;
  limitAmount: number;
  usedAmount: number;
  remainingAmount: number;
  percentage: number;
  status?: string;
  period?: string;
}

const CATEGORY_NAMES: Record<string, string> = {
  shopping: 'Belanja',
  belanja: 'Belanja',
  food: 'Makanan',
  makanan: 'Makanan',
  transport: 'Transportasi',
  transportasi: 'Transportasi',
  bills: 'Tagihan',
  tagihan: 'Tagihan',
  entertainment: 'Hiburan',
  hiburan: 'Hiburan',
  other: 'Lainnya',
  lainnya: 'Lainnya',
};

const getCategoryIcon = (raw: string) => {
  const key = raw.toLowerCase().trim();
  if (key.includes('belanja') || key.includes('shopping')) return <ShoppingBag size={16} />;
  if (key.includes('makan') || key.includes('food')) return <Utensils size={16} />;
  if (key.includes('transport')) return <Car size={16} />;
  if (key.includes('tagihan') || key.includes('bill')) return <Zap size={16} />;
  return <PieChart size={16} />;
};

export default function BudgetCard({
  category,
  limitAmount,
  usedAmount,
  remainingAmount,
  percentage,
  status,
  period,
}: BudgetCardProps) {
  const categoryLabel = CATEGORY_NAMES[category.toLowerCase().trim()] || category;
  const pct = Math.min(Math.max(percentage, 0), 100);
  const isOver = percentage > 100 || (limitAmount > 0 && usedAmount > limitAmount);
  const isWarning = percentage >= 75 && percentage <= 100;
  const isSafe = !isOver && !isWarning;

  const statusText = isOver
    ? 'Over budget'
    : isWarning
    ? 'Mendekati batas limit'
    : 'Anggaran Aman';
  const statusColor = isOver ? 'text-[#D94F4F]' : isWarning ? 'text-[#E09D3B]' : 'text-[#1B7354]';
  const statusBg = isOver ? 'bg-[#FEF3F2]' : isWarning ? 'bg-[#FFF9EB]' : 'bg-[#EBF7F2]';
  const statusBorder = isOver ? 'border-[#FCE2E0]' : isWarning ? 'border-[#FCE9B8]' : 'border-[#D0EFE5]';
  const barColor = isOver ? 'bg-[#E96A64]' : isWarning ? 'bg-[#F0A500]' : 'bg-[#7C7CE6]';

  const effectiveRemaining = remainingAmount || Math.max(0, limitAmount - usedAmount);

  return (
    <div className="w-full sm:w-[420px] max-w-md p-5 rounded-2xl bg-white border border-[#E8EAF2] shadow-[0_6px_24px_rgba(36,38,54,0.04)] space-y-4">
      {/* Header Badges */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#EDEAFC] text-[#5F5ED4] flex items-center justify-center shrink-0">
            {getCategoryIcon(category)}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded-full bg-[#EDEAFC] text-[#5F5ED4] text-[10px] font-bold uppercase tracking-wider">
                Pos Anggaran
              </span>
              {period && <span className="text-[10px] font-medium text-[#757A95]">• {period}</span>}
            </div>
            <h4 className="text-base font-extrabold text-[#242636] mt-0.5">
              {categoryLabel}
            </h4>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-[#757A95] font-bold uppercase tracking-wider block">
            Terpakai
          </span>
          <span className={`text-base font-black tabular-nums ${isOver ? 'text-[#D94F4F]' : 'text-[#242636]'}`}>
            {Math.round(percentage)}%
          </span>
        </div>
      </div>

      {/* Progress & Amounts */}
      <div className="space-y-2 p-3.5 rounded-xl bg-[#F8F9FD] border border-black/[0.04]">
        <div className="flex items-baseline justify-between text-xs">
          <span className="text-[#757A95] font-medium">Realisasi Pengeluaran</span>
          <div className="flex items-baseline gap-1">
            <span className="text-sm font-black text-[#242636] tabular-nums">{formatIDR(usedAmount)}</span>
            <span className="text-[11px] text-[#757A95]">/ {formatIDR(limitAmount)}</span>
          </div>
        </div>

        {/* Progress bar track */}
        <div className="w-full h-2.5 rounded-full bg-black/[0.06] overflow-hidden p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-500 ${barColor}`}
            style={{ width: `${Math.min(pct, 100)}%` }}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-2.5 text-xs">
        <div className="p-2.5 rounded-xl bg-[#FAFBFD] border border-black/[0.03] space-y-0.5">
          <span className="text-[10px] text-[#757A95] font-semibold block flex items-center gap-1">
            <TrendingUp size={12} className="text-[#7C7CE6]" /> Terpakai
          </span>
          <span className="text-xs font-bold text-[#242636] tabular-nums block">
            {formatIDR(usedAmount)}
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-[#FAFBFD] border border-black/[0.03] space-y-0.5">
          <span className="text-[10px] text-[#757A95] font-semibold block">
            Sisa Kuota
          </span>
          <span className={`text-xs font-bold tabular-nums block ${isOver ? 'text-[#D94F4F]' : 'text-[#1B7354]'}`}>
            {isOver ? `- ${formatIDR(Math.abs(effectiveRemaining))}` : formatIDR(effectiveRemaining)}
          </span>
        </div>
      </div>

      {/* Status Banner */}
      <div className={`p-2.5 rounded-xl border flex items-center justify-between text-xs font-semibold ${statusBg} ${statusBorder} ${statusColor}`}>
        <div className="flex items-center gap-2">
          {isOver ? (
            <AlertTriangle size={15} className="shrink-0 text-[#D94F4F]" />
          ) : isWarning ? (
            <AlertTriangle size={15} className="shrink-0 text-[#E09D3B]" />
          ) : (
            <CheckCircle2 size={15} className="shrink-0 text-[#1B7354]" />
          )}
          <span>{statusText}</span>
        </div>
        <span className="text-[11px] font-bold uppercase tracking-wider opacity-85">
          {isOver ? 'Over' : isWarning ? 'Waspada' : 'Aman'}
        </span>
      </div>
    </div>
  );
}
