'use client';

import React from 'react';
import { Wallet, Receipt, Target, PieChart } from 'lucide-react';
import { formatIDR } from '@/lib/format';

interface AIContextBarProps {
  balance?: number;
  monthlyExpense?: number;
  activeGoalsCount?: number;
  activeBudgetsCount?: number;
}

export default function AIContextBar({
  balance = 0,
  monthlyExpense = 0,
  activeGoalsCount = 0,
  activeBudgetsCount = 0,
}: AIContextBarProps) {
  return (
    <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-[#E8EAF2]/80 shadow-[0_2px_12px_rgba(36,38,54,0.02)]">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6 text-xs divide-x-0 sm:divide-x divide-[#E8EAF2]">
          {/* Saldo Kas */}
          <div className="flex items-center gap-2 sm:pl-0">
            <div className="w-7 h-7 rounded-lg bg-[#EDEAFC] text-[#5F5ED4] flex items-center justify-center shrink-0">
              <Wallet size={13} />
            </div>
            <div>
              <span className="block text-[10px] text-[#757A95] font-medium leading-none">Saldo Kas</span>
              <span className="text-xs font-bold text-[#242636] tabular-nums mt-0.5 block">
                {formatIDR(balance)}
              </span>
            </div>
          </div>

          {/* Pengeluaran Bulan Ini */}
          <div className="flex items-center gap-2 sm:pl-6">
            <div className="w-7 h-7 rounded-lg bg-[#FEF3F2] text-[#D94F4F] flex items-center justify-center shrink-0">
              <Receipt size={13} />
            </div>
            <div>
              <span className="block text-[10px] text-[#757A95] font-medium leading-none">Bulan Ini</span>
              <span className="text-xs font-bold text-[#242636] tabular-nums mt-0.5 block">
                {formatIDR(monthlyExpense)}
              </span>
            </div>
          </div>

          {/* Target Impian Aktif */}
          <div className="flex items-center gap-2 sm:pl-6">
            <div className="w-7 h-7 rounded-lg bg-[#EDEAFC] text-[#5F5ED4] flex items-center justify-center shrink-0">
              <Target size={13} />
            </div>
            <div>
              <span className="block text-[10px] text-[#757A95] font-medium leading-none">Target Impian</span>
              <span className="text-xs font-bold text-[#242636] tabular-nums mt-0.5 block">
                {activeGoalsCount} Target
              </span>
            </div>
          </div>

          {/* Pos Anggaran Aktif */}
          <div className="flex items-center gap-2 sm:pl-6">
            <div className="w-7 h-7 rounded-lg bg-[#EBF7F2] text-[#1B7354] flex items-center justify-center shrink-0">
              <PieChart size={13} />
            </div>
            <div>
              <span className="block text-[10px] text-[#757A95] font-medium leading-none">Pos Anggaran</span>
              <span className="text-xs font-bold text-[#242636] tabular-nums mt-0.5 block">
                {activeBudgetsCount} Pos
              </span>
            </div>
          </div>
        </div>
    </div>
  );
}
