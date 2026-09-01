'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface UserMessageProps {
  content: string;
  timestamp?: string;
}

export default function UserMessage({ content, timestamp }: UserMessageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className="flex justify-end"
    >
      <div className="max-w-[85%] sm:max-w-[65%] space-y-1">
        <div className="px-4 py-3 rounded-2xl rounded-tr-sm bg-[#E4E2FB] text-[#242636] text-xs sm:text-sm font-medium leading-relaxed shadow-2xs">
          {content}
        </div>
        {timestamp && (
          <span className="block text-[10px] text-[#A0A4B8] text-right pr-1">
            {timestamp}
          </span>
        )}
      </div>
    </motion.div>
  );
}
