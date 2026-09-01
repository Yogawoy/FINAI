'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarTooltipProps {
  content: string;
  children: React.ReactNode;
  side?: 'right' | 'top';
}

export default function SidebarTooltip({
  content,
  children,
  side = 'right',
}: SidebarTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div
      className="relative flex items-center"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}

      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, x: side === 'right' ? -4 : 0, y: side === 'top' ? 4 : 0 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: side === 'right' ? -4 : 0, y: side === 'top' ? 4 : 0 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={`absolute z-50 pointer-events-none whitespace-nowrap px-2.5 py-1 rounded-lg bg-white border border-[#E8EAF2] text-[11px] font-bold text-[#242636] shadow-[0_4px_16px_rgba(36,38,54,0.12)] ${
              side === 'right'
                ? 'left-full ml-2.5 top-1/2 -translate-y-1/2'
                : 'bottom-full mb-2 left-1/2 -translate-x-1/2'
            }`}
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
