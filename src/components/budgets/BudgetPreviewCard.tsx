'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { TransactionCategory, BudgetPeriod } from '@/types';
import { formatIDR } from '@/data/mockData';
import { getCategoryIconComponent } from './BudgetRow';
import { BUDGET_CATEGORIES } from './BudgetCategorySelector';

interface BudgetPreviewCardProps {
  category: TransactionCategory;
  customName?: string;
  amount: number;
  period: BudgetPeriod;
  startDate?: string;
  spent?: number;
  helperText?: string;
}

export default function BudgetPreviewCard({
  category,
  customName,
  amount,
  period,
  startDate = '2026-08-31',
  spent = 0,
  helperText = 'Anda dapat memperbarui nominal atau kategori ini kapan saja nanti.',
}: BudgetPreviewCardProps) {
  const catOption = BUDGET_CATEGORIES.find((c) => c.id === category) || BUDGET_CATEGORIES[0];
  const title = customName?.trim() || catOption.label;
  const percentage = amount > 0 ? Math.min(100, Math.round((spent / amount) * 100)) : 0;

  // Format readable Indonesian start date
  const formatReadableDate = (d?: string) => {
    if (!d) return '31 Agt 2026';
    try {
      const parsed = new Date(d);
      if (isNaN(parsed.getTime())) return d;
      return parsed.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return d;
    }
  };

  const periodLabel =
    period === 'weekly' ? 'Anggaran Mingguan' : period === 'custom' ? 'Anggaran Kustom' : 'Anggaran Bulanan';

  return (
    <div className="w-full space-y-3.5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#757A95]">
          Pratinjau Anggaran
        </span>
      </div>

      {/* Modern Gradient Budget Card */}
      <div className="relative overflow-hidden rounded-[26px] bg-gradient-to-br from-[#7C7CE6] via-[#7372DC] to-[#5B5AD0] p-6 text-white shadow-[0_16px_36px_rgba(124,124,230,0.35)] border border-white/20 flex flex-col justify-between min-h-[260px] space-y-4">
        {/* Soft background ambient glow */}
        <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-white/15 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-black/10 blur-xl pointer-events-none" />

        {/* Top: Circular Category Icon */}
        <div className="relative z-10">
          <div className="w-12 h-12 rounded-full bg-white text-[#5F5ED4] flex items-center justify-center shadow-[0_4px_14px_rgba(0,0,0,0.12)]">
            {getCategoryIconComponent(category, 22)}
          </div>
        </div>

        {/* Middle: Title & Big Amount */}
        <div className="relative z-10 space-y-1">
          <div>
            <h4 className="text-base sm:text-lg font-bold tracking-tight text-white truncate">
              {title}
            </h4>
            <p className="text-xs text-white/80 font-medium">
              {periodLabel}
            </p>
          </div>

          <div className="pt-2">
            <div className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {formatIDR(amount)}
            </div>
            <p className="text-[11px] text-white/70 font-medium">
              mulai {formatReadableDate(startDate)}
            </p>
          </div>
        </div>

        {/* Bottom: Progress Bar */}
        <div className="relative z-10 space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-[11px] font-bold text-white/90">
            <span>{percentage}% terpakai</span>
            <span>100%</span>
          </div>

          {/* Progress Track */}
          <div className="w-full h-1.5 rounded-full bg-white/25 overflow-hidden p-0.5 relative">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="h-full rounded-full bg-white shadow-xs"
            />
          </div>
        </div>
      </div>

      {/* Helper text below card */}
      <div className="flex items-center gap-2 p-3 rounded-2xl bg-[#F8F9FD] border border-black/[0.04] text-[#757A95] text-xs">
        <div className="w-5 h-5 rounded-lg bg-[#EDEAFC] text-[#7C7CE6] flex items-center justify-center shrink-0">
          <Sparkles size={12} />
        </div>
        <p className="text-[11px] leading-relaxed">{helperText}</p>
      </div>
    </div>
  );
}
