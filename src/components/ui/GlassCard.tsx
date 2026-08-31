'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface GlassCardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'subtle' | 'tinted' | 'borderless';
  interactive?: boolean;
}

export default function GlassCard({
  children,
  className = '',
  variant = 'default',
  interactive = false,
  ...motionProps
}: GlassCardProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'elevated':
        return 'bg-white/85 backdrop-blur-2xl shadow-[0_12px_36px_-6px_rgba(48,51,74,0.06),0_0_0_1px_rgba(36,38,54,0.04)] border border-white/90';
      case 'subtle':
        return 'bg-white/50 backdrop-blur-md shadow-[0_4px_20px_rgba(48,51,74,0.02)] border border-white/60';
      case 'tinted':
        return 'bg-gradient-to-br from-[#E4E2FB]/40 via-white/70 to-[#D6E4FA]/30 backdrop-blur-xl border border-white/80 shadow-[0_10px_30px_rgba(124,124,230,0.05)]';
      case 'borderless':
        return 'bg-white/60 backdrop-blur-lg shadow-none border-0';
      default:
        return 'bg-white/75 backdrop-blur-xl shadow-[0_8px_30px_rgba(48,51,74,0.04)] border border-white/80';
    }
  };

  return (
    <motion.div
      whileHover={interactive ? { y: -2, transition: { duration: 0.2 } } : undefined}
      className={`rounded-3xl p-6 transition-all ${getVariantStyles()} ${
        interactive ? 'cursor-pointer hover:shadow-[0_16px_40px_-8px_rgba(124,124,230,0.12)]' : ''
      } ${className}`}
      {...motionProps}
    >
      {children}
    </motion.div>
  );
}
