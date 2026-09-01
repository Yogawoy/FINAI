'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, TrendingUp, Plus, ArrowUpRight } from 'lucide-react';
import { GoalItem } from '@/types';
import { formatIDR } from '@/data/mockData';
import GoalVisualIcon, { GOAL_THEME_COLORS } from './GoalVisualIcon';
import GoalStatusBadge from './GoalStatusBadge';

interface GoalCardProps {
  goal: GoalItem;
  onClick: () => void;
  onAddContribution: (e: React.MouseEvent) => void;
}

export default function GoalCard({
  goal,
  onClick,
  onAddContribution,
}: GoalCardProps) {
  const percentage =
    goal.targetAmount > 0
      ? Math.min(Math.round((goal.currentAmount / goal.targetAmount) * 100), 100)
      : 0;

  const remaining = Math.max(goal.targetAmount - goal.currentAmount, 0);
  const theme = GOAL_THEME_COLORS[goal.colorTheme] || GOAL_THEME_COLORS.periwinkle;

  const formatDeadline = (d: string) => {
    if (!d) return '';
    const parts = d.split('-');
    if (parts.length === 3) {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
      return `${months[parseInt(parts[1], 10) - 1]} ${parts[0]}`;
    }
    return d;
  };

  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.005 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className="p-5 sm:p-6 rounded-[26px] bg-white hover:bg-[#FAF9FE] border border-black/[0.05] shadow-[0_8px_30px_rgba(36,38,54,0.03)] hover:shadow-[0_12px_35px_rgba(124,124,230,0.1)] transition-all cursor-pointer flex flex-col justify-between space-y-4 select-none group"
    >
      {/* Top Row: Icon + Title & Category + Status Badge */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <GoalVisualIcon
              category={goal.category}
              colorTheme={goal.colorTheme}
              size={20}
              className="w-11 h-11 shadow-2xs group-hover:scale-105 transition-transform"
            />
            <div className="min-w-0">
              <h4 className="text-base font-bold text-[#242636] truncate group-hover:text-[#5F5ED4] transition-colors">
                {goal.title}
              </h4>
              <span className="text-[11px] text-[#5F5ED4] font-medium block truncate">
                {goal.destinationWalletName || 'Tabungan'}
              </span>
            </div>
          </div>

          <GoalStatusBadge status={goal.status} size="sm" />
        </div>

        {/* Amount Progress Hierarchy */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-baseline justify-between">
            <div className="text-sm sm:text-base font-extrabold text-[#242636] tabular-nums">
              {formatIDR(goal.currentAmount)}
              <span className="text-xs font-semibold text-[#757A95] ml-1">
                dari {formatIDR(goal.targetAmount)}
              </span>
            </div>
            <span className="text-xs font-extrabold text-[#5F5ED4] tabular-nums">
              {percentage}%
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2.5 bg-[#EAE9F5] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className={`h-full rounded-full ${theme.bar}`}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#757A95] font-semibold">
            <span>Sisa {formatIDR(remaining)}</span>
            <span>Target: {formatDeadline(goal.targetDate)}</span>
          </div>
        </div>
      </div>

      {/* Bottom Footer: Monthly Saving & Quick Add Button */}
      <div className="pt-3 border-t border-black/[0.04] flex items-center justify-between">
        <div className="space-y-0.5">
          <span className="text-[10px] font-bold text-[#757A95] uppercase tracking-wider block">
            Nabung Bulanan
          </span>
          <span className="text-xs font-extrabold text-[#1B7354] tabular-nums">
            {formatIDR(goal.monthlySaving)}/bln
          </span>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onAddContribution(e);
          }}
          className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-[#EDEAFC] hover:bg-[#E4E2FB] text-[#5F5ED4] font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
          title="Tambah Tabungan"
        >
          <Plus size={14} />
          <span className="hidden sm:inline">Setor</span>
        </button>
      </div>
    </motion.div>
  );
}
