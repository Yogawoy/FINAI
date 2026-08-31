'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Laptop, Plane, Shield, Sparkles } from 'lucide-react';

interface GoalVisualProps {
  type: 'laptop' | 'travel' | 'shield' | string;
  size?: 'sm' | 'md' | 'lg';
  active?: boolean;
  className?: string;
}

export default function GoalVisual({
  type,
  size = 'md',
  active = false,
  className = '',
}: GoalVisualProps) {
  const getColors = () => {
    switch (type) {
      case 'travel':
        return {
          bg: 'from-[#D0EFE5] via-[#E4E2FB] to-[#C9D8F5]',
          icon: <Plane size={size === 'lg' ? 28 : 20} className="text-[#1B7354]" />,
          border: 'border-[#D0EFE5]',
        };
      case 'shield':
        return {
          bg: 'from-[#E4E2FB] via-[#D6E4FA] to-[#FCE2E0]',
          icon: <Shield size={size === 'lg' ? 28 : 20} className="text-[#7C7CE6]" />,
          border: 'border-[#E4E2FB]',
        };
      default: // laptop
        return {
          bg: 'from-[#7C7CE6]/20 via-[#E4E2FB] to-white',
          icon: <Laptop size={size === 'lg' ? 28 : 20} className="text-[#6362D8]" />,
          border: 'border-[#7C7CE6]/30',
        };
    }
  };

  const config = getColors();

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-10 h-10 rounded-xl';
      case 'lg':
        return 'w-20 h-20 sm:w-24 sm:h-24 rounded-3xl';
      default:
        return 'w-14 h-14 rounded-2xl';
    }
  };

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.05 }}
      transition={{ duration: 0.2 }}
      className={`relative flex items-center justify-center bg-gradient-to-tr ${config.bg} backdrop-blur-md border ${config.border} shadow-[0_8px_25px_rgba(124,124,230,0.12)] select-none ${getSizeClasses()} ${
        active ? 'ring-2 ring-[#7C7CE6] shadow-[0_12px_32px_rgba(124,124,230,0.25)]' : ''
      } ${className}`}
    >
      {/* Specular sheen */}
      <div className="absolute top-1 left-2 w-1/2 h-1/2 rounded-full bg-gradient-to-b from-white to-transparent opacity-80 pointer-events-none" />
      {config.icon}
    </motion.div>
  );
}
