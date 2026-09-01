'use client';

import React from 'react';
import { Check } from 'lucide-react';
import { motion } from 'framer-motion';

interface AuthCheckboxProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: React.ReactNode;
  children?: React.ReactNode;
  error?: string;
  className?: string;
}

export default function AuthCheckbox({
  id,
  checked,
  onChange,
  label,
  children,
  error,
  className = '',
}: AuthCheckboxProps) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label
        htmlFor={id}
        className="flex items-start gap-2.5 cursor-pointer select-none group text-xs text-[#757A95]"
      >
        <div className="relative mt-0.5 shrink-0">
          <input
            id={id}
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            className="sr-only peer"
          />
          <div
            className={`w-4.5 h-4.5 rounded-md flex items-center justify-center transition-all border ${
              checked
                ? 'bg-[#7C7CE6] border-[#7C7CE6] shadow-xs'
                : 'bg-white border-[#D6D8E4] group-hover:border-[#7C7CE6]/70'
            } ${error ? 'border-[#B83A38] bg-[#FFF5F5]' : ''} peer-focus-visible:ring-2 peer-focus-visible:ring-[#7C7CE6]/40`}
          >
            {checked && (
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <Check size={12} strokeWidth={3} className="text-white" />
              </motion.div>
            )}
          </div>
        </div>

        <div className="leading-snug text-xs font-medium text-[#757A95] group-hover:text-[#242636] transition-colors">
          {label || children}
        </div>
      </label>

      {error && (
        <span className="text-[11px] font-semibold text-[#B83A38] pl-7">
          {error}
        </span>
      )}
    </div>
  );
}
