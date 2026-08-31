'use client';

import React from 'react';

export interface SegmentOption<T extends string = string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
}

interface SegmentedControlProps<T extends string = string> {
  value: T;
  onChange: (val: T) => void;
  options: SegmentOption<T>[];
  label?: string;
  className?: string;
  fullWidth?: boolean;
}

export default function SegmentedControl<T extends string = string>({
  value,
  onChange,
  options,
  label,
  className = '',
  fullWidth = true,
}: SegmentedControlProps<T>) {
  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label className="text-[11px] font-bold text-[#757A95] uppercase tracking-wider block">
          {label}
        </label>
      )}

      <div className={`p-1 bg-[#F4F3F9] rounded-2xl flex items-center gap-1 ${fullWidth ? 'w-full' : 'inline-flex'}`}>
        {options.map((opt) => {
          const isSelected = opt.value === value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={`py-2 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                fullWidth ? 'flex-1' : ''
              } ${
                isSelected
                  ? 'bg-[#E4E2FB] text-[#5F5ED4] shadow-xs border border-[#7C7CE6]/20'
                  : 'text-[#757A95] hover:text-[#242636]'
              }`}
            >
              {opt.icon && <span className="shrink-0">{opt.icon}</span>}
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
