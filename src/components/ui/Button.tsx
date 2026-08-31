'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface ButtonProps extends HTMLMotionProps<'button'> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'glass' | 'mint' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  className?: string;
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  className = '',
  ...props
}: ButtonProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-gradient-to-r from-[#7C7CE6] to-[#8C8BE8] text-white shadow-[0_4px_16px_rgba(124,124,230,0.3)] hover:shadow-[0_6px_22px_rgba(124,124,230,0.45)] hover:brightness-105 active:brightness-95 border-0';
      case 'secondary':
        return 'bg-[#E4E2FB] text-[#7C7CE6] hover:bg-[#D9D6F7] border border-[#7C7CE6]/15 shadow-sm';
      case 'glass':
        return 'bg-white/70 backdrop-blur-md text-[#242636] border border-white/80 shadow-[0_4px_16px_rgba(48,51,74,0.04)] hover:bg-white/90 hover:border-white';
      case 'mint':
        return 'bg-[#D0EFE5] text-[#1B7354] hover:bg-[#BCE6D9] border border-[#1B7354]/15 shadow-sm';
      case 'ghost':
        return 'bg-transparent text-[#757A95] hover:text-[#242636] hover:bg-black/[0.03] border-0 shadow-none';
      case 'danger':
        return 'bg-[#FCE2E0] text-[#B83A38] hover:bg-[#F9D0CD] border border-[#B83A38]/15';
      default:
        return 'bg-[#7C7CE6] text-white';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-xs rounded-xl gap-1.5 font-medium';
      case 'lg':
        return 'px-6 py-3.5 text-base rounded-2xl gap-2.5 font-semibold';
      default:
        return 'px-4 py-2.5 text-sm rounded-xl gap-2 font-medium';
    }
  };

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      whileHover={{ y: -1 }}
      transition={{ duration: 0.15 }}
      className={`inline-flex items-center justify-center transition-all cursor-pointer select-none ${getVariantStyles()} ${getSizeStyles()} ${className}`}
      {...props}
    >
      {icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
      {icon && iconPosition === 'right' && <span className="shrink-0">{icon}</span>}
    </motion.button>
  );
}
