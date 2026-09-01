'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { User, Settings, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout?: () => void;
}

export default function SidebarPopover({
  isOpen,
  onClose,
  onLogout,
}: SidebarPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={popoverRef}
          initial={{ opacity: 0, y: 8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.96 }}
          transition={{ duration: 0.16, ease: 'easeOut' }}
          className="absolute bottom-full left-0 right-0 mb-2 p-1.5 rounded-2xl bg-white border border-[#E8EAF2] shadow-[0_12px_32px_rgba(36,38,54,0.12)] z-50 divide-y divide-[#E8EAF2]/60 select-none"
        >
          <div className="p-1 space-y-0.5">
            <Link
              href="/app/settings"
              onClick={onClose}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#242636] hover:bg-[#F0EFFC] transition-colors"
            >
              <User size={15} className="text-[#7C7CE6]" />
              <span>Profil Saya</span>
            </Link>

            <Link
              href="/app/settings"
              onClick={onClose}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#242636] hover:bg-[#F0EFFC] transition-colors"
            >
              <Settings size={15} className="text-[#757A95]" />
              <span>Pengaturan</span>
            </Link>
          </div>

          <div className="p-1 pt-1.5">
            <button
              type="button"
              onClick={() => {
                onClose();
                onLogout?.();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#D94F4F] hover:bg-[#FEF3F2] transition-colors cursor-pointer"
            >
              <LogOut size={15} />
              <span>Keluar</span>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
