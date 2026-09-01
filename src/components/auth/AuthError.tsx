'use client';

import React from 'react';
import { AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AuthErrorProps {
  message?: string | null;
  className?: string;
}

export default function AuthError({ message, className = '' }: AuthErrorProps) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -6, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: -6, height: 0 }}
          transition={{ duration: 0.2 }}
          className={`flex items-center gap-2.5 p-3 rounded-xl bg-[#FCE2E0] border border-[#F7C0BC] text-[#B83A38] text-xs font-semibold overflow-hidden shadow-xs ${className}`}
        >
          <AlertCircle size={16} className="shrink-0 text-[#B83A38]" />
          <span className="leading-tight">{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
