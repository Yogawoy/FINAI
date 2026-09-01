'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface SidebarMobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export default function SidebarMobileDrawer({
  isOpen,
  onClose,
  children,
}: SidebarMobileDrawerProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#242636]/30 backdrop-blur-xs"
          />

          {/* Sliding Drawer Container */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.24, ease: 'easeOut' }}
            className="relative w-[280px] max-w-[85vw] h-full bg-white shadow-2xl p-4 flex flex-col justify-between"
          >
            {/* Close Button on Top Right */}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-[#FAFBFD] border border-[#E8EAF2] flex items-center justify-center text-[#757A95] hover:text-[#242636] transition-colors cursor-pointer z-10"
              aria-label="Tutup Menu"
            >
              <X size={16} />
            </button>

            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
