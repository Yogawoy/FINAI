'use client';

import React from 'react';
import { TrendingUp, TrendingDown, Wallet, Target, PieChart } from 'lucide-react';
import { formatIDR } from '@/lib/format';

interface SummaryCardProps {
  period?: string;
  income: number;
  expense: number;
  remaining: number;
  budgetPercentage?: number;
  activeGoals?: number;
}

export default function SummaryCard({
  period = 'Bulan Ini',
  income,
  expense,
  remaining,
  budgetPercentage,
  activeGoals,
}: SummaryCardProps) {
  const isPositive = remaining >= 0;

  return (
    <div className="w-full sm:w-[420px] max-w-md p-5 rounded-2xl bg-white border border-[#E8EAF2] shadow-[0_6px_24px_rgba(36,38,54,0.04)] space-y-4">
      <div className="flex items-center justify-between">
        <span className="px-2.5 py-0.5 rounded-full bg-[#EDEAFC] text-[#5F5ED4] text-[10px] font-bold uppercase tracking-wider">
          Ringkasan
        </span>
        <span className="text-[11px] text-[#757A95] font-medium">{period}</span>
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="p-2.5 rounded-xl bg-[#EBF7F2] border border-[#D0EFE5]/50">
          <span className="flex items-center justify-center gap-1 text-[10px] font-bold text-[#1B7354] uppercase">
            <TrendingUp size={12} /> Pemasukan
          </span>
          <span className="text-xs font-black text-[#1B7354] tabular-nums block mt-1">{formatIDR(income)}</span>
        </div>
        <div className="p-2.5 rounded-xl bg-[#FEF3F2] border border-[#FCE2E0]/50">
          <span className="flex items-center justify-center gap-1 text-[10px] font-bold text-[#D94F4F] uppercase">
            <TrendingDown size={12} /> Pengeluaran
          </span>
          <span className="text-xs font-black text-[#D94F4F] tabular-nums block mt-1">{formatIDR(expense)}</span>
        </div>
        <div className={`p-2.5 rounded-xl border ${isPositive ? 'bg-[#EDEAFC] border-[#E4E2FB]' : 'bg-[#FEF3F2] border-[#FCE2E0]'}`}>
          <span className={`flex items-center justify-center gap-1 text-[10px] font-bold uppercase ${isPositive ? 'text-[#5F5ED4]' : 'text-[#D94F4F]'}`}>
            <Wallet size={12} /> Sisa
          </span>
          <span className={`text-xs font-black tabular-nums block mt-1 ${isPositive ? 'text-[#5F5ED4]' : 'text-[#D94F4F]'}`}>
            {formatIDR(remaining)}
          </span>
        </div>
      </div>

      {(budgetPercentage !== undefined || activeGoals !== undefined) && (
        <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-[#E8EAF2]/70">
          {budgetPercentage !== undefined && (
            <div className="flex items-center justify-between">
              <span className="text-[#757A95] flex items-center gap-1">
                <PieChart size={12} /> Budget terpakai
              </span>
              <span className="font-bold text-[#242636]">{Math.round(budgetPercentage)}%</span>
            </div>
          )}
          {activeGoals !== undefined && (
            <div className="flex items-center justify-between">
              <span className="text-[#757A95] flex items-center gap-1">
                <Target size={12} /> Target aktif
              </span>
              <span className="font-bold text-[#242636]">{activeGoals}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
