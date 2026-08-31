'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface BudgetProgressProps {
  percentage: number;
  size?: 'sm' | 'md' | 'lg' | 'hero';
  showLabel?: boolean;
  className?: string;
  animate?: boolean;
}

export default function BudgetProgress({
  percentage,
  size = 'md',
  showLabel = false,
  className = '',
  animate = true,
}: BudgetProgressProps) {
  const clampedPercentage = Math.max(0, percentage);
  const displayWidth = Math.min(clampedPercentage, 100);

  // Status-based color gradients (Konsisten, harmonis, dan tidak belang)
  const getBarGradient = () => {
    if (percentage > 100) {
      // Over Budget: Soft Coral Red
      return 'bg-gradient-to-r from-[#EF4444] to-[#DC2626] shadow-[0_2px_8px_rgba(220,38,38,0.2)]';
    }
    if (percentage >= 90) {
      // Critical: Coral Red
      return 'bg-gradient-to-r from-[#F87171] to-[#EF4444] shadow-[0_2px_8px_rgba(239,68,68,0.2)]';
    }
    if (percentage >= 70) {
      // Almost There: Warm Amber / Soft Orange
      return 'bg-gradient-to-r from-[#FBBF24] to-[#F59E0B] shadow-[0_2px_8px_rgba(245,158,11,0.2)]';
    }
    // On Track (0 - 69%): Konsisten Periwinkle FinAI
    return 'bg-gradient-to-r from-[#7C7CE6] to-[#8E9AF7] shadow-[0_2px_8px_rgba(124,124,230,0.2)]';
  };

  const getHeightClass = () => {
    switch (size) {
      case 'sm':
        return 'h-2';
      case 'lg':
        return 'h-3.5';
      case 'hero':
        return 'h-4 sm:h-5';
      default:
        return 'h-2.5';
    }
  };

  return (
    <div className={`w-full space-y-1.5 ${className}`}>
      {showLabel && (
        <div className="flex items-center justify-between text-xs font-bold text-[#757A95]">
          <span>Progress</span>
          <span
            className={
              percentage > 100
                ? 'text-[#B83A38]'
                : percentage >= 70
                ? 'text-[#B45309]'
                : 'text-[#5F5ED4]'
            }
          >
            {Math.round(percentage)}%
          </span>
        </div>
      )}

      {/* Progress Track */}
      <div
        className={`w-full ${getHeightClass()} rounded-full bg-[#EBEAF5] overflow-hidden p-0.5 relative`}
      >
        <motion.div
          initial={animate ? { width: 0 } : false}
          animate={{ width: `${displayWidth}%` }}
          transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
          className={`h-full rounded-full ${getBarGradient()} transition-all duration-300 relative`}
        >
          {/* Subtle light shimmer on top of the bar */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent rounded-full pointer-events-none" />
        </motion.div>
      </div>
    </div>
  );
}
