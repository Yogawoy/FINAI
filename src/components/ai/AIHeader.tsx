'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, MessageSquarePlus, MoreHorizontal, Trash2, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AIHeaderProps {
  onNewChat: () => void;
  onClearChat: () => void;
}

export default function AIHeader({ onNewChat, onClearChat }: AIHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8EAF2]/80">
      {/* Title & Status */}
      <div className="space-y-1">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#7C7CE6] to-[#8C8BE8] text-white flex items-center justify-center shadow-[0_4px_12px_rgba(124,124,230,0.3)]">
            <Sparkles size={16} />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#242636] tracking-tight">
            FinAI Assistant
          </h1>
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EBF7F2] border border-[#D0EFE5] text-[11px] font-semibold text-[#1B7354]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1B7354] animate-pulse" />
            <span>Siap membantu</span>
          </div>
        </div>
        <p className="text-xs sm:text-sm font-medium text-[#757A95]">
          Asisten keuangan yang memahami kondisi finansialmu.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 self-start sm:self-auto">
        <button
          type="button"
          onClick={onNewChat}
          className="h-10 px-3.5 rounded-xl bg-white border border-[#E8EAF2] hover:border-[#7C7CE6]/40 hover:bg-[#F8F9FD] text-xs font-bold text-[#242636] transition-all flex items-center gap-2 shadow-2xs cursor-pointer"
        >
          <MessageSquarePlus size={15} className="text-[#7C7CE6]" />
          <span>Percakapan Baru</span>
        </button>

        {/* Menu Options */}
        <div ref={menuRef} className="relative">
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Opsi percakapan"
            className="w-10 h-10 rounded-xl bg-white border border-[#E8EAF2] hover:border-black/[0.12] flex items-center justify-center text-[#757A95] hover:text-[#242636] transition-colors cursor-pointer shadow-2xs"
          >
            <MoreHorizontal size={17} />
          </button>

          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-1.5 w-44 bg-white rounded-2xl border border-[#E8EAF2] shadow-[0_10px_30px_rgba(36,38,54,0.1)] p-1.5 z-40 space-y-0.5"
              >
                <button
                  type="button"
                  onClick={() => {
                    onNewChat();
                    setIsMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 rounded-xl text-left text-xs font-semibold text-[#242636] hover:bg-[#F8F9FD] flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <RotateCcw size={14} className="text-[#7C7CE6]" />
                  <span>Percakapan Baru</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClearChat();
                    setIsMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 rounded-xl text-left text-xs font-semibold text-[#E47777] hover:bg-[#FEF3F2] flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Trash2 size={14} className="text-[#E47777]" />
                  <span>Hapus Percakapan</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
