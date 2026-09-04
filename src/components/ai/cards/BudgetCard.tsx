'use client';

import React from 'react';
import { PieChart, Calendar, TrendingUp, AlertTriangle } from 'lucide-react';
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

export default function BudgetCard({
  category,
  limitAmount,
  usedAmount,
  remainingAmount,
  percentage,
  status,
  period,
}: BudgetCardProps) {
  const pct = Math.min(Math.max(percentage, 0), 100);
  const isOver = percentage > 100;
  const isWarning = percentage >= 80 && percentage <= 100;
  const isSafe = percentage < 80;

  const statusText = isOver
    ? 'Over budget'
    : isWarning
    ? 'Mendekati batas'
    : 'Masih dalam batas budget';
  const statusColor = isOver ? 'text-[#D94F4F]' : isWarning ? 'text-[#E09D3B]' : 'text-[#1B7354]';
  const barColor = isOver ? 'bg-[#E96A64]' : isWarning ? 'bg-[#F0A500]' : 'bg-[#7C7CE6]';

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E8EAF2] shadow-[0_6px_24px_rgba(36,38,54,0.04)] space-y-4 max-w-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="px-2.5 py-0.5 rounded-full bg-[#EDEAFC] text-[#5F5ED4] text-[10px] font-bold uppercase tracking-wider">
            Budget
          </span>
          <h4 className="text-sm sm:text-base font-bold text-[#242636] mt-1.5">{category}</h4>
          {period && (
            <span className="text-[11px] text-[#757A95] flex items-center gap-1 mt-0.5">
              <Calendar size={12} /> {period}
            </span>
          )}
        </div>
        <div className="text-right">
          <span className="text-[10px] text-[#757A95] font-semibold block">Terpakai</span>
          <span className={`text-sm font-black ${isOver ? 'text-[#D94F4F]' : 'text-[#242636]'}`}>{Math.round(percentage)}%</span>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-baseline gap-1.5">
          <span className="text-lg font-black text-[#242636] tabular-nums">{formatIDR(usedAmount)}</span>
          <span className="text-xs text-[#757A95]">dari {formatIDR(limitAmount)}</span>
        </div>
        <div className="w-full h-2.5 rounded-full bg-[#F0EFFC] overflow-hidden p-0.5">
          <div
            className={`h-full rounded-full transition-all ${barColor}`}
            style={{ width: `${Math.min(pct, 100)}%` }}
          />
        </div>
        {isOver && <div className="h-1 w-full rounded-full bg-[#FCE2E0] -mt-1 opacity-60" style={{ width: `${Math.min(percentage - 100, 30)}%` }} />}
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-[#E8EAF2]/70">
        <div>
          <span className="text-[#757A95] flex items-center gap-1">
            <TrendingUp size={12} /> Terpakai
          </span>
          <span className="font-bold text-[#242636] tabular-nums">{formatIDR(usedAmount)}</span>
        </div>
        <div className="text-right">
          <span className="text-[#757A95] block">Sisa</span>
          <span className={`font-bold tabular-nums ${isOver ? 'text-[#D94F4F]' : 'text-[#1B7354]'}`}>
            {isOver ? `- ${formatIDR(Math.abs(remainingAmount))}` : formatIDR(remainingAmount)}
          </span>
        </div>
        {isOver && (
          <div className="col-span-2 flex items-center gap-1.5 text-[#D94F4F] bg-[#FEF3F2] p-2 rounded-xl border border-[#FCE2E0]">
            <AlertTriangle size={12} />
            <span className="font-semibold text-xs">Over budget {formatIDR(Math.abs(remainingAmount))}</span>
          </div>
        )}
        <div className="col-span-2 flex items-center justify-between text-[11px]">
          <span className="text-[#757A95]">Status</span>
          <span className={`font-bold flex items-center gap-1 ${statusColor}`}>
            {isOver && <AlertTriangle size={12} />}
            {status || statusText}
          </span>
        </div>
      </div>
    </div>
  );
}
