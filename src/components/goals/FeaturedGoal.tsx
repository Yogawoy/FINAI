'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Sparkles,
  TrendingUp,
  Plus,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { GoalItem } from '@/types';
import { formatIDR } from '@/data/mockData';
import GoalVisualIcon, { GOAL_THEME_COLORS } from './GoalVisualIcon';
import GoalStatusBadge from './GoalStatusBadge';

interface FeaturedGoalProps {
  goal: GoalItem;
  onViewDetail: (goal: GoalItem) => void;
  onAddContribution: (goal: GoalItem) => void;
}

export default function FeaturedGoal({
  goal,
  onViewDetail,
  onAddContribution,
}: FeaturedGoalProps) {
  const percentage =
    goal.targetAmount > 0
      ? Math.min(Math.round((goal.currentAmount / goal.targetAmount) * 100), 100)
      : 0;

  const remaining = Math.max(goal.targetAmount - goal.currentAmount, 0);
  const theme = GOAL_THEME_COLORS[goal.colorTheme] || GOAL_THEME_COLORS.periwinkle;

  // Format date display (e.g. 31 Des 2026)
  const formatDeadline = (d: string) => {
    if (!d) return 'Desember 2026';
    const parts = d.split('-');
    if (parts.length === 3) {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
      return `${parts[2]} ${months[parseInt(parts[1], 10) - 1]} ${parts[0]}`;
    }
    return d;
  };

  return (
    <div className="p-6 sm:p-8 rounded-[32px] bg-gradient-to-br from-white via-[#FCFBFE] to-[#F3F0FE] border border-[#E8E4F8] shadow-[0_16px_45px_rgba(124,124,230,0.08)] relative overflow-hidden">
      {/* Background ambient abstract glow & mesh */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#7C7CE6]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-[#D0EFE5]/30 rounded-full blur-2xl pointer-events-none" />

      {/* Abstract background SVG curves (subtle watermark) */}
      <div className="absolute right-4 bottom-4 opacity-5 pointer-events-none">
        <svg width="220" height="220" viewBox="0 0 200 200" fill="currentColor">
          <circle cx="100" cy="100" r="80" stroke="currentColor" strokeWidth="12" fill="none" />
          <path d="M100 20 A80 80 0 0 1 180 100" stroke="#7C7CE6" strokeWidth="16" fill="none" strokeLinecap="round" />
        </svg>
      </div>

      <div className="relative z-10 space-y-6">
        {/* Top Header Row: Featured Goal Label + Status Badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-[#EDEAFC] text-[#5F5ED4] border border-[#7C7CE6]/30 flex items-center gap-1.5">
              <Sparkles size={12} />
              <span>Target Utama</span>
            </span>
            <span className="text-xs text-[#757A95]">
              Prioritas target saat ini
            </span>
          </div>

          <GoalStatusBadge status={goal.status} size="md" />
        </div>

        {/* Middle Main Content Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left info (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-start gap-4">
              <GoalVisualIcon
                category={goal.category}
                colorTheme={goal.colorTheme}
                size={26}
                className="w-14 h-14 shadow-xs"
              />

              <div className="space-y-1">
                <h3 className="text-2xl sm:text-3xl font-black text-[#242636] tracking-tight">
                  {goal.title}
                </h3>
                {goal.notes && (
                  <p className="text-xs sm:text-sm text-[#757A95] line-clamp-1">
                    {goal.notes}
                  </p>
                )}
              </div>
            </div>

            {/* Main Numbers: Terkumpul / Target */}
            <div className="space-y-2 pt-1">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-xs font-bold text-[#757A95] uppercase tracking-wider block">
                    Terkumpul
                  </span>
                  <div className="text-2xl sm:text-3xl font-black text-[#242636] tabular-nums tracking-tight">
                    {formatIDR(goal.currentAmount)}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-[#757A95] uppercase tracking-wider block">
                    Target Dana
                  </span>
                  <div className="text-base sm:text-lg font-bold text-[#757A95] tabular-nums">
                    {formatIDR(goal.targetAmount)}
                  </div>
                </div>
              </div>

              {/* Large Animated Progress Bar */}
              <div className="space-y-1.5 pt-1">
                <div className="w-full h-3.5 bg-[#EAE9F5] rounded-full overflow-hidden p-0.5 shadow-inner">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                    className="h-full rounded-full bg-gradient-to-r from-[#7C7CE6] via-[#8C8BE8] to-[#6867DB] shadow-xs"
                  />
                </div>

                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-[#5F5ED4]">{percentage}% Tercapai</span>
                  <span className="text-[#757A95]">Sisa: {formatIDR(remaining)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Metrics & Quick Actions (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-4 lg:pl-4 lg:border-l border-black/[0.06]">
            {/* 2 Information Metric Boxes */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-white/90 border border-black/[0.05] shadow-2xs space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#757A95] block">
                  Target Tanggal
                </span>
                <div className="flex items-center gap-1.5 text-xs sm:text-sm font-extrabold text-[#242636]">
                  <Calendar size={14} className="text-[#7C7CE6]" />
                  <span>{formatDeadline(goal.targetDate)}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/90 border border-black/[0.05] shadow-2xs space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#757A95] block">
                  Kebutuhan Nabung
                </span>
                <div className="flex items-center gap-1.5 text-xs sm:text-sm font-extrabold text-[#1B7354] tabular-nums">
                  <TrendingUp size={14} />
                  <span>{formatIDR(goal.monthlySaving)}/bln</span>
                </div>
              </div>
            </div>

            {/* Funding Route Tag */}
            <div className="px-3.5 py-2 rounded-2xl bg-white/90 border border-black/[0.05] flex items-center justify-between text-xs">
              <span className="text-[10px] font-bold text-[#757A95] uppercase tracking-wider">
                Alur Tabungan
              </span>
              <div className="flex items-center gap-1.5 font-bold">
                <span className="text-[#242636]">{goal.sourceWalletName || 'BCA'}</span>
                <ArrowRight size={12} className="text-[#7C7CE6]" />
                <span className="text-[#5F5ED4]">{goal.destinationWalletName || 'Tabungan'}</span>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => onAddContribution(goal)}
                className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-[#7C7CE6] to-[#8C8BE8] hover:brightness-105 active:scale-[0.98] text-white font-bold text-xs sm:text-sm shadow-[0_8px_20px_rgba(124,124,230,0.35)] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus size={15} />
                <span>Tambah Tabungan</span>
              </button>

              <button
                type="button"
                onClick={() => onViewDetail(goal)}
                className="py-3 px-4 rounded-2xl bg-white hover:bg-[#F4F3F9] text-[#242636] font-bold text-xs sm:text-sm border border-black/[0.08] shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>Detail</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
