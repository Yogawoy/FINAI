'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, X } from 'lucide-react';

interface TransactionToastProps {
  message: string | null;
  onClose: () => void;
}

export default function TransactionToast({ message, onClose }: TransactionToastProps) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 15, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#242636] text-white shadow-[0_10px_35px_rgba(36,38,54,0.3)] border border-white/10 text-xs sm:text-sm font-semibold"
        >
          <div className="w-5 h-5 rounded-full bg-[#D0EFE5] text-[#1B7354] flex items-center justify-center shrink-0">
            <CheckCircle2 size={13} strokeWidth={3} />
          </div>
          <span>{message}</span>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-white/60 hover:text-white rounded-lg hover:bg-white/10 transition-colors ml-1"
          >
            <X size={13} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
