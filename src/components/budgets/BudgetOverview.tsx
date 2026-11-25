'use client';

import React from 'react';
import { Sparkles, ShieldCheck } from 'lucide-react';
import { formatIDR } from '@/lib/format';
import BudgetProgress from './BudgetProgress';
import BudgetHealth from './BudgetHealth';

interface BudgetOverviewProps {
  monthLabel?: string;
  totalBudget: number;
  totalSpent: number;
  remaining: number;
  percentage: number;
  healthStatus?: 'on_track' | 'almost_there' | 'over_budget';
  onQuickCreate?: () => void;
}

export default function BudgetOverview({
  monthLabel = 'Agustus 2026',
  totalBudget,
  totalSpent,
  remaining,
  percentage,
  healthStatus = 'on_track',
}: BudgetOverviewProps) {
  const isOverBudget = remaining < 0 || percentage > 100;

  return (
    <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-b from-white via-[#FCFCFE] to-[#F8F8FD] p-6 sm:p-8 border border-white/90 shadow-[0_12px_36px_-6px_rgba(48,51,74,0.06),0_0_0_1px_rgba(36,38,54,0.04)] space-y-5">
      {/* Decorative ambient background accents */}
      <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-gradient-to-bl from-[#E4E2FB]/50 via-[#D6E4FA]/30 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-[#D0EFE5]/40 blur-2xl pointer-events-none" />

      {/* Top Bar: Title & Health Badge */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#E4E2FB] text-[#7C7CE6] flex items-center justify-center font-bold text-sm">
            <Sparkles size={16} />
          </div>
          <h2 className="text-lg sm:text-xl font-black text-[#242636] tracking-tight">
            Ringkasan Anggaran {monthLabel}
          </h2>
        </div>

        <BudgetHealth
          status={healthStatus}
          percentage={percentage}
          showDescription={false}
          size="md"
        />
      </div>

      {/* Hero Metric Section */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="flex flex-wrap items-baseline gap-2 sm:gap-3">
          <h3 className="text-2xl sm:text-3xl font-extrabold text-[#242636] tracking-tight tabular-nums">
            {formatIDR(totalSpent)}
          </h3>
          <span className="text-sm sm:text-base font-semibold text-[#757A95]">
            terpakai dari{' '}
            <span className="text-[#242636] font-extrabold tabular-nums">
              {formatIDR(totalBudget)}
            </span>
          </span>
        </div>

        <div
          className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-2xl border text-xs sm:text-sm font-extrabold shadow-2xs self-start sm:self-auto ${
            isOverBudget
              ? 'bg-[#FFF0EF] text-[#B83A38] border-[#FAD0CD]'
              : 'bg-[#D0EFE5] text-[#1B7354] border-[#A7E3D0]'
          }`}
        >
          <ShieldCheck size={15} />
          <span className="tabular-nums">
            {isOverBudget ? 'Melebihi ' : 'Sisa '}
            {formatIDR(Math.abs(remaining))}
          </span>
        </div>
      </div>

      {/* Progress Visualization */}
      <div className="relative z-10 space-y-2">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-[#757A95]">Penggunaan Anggaran</span>
          <span
            className={`font-black text-sm tabular-nums ${
              percentage > 90
                ? 'text-[#B83A38]'
                : percentage >= 70
                  ? 'text-[#B45309]'
                  : 'text-[#1B7354]'
            }`}
          >
            {percentage}%
          </span>
        </div>

        <BudgetProgress percentage={percentage} size="hero" />
      </div>
    </div>
  );
}
