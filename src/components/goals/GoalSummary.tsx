'use client';

import React from 'react';
import { Target, TrendingUp, Sparkles, CheckCircle2 } from 'lucide-react';
import { formatIDR } from '@/lib/format';

interface GoalSummaryProps {
  totalTarget: number;
  totalSaved: number;
  progressPercent: number;
  activeCount: number;
  completedCount?: number;
}

export default function GoalSummary({
  totalTarget,
  totalSaved,
  progressPercent,
  activeCount,
  completedCount = 0,
}: GoalSummaryProps) {
  return (
    <div className="p-6 sm:p-7 rounded-[28px] bg-gradient-to-br from-white/95 via-white/90 to-[#F5F4FE]/80 border border-white shadow-[0_12px_35px_rgba(36,38,54,0.04)] relative overflow-hidden">
      {/* Background ambient soft glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#7C7CE6]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-[#D0EFE5]/20 rounded-full blur-2xl pointer-events-none" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 relative z-10">
        {/* Metric 1: Total Target */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-[#757A95]">
            <Target size={14} className="text-[#7C7CE6]" />
            <span className="text-[11px] font-extrabold uppercase tracking-wider">
              Total Target
            </span>
          </div>
          <div className="text-xl sm:text-2xl lg:text-3xl font-black text-[#242636] tracking-tight tabular-nums">
            {formatIDR(totalTarget)}
          </div>
          <span className="text-[11px] text-[#757A95] font-medium block">
            Akumulasi seluruh impian
          </span>
        </div>

        {/* Metric 2: Terkumpul */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-[#757A95]">
            <TrendingUp size={14} className="text-[#10B981]" />
            <span className="text-[11px] font-extrabold uppercase tracking-wider">
              Terkumpul
            </span>
          </div>
          <div className="text-xl sm:text-2xl lg:text-3xl font-black text-[#1B7354] tracking-tight tabular-nums">
            {formatIDR(totalSaved)}
          </div>
          <span className="text-[11px] text-[#1B7354] font-semibold block">
            Dana riil telah disisihkan
          </span>
        </div>

        {/* Metric 3: Progress Rata-rata */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-[#757A95]">
            <Sparkles size={14} className="text-[#7C7CE6]" />
            <span className="text-[11px] font-extrabold uppercase tracking-wider">
              Progress
            </span>
          </div>
          <div className="text-xl sm:text-2xl lg:text-3xl font-black text-[#5F5ED4] tracking-tight tabular-nums">
            {progressPercent}%
          </div>
          {/* Visual Mini Progress Bar */}
          <div className="w-full max-w-[140px] h-2 bg-[#EAE9F5] rounded-full overflow-hidden">
            <div
              style={{ width: `${Math.min(progressPercent, 100)}%` }}
              className="h-full rounded-full bg-gradient-to-r from-[#7C7CE6] to-[#8C8BE8] transition-all duration-700"
            />
          </div>
        </div>

        {/* Metric 4: Target Aktif */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-[#757A95]">
            <CheckCircle2 size={14} className="text-[#7C7CE6]" />
            <span className="text-[11px] font-extrabold uppercase tracking-wider">
              Target Aktif
            </span>
          </div>
          <div className="text-xl sm:text-2xl lg:text-3xl font-black text-[#242636] tracking-tight tabular-nums">
            {activeCount}
          </div>
          <span className="text-[11px] text-[#757A95] font-medium block">
            {completedCount > 0 ? `${completedCount} target telah tercapai` : 'Sedang dalam proses menabung'}
          </span>
        </div>
      </div>
    </div>
  );
}
