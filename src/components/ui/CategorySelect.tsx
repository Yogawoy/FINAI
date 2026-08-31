'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  Check,
  Utensils,
  Car,
  ShoppingBag,
  Zap,
  Film,
  Heart,
  GraduationCap,
  Sparkles,
  Tag,
} from 'lucide-react';
import { TransactionCategory } from '@/types';

export interface CategoryOption {
  id: TransactionCategory;
  label: string;
  icon: React.ReactNode;
}

export const ALL_CATEGORIES: CategoryOption[] = [
  { id: 'food', label: 'Makanan & Minuman', icon: <Utensils size={15} /> },
  { id: 'transport', label: 'Transportasi', icon: <Car size={15} /> },
  { id: 'shopping', label: 'Belanja', icon: <ShoppingBag size={15} /> },
  { id: 'bills', label: 'Tagihan & Utilitas', icon: <Zap size={15} /> },
  { id: 'entertainment', label: 'Hiburan', icon: <Film size={15} /> },
  { id: 'health', label: 'Kesehatan', icon: <Heart size={15} /> },
  { id: 'education', label: 'Pendidikan', icon: <GraduationCap size={15} /> },
  { id: 'other', label: 'Lainnya', icon: <Sparkles size={15} /> },
];

interface CategorySelectProps {
  value: TransactionCategory | string;
  onChange: (val: TransactionCategory) => void;
  label?: string;
  className?: string;
}

export default function CategorySelect({
  value,
  onChange,
  label = 'Kategori Transaksi',
  className = '',
}: CategorySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedCat = ALL_CATEGORIES.find((c) => c.id === value) || ALL_CATEGORIES[0];

  // Click outside & Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (id: TransactionCategory) => {
    onChange(id);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative space-y-1 ${className}`}>
      {label && (
        <label className="text-[11px] font-bold text-[#757A95] uppercase tracking-wider block">
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`w-full px-3.5 py-2.5 bg-[#F8F9FD] hover:bg-white border transition-all rounded-xl text-xs sm:text-sm flex items-center justify-between text-left cursor-pointer select-none ${
          isOpen
            ? 'border-[#7C7CE6] bg-white ring-2 ring-[#7C7CE6]/20 shadow-xs'
            : 'border-black/[0.06] hover:border-black/[0.12]'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0 pr-2">
          <div className="w-6 h-6 rounded-lg bg-[#EDEAFC] text-[#7C7CE6] flex items-center justify-center shrink-0">
            {selectedCat?.icon || <Tag size={15} />}
          </div>
          <span className="truncate font-semibold text-[#242636]">
            {selectedCat ? selectedCat.label : 'Pilih Kategori'}
          </span>
        </div>

        <ChevronDown
          size={15}
          className={`text-[#757A95] shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-[#7C7CE6]' : ''
          }`}
        />
      </button>

      {/* Popover Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            role="listbox"
            className="absolute left-0 right-0 top-full mt-1.5 p-1.5 bg-white border border-black/[0.08] rounded-2xl shadow-[0_12px_32px_rgba(36,38,54,0.12)] z-50 max-h-60 overflow-y-auto space-y-0.5"
          >
            {ALL_CATEGORIES.map((cat) => {
              const isSelected = cat.id === value;
              return (
                <button
                  key={cat.id}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(cat.id)}
                  className={`w-full px-3 py-2.5 rounded-xl text-xs sm:text-sm flex items-center justify-between transition-colors cursor-pointer text-left ${
                    isSelected
                      ? 'bg-[#EDEAFC] text-[#5F5ED4] font-bold'
                      : 'text-[#242636] hover:bg-[#F8F9FD]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'bg-white text-[#5F5ED4]'
                          : 'bg-[#EDEAFC] text-[#7C7CE6]'
                      }`}
                    >
                      {cat.icon}
                    </div>
                    <span className="truncate">{cat.label}</span>
                  </div>

                  {isSelected && <Check size={14} className="text-[#5F5ED4] shrink-0 ml-2" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
