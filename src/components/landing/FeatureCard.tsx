'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  colorClass: string;
  bgClass: string;
}

export default function FeatureCard({
  title,
  description,
  icon: Icon,
  colorClass,
  bgClass,
}: FeatureCardProps) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="p-6 rounded-[20px] bg-white border border-[#E8EAF2] shadow-[0_4px_20px_rgba(36,38,54,0.03)] hover:shadow-[0_12px_30px_rgba(36,38,54,0.08)] transition-all space-y-3.5 select-none"
    >
      <div
        className={`w-11 h-11 rounded-2xl ${bgClass} ${colorClass} flex items-center justify-center shadow-2xs`}
      >
        <Icon size={20} />
      </div>

      <div>
        <h3 className="text-base sm:text-lg font-bold text-[#242636] tracking-tight leading-snug">
          {title}
        </h3>
        <p className="text-xs sm:text-sm text-[#757A95] mt-1 leading-relaxed">
          {description}
        </p>
      </div>
    </motion.div>
  );
}
