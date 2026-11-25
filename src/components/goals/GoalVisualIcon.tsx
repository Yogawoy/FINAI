'use client';

import React from 'react';
import { GoalCategoryType, GoalColorTheme } from '@/types';
import { renderGoalCategoryIcon } from '@/components/categories/CategoryIcon';

interface GoalVisualIconProps {
  category: GoalCategoryType;
  colorTheme?: GoalColorTheme;
  size?: number;
  className?: string;
}

export const GOAL_THEME_COLORS: Record<
  GoalColorTheme,
  { bg: string; text: string; border: string; bar: string; lightBg: string }
> = {
  periwinkle: {
    bg: 'bg-[#EDEAFC]',
    text: 'text-[#5F5ED4]',
    border: 'border-[#7C7CE6]/20',
    bar: 'bg-[#7C7CE6]',
    lightBg: 'bg-[#F5F4FE]',
  },
  lavender: {
    bg: 'bg-[#EFE8FC]',
    text: 'text-[#7A45DC]',
    border: 'border-[#9F7AEA]/20',
    bar: 'bg-[#9F7AEA]',
    lightBg: 'bg-[#F9F5FE]',
  },
  iceblue: {
    bg: 'bg-[#E3EFFD]',
    text: 'text-[#2563EB]',
    border: 'border-[#3B82F6]/20',
    bar: 'bg-[#3B82F6]',
    lightBg: 'bg-[#F0F7FF]',
  },
  mint: {
    bg: 'bg-[#D0EFE5]',
    text: 'text-[#1B7354]',
    border: 'border-[#1B7354]/20',
    bar: 'bg-[#10B981]',
    lightBg: 'bg-[#EBF8F3]',
  },
  peach: {
    bg: 'bg-[#FCE2E0]',
    text: 'text-[#C93B38]',
    border: 'border-[#FAC2BE]',
    bar: 'bg-[#F87171]',
    lightBg: 'bg-[#FFF2F1]',
  },
  indigo: {
    bg: 'bg-[#EDEAFC]',
    text: 'text-[#5F5ED4]',
    border: 'border-[#7C7CE6]/20',
    bar: 'bg-[#7C7CE6]',
    lightBg: 'bg-[#F5F4FE]',
  },
};

export default function GoalVisualIcon({
  category,
  colorTheme = 'periwinkle',
  size = 20,
  className = '',
}: GoalVisualIconProps) {
  const theme = GOAL_THEME_COLORS[colorTheme] || GOAL_THEME_COLORS.periwinkle;

  return (
    <div
      className={`rounded-2xl flex items-center justify-center shrink-0 ${theme.bg} ${theme.text} border ${theme.border} ${className}`}
    >
      {renderGoalCategoryIcon(category, size, 2.2)}
    </div>
  );
}
