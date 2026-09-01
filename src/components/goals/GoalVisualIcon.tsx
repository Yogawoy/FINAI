'use client';

import React from 'react';
import {
  Laptop,
  Plane,
  ShieldCheck,
  Bike,
  Home,
  GraduationCap,
  Heart,
  Sparkles,
  Car,
} from 'lucide-react';
import { GoalCategoryType, GoalColorTheme } from '@/types';

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
};

export default function GoalVisualIcon({
  category,
  colorTheme = 'periwinkle',
  size = 20,
  className = '',
}: GoalVisualIconProps) {
  const theme = GOAL_THEME_COLORS[colorTheme] || GOAL_THEME_COLORS.periwinkle;

  const renderIcon = () => {
    switch (category) {
      case 'laptop':
        return <Laptop size={size} strokeWidth={2.2} />;
      case 'travel':
        return <Plane size={size} strokeWidth={2.2} />;
      case 'emergency':
        return <ShieldCheck size={size} strokeWidth={2.2} />;
      case 'vehicle':
        return <Bike size={size} strokeWidth={2.2} />;
      case 'home':
        return <Home size={size} strokeWidth={2.2} />;
      case 'course':
        return <GraduationCap size={size} strokeWidth={2.2} />;
      case 'wedding':
        return <Heart size={size} strokeWidth={2.2} />;
      default:
        return <Sparkles size={size} strokeWidth={2.2} />;
    }
  };

  return (
    <div
      className={`rounded-2xl flex items-center justify-center shrink-0 ${theme.bg} ${theme.text} border ${theme.border} ${className}`}
    >
      {renderIcon()}
    </div>
  );
}
