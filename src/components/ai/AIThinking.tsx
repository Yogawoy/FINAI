'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AIThinking() {
  return (
    <div className="flex items-center gap-3 py-2">
      {/* AI Mark Icon */}
      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#7C7CE6] to-[#8C8BE8] text-white flex items-center justify-center shadow-xs shrink-0">
        <Sparkles size={14} />
      </div>

      {/* Subtle pulsing dots & text */}
      <div className="px-4 py-2.5 rounded-2xl bg-white border border-[#E8EAF2] shadow-2xs flex items-center gap-3">
        <span className="text-xs font-semibold text-[#757A95]">
          FinAI sedang memproses
        </span>
        <div className="flex items-center gap-1">
          <motion.span
            animate={{ opacity: [0.2, 1, 0.2] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: 0 }}
            className="w-1.5 h-1.5 rounded-full bg-[#7C7CE6]"
          />
          <motion.span
            animate={{ opacity: [0.2, 1, 0.2] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}
            className="w-1.5 h-1.5 rounded-full bg-[#7C7CE6]"
          />
          <motion.span
            animate={{ opacity: [0.2, 1, 0.2] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}
            className="w-1.5 h-1.5 rounded-full bg-[#7C7CE6]"
          />
        </div>
      </div>
    </div>
  );
}
