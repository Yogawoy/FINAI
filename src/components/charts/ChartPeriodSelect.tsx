'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';

export type ChartPeriod = '7 Hari' | '30 Hari' | '3 Bulan' | '6 Bulan' | '1 Tahun';

interface ChartPeriodSelectProps {
  value: ChartPeriod;
  onChange: (val: ChartPeriod) => void;
  options?: ChartPeriod[];
  className?: string;
}

const DEFAULT_OPTIONS: ChartPeriod[] = [
  '7 Hari',
  '30 Hari',
  '3 Bulan',
  '6 Bulan',
  '1 Tahun',
];

export default function ChartPeriodSelect({
  value,
  onChange,
  options = DEFAULT_OPTIONS,
  className = '',
}: ChartPeriodSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
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

  return (
    <div ref={dropdownRef} className={`relative inline-block text-left ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`h-9 px-3.5 rounded-xl bg-white border transition-all flex items-center gap-2 text-xs font-semibold cursor-pointer shadow-2xs ${
          isOpen
            ? 'border-[#7C7CE6] ring-2 ring-[#7C7CE6]/20 text-[#242636]'
            : 'border-[#E8EAF2] hover:border-[#7C7CE6]/40 text-[#242636]'
        }`}
      >
        <span>{value}</span>
        <ChevronDown
          size={13}
          className={`text-[#757A95] transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-[#7C7CE6]' : ''
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.96 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute right-0 top-full mt-1.5 w-36 bg-white rounded-2xl border border-[#E8EAF2] shadow-[0_10px_30px_rgba(36,38,54,0.1)] p-1.5 z-40 space-y-0.5"
            role="listbox"
          >
            {options.map((opt) => {
              const isSelected = opt === value;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    onChange(opt);
                    setIsOpen(false);
                  }}
                  className={`w-full px-3 py-2 rounded-xl text-left text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[#EDEAFC] text-[#5F5ED4]'
                      : 'text-[#242636] hover:bg-[#F8F9FD]'
                  }`}
                  role="option"
                  aria-selected={isSelected}
                >
                  <span>{opt}</span>
                  {isSelected && <Check size={13} className="text-[#5F5ED4] shrink-0" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
