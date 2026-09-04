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
    <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-b from-white via-[#FCFCFE] to-[#F8F8FD] p-6 sm:p-8 md:p-9 border border-white/90 shadow-[0_12px_36px_-6px_rgba(48,51,74,0.06),0_0_0_1px_rgba(36,38,54,0.04)] space-y-6">
      {/* Decorative ambient background accents */}
      <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-gradient-to-bl from-[#E4E2FB]/50 via-[#D6E4FA]/30 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-[#D0EFE5]/40 blur-2xl pointer-events-none" />

      {/* Top Bar: Title & Health Badge */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#E4E2FB] text-[#7C7CE6] flex items-center justify-center font-bold text-sm">
            <Sparkles size={16} />
          </div>
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#7C7CE6] block">
              Ringkasan Anggaran
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-[#242636] tracking-tight">
              Ringkasan Anggaran {monthLabel}
            </h2>
          </div>
        </div>

        {/* Health status badge & friendly message */}
        <div className="flex items-center gap-2">
          <BudgetHealth
            status={healthStatus}
            percentage={percentage}
            showDescription={false}
            size="md"
          />
        </div>
      </div>

      {/* Hero Metric Section: Large Spent & Remaining */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left Column: Big Numbers & Remaining Callout */}
        <div className="lg:col-span-6 space-y-2">
          <span className="text-xs sm:text-sm font-semibold text-[#757A95]">
            Total Pengeluaran vs Total Anggaran
          </span>

          <div className="flex flex-wrap items-baseline gap-2 sm:gap-3">
            <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#242636] tracking-tight">
              {formatIDR(totalSpent)}
            </h3>
            <span className="text-base sm:text-lg font-bold text-[#757A95]">
              terpakai dari{' '}
              <span className="text-[#242636] font-extrabold">
                {formatIDR(totalBudget)}
              </span>
            </span>
          </div>

          {/* Remaining Money Callout Pill */}
          <div className="pt-2 flex items-center gap-2.5">
            <div
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-2xl border text-xs sm:text-sm font-extrabold shadow-2xs ${
                isOverBudget
                  ? 'bg-[#FFF0EF] text-[#B83A38] border-[#FAD0CD]'
                  : 'bg-[#D0EFE5] text-[#1B7354] border-[#A7E3D0]'
              }`}
            >
              <ShieldCheck size={16} />
              <span>
                {isOverBudget ? 'Melebihi Anggaran ' : 'Sisa '}
                {formatIDR(Math.abs(remaining))}
              </span>
            </div>

            <span className="text-xs text-[#757A95] font-medium hidden sm:inline">
              ({percentage}% terpakai, {Math.max(0, 100 - percentage)}% ruang aman tersisa)
            </span>
          </div>
        </div>

        {/* Right Column: Key Stats Breakdown in 3 Clean Soft Metric Boxes (Never truncated) */}
        <div className="lg:col-span-6 grid grid-cols-3 gap-2 sm:gap-3">
          {/* Box 1: Total Budget */}
          <div className="p-3 sm:p-4 rounded-2xl bg-white/90 border border-black/[0.05] shadow-2xs space-y-1">
            <span className="text-[10px] sm:text-[11px] font-bold text-[#757A95] uppercase tracking-wider block">
              Total Anggaran
            </span>
            <div className="text-xs sm:text-sm font-black text-[#242636] whitespace-nowrap">
              {formatIDR(totalBudget)}
            </div>
          </div>

          {/* Box 2: Total Spent */}
          <div className="p-3 sm:p-4 rounded-2xl bg-white/90 border border-black/[0.05] shadow-2xs space-y-1">
            <span className="text-[10px] sm:text-[11px] font-bold text-[#757A95] uppercase tracking-wider block">
              Terpakai
            </span>
            <div className="text-xs sm:text-sm font-black text-[#7C7CE6] whitespace-nowrap">
              {formatIDR(totalSpent)}
            </div>
          </div>

          {/* Box 3: Remaining */}
          <div className="p-3 sm:p-4 rounded-2xl bg-white/90 border border-black/[0.05] shadow-2xs space-y-1">
            <span className="text-[10px] sm:text-[11px] font-bold text-[#757A95] uppercase tracking-wider block">
              Sisa Saldo
            </span>
            <div
              className={`text-xs sm:text-sm font-black whitespace-nowrap ${
                isOverBudget ? 'text-[#B83A38]' : 'text-[#1B7354]'
              }`}
            >
              {formatIDR(remaining)}
            </div>
          </div>
        </div>
      </div>

      {/* Large Hero Progress Visualization */}
      <div className="relative z-10 pt-2 space-y-2">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-[#757A95]">Kecepatan Pengeluaran Bulanan</span>
          <span
            className={`font-black text-sm ${
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

        <div className="flex items-center justify-between text-[11px] text-[#757A95] font-medium pt-0.5">
          <span>0%</span>
          <span className="hidden sm:inline">50% Batas Aman Tengah Bulan</span>
          <span className="text-right">100% (Batas Maksimal)</span>
        </div>
      </div>
    </div>
  );
}
