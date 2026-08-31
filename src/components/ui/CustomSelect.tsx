'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  sublabel?: string;
  icon?: React.ReactNode;
}

interface CustomSelectProps {
  value: string;
  onChange: (val: string) => void;
  options: SelectOption[];
  placeholder?: string;
  label?: string;
  className?: string;
  disabled?: boolean;
}

export default function CustomSelect({
  value,
  onChange,
  options,
  placeholder = 'Pilih opsi...',
  label,
  className = '',
  disabled = false,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Close on click outside
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

  const handleSelect = (val: string) => {
    onChange(val);
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
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`w-full px-3.5 py-2.5 bg-[#F8F9FD] hover:bg-white border transition-all rounded-xl text-xs sm:text-sm flex items-center justify-between text-left cursor-pointer select-none ${
          isOpen
            ? 'border-[#7C7CE6] bg-white ring-2 ring-[#7C7CE6]/20 shadow-xs'
            : 'border-black/[0.06] hover:border-black/[0.12]'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <div className="flex items-center gap-2.5 min-w-0 pr-2">
          {selectedOption?.icon && (
            <span className="text-[#7C7CE6] shrink-0">{selectedOption.icon}</span>
          )}
          <span className="truncate font-semibold text-[#242636]">
            {selectedOption ? selectedOption.label : placeholder}
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
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(opt.value)}
                  className={`w-full px-3 py-2.5 rounded-xl text-xs sm:text-sm flex items-center justify-between transition-colors cursor-pointer text-left ${
                    isSelected
                      ? 'bg-[#EDEAFC] text-[#5F5ED4] font-bold'
                      : 'text-[#242636] hover:bg-[#F8F9FD]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {opt.icon && (
                      <span className={isSelected ? 'text-[#5F5ED4]' : 'text-[#7C7CE6]'}>
                        {opt.icon}
                      </span>
                    )}
                    <div>
                      <span className="block truncate">{opt.label}</span>
                      {opt.sublabel && (
                        <span className="text-[10px] text-[#757A95] font-normal block">
                          {opt.sublabel}
                        </span>
                      )}
                    </div>
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
