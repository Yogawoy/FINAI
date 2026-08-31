'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface FloatingMetricProps {
  label: string;
  value: string;
  subvalue?: string;
  icon?: React.ReactNode;
  variant?: 'periwinkle' | 'mint' | 'iceblue' | 'peach' | 'glass';
  className?: string;
}

export default function FloatingMetric({
  label,
  value,
  subvalue,
  icon,
  variant = 'glass',
  className = '',
}: FloatingMetricProps) {
  const getIconColor = () => {
    switch (variant) {
      case 'mint':
        return 'bg-[#D0EFE5] text-[#1B7354]';
      case 'periwinkle':
        return 'bg-[#E4E2FB] text-[#7C7CE6]';
      case 'peach':
        return 'bg-[#FCE2E0] text-[#B83A38]';
      default:
        return 'bg-white text-[#7C7CE6]';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      whileHover={{ y: -3, scale: 1.02 }}
      className={`glass-panel px-4 py-2.5 rounded-2xl flex items-center gap-3 shadow-[0_10px_30px_rgba(48,51,74,0.04)] border border-white/90 cursor-default select-none ${className}`}
    >
      {icon && (
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shadow-xs shrink-0 ${getIconColor()}`}>
          {icon}
        </div>
      )}
      <div>
        <span className="text-[10px] uppercase font-bold text-[#757A95] tracking-wider block">
          {label}
        </span>
        <span className="text-xs sm:text-sm font-extrabold text-[#242636] block tabular-numbers">
          {value}
        </span>
        {subvalue && (
          <span className="text-[10px] text-[#757A95] block -mt-0.5">
            {subvalue}
          </span>
        )}
      </div>
    </motion.div>
  );
}
