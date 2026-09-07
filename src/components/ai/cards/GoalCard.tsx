'use client';

import React from 'react';
import { Target, Calendar, PiggyBank } from 'lucide-react';
import { formatIDR } from '@/lib/format';

interface GoalCardProps {
  name: string;
  targetAmount: number;
  currentAmount: number;
  remainingAmount: number;
  percentage: number;
  deadline?: string | null;
  category?: string;
}

function formatDeadline(dateStr?: string | null): string | null {
  if (!dateStr) return null;
  try {
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return null;
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return null;
  }
}

export default function GoalCard({
  name,
  targetAmount,
  currentAmount,
  remainingAmount,
  percentage,
  deadline,
  category,
}: GoalCardProps) {
  const pct = Math.min(Math.max(percentage, 0), 100);
  const isCompleted = percentage >= 100;
  const deadlineLabel = formatDeadline(deadline);

  return (
    <div className="w-full sm:w-[420px] max-w-md p-5 rounded-2xl bg-white border border-[#E8EAF2] shadow-[0_6px_24px_rgba(36,38,54,0.04)] space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="px-2.5 py-0.5 rounded-full bg-[#EDEAFC] text-[#5F5ED4] text-[10px] font-bold uppercase tracking-wider">
            Target Impian
          </span>
          <h4 className="text-sm sm:text-base font-bold text-[#242636] mt-1.5">{name}</h4>
          {category && <span className="text-[11px] text-[#757A95]">{category}</span>}
        </div>
        <div className="text-right">
          <span className="text-[10px] text-[#757A95] font-semibold block">Progress</span>
          <span className={`text-sm font-black ${isCompleted ? 'text-[#1B7354]' : 'text-[#7C7CE6]'}`}>
            {Math.round(percentage)}%
          </span>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-baseline gap-1.5">
          <span className="text-lg font-black text-[#242636] tabular-nums">{formatIDR(currentAmount)}</span>
          <span className="text-xs text-[#757A95]">dari {formatIDR(targetAmount)}</span>
        </div>
        <div className="w-full h-2.5 rounded-full bg-[#F0EFFC] overflow-hidden p-0.5">
          <div
            className={`h-full rounded-full transition-all ${isCompleted ? 'bg-[#1B7354]' : 'bg-[#7C7CE6]'}`}
            style={{ width: `${Math.min(pct, 100)}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-[#E8EAF2]/70">
        <div>
          <span className="text-[#757A95] flex items-center gap-1">
            <PiggyBank size={12} /> Terkumpul
          </span>
          <span className="font-bold text-[#242636] tabular-nums">{formatIDR(currentAmount)}</span>
        </div>
        <div className="text-right">
          <span className="text-[#757A95] block">Sisa</span>
          <span className="font-bold text-[#757A95] tabular-nums">{formatIDR(remainingAmount)}</span>
        </div>
        <div>
          <span className="text-[#757A95] block">Target</span>
          <span className="font-bold text-[#242636] tabular-nums">{formatIDR(targetAmount)}</span>
        </div>
        {deadlineLabel && (
          <div className="text-right">
            <span className="text-[#757A95] flex items-center justify-end gap-1">
              <Calendar size={12} /> Deadline
            </span>
            <span className="font-semibold text-[#242636] text-[11px]">{deadlineLabel}</span>
          </div>
        )}
      </div>

      {isCompleted && (
        <div className="p-2.5 rounded-xl bg-[#EBF7F2] border border-[#D0EFE5] text-xs font-bold text-[#1B7354] flex items-center gap-1.5">
          <Target size={14} /> Target tercapai!
        </div>
      )}
    </div>
  );
}
