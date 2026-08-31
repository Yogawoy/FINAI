'use client';

import React from 'react';

interface BudgetAmountInputProps {
  value: number;
  onChange: (val: number) => void;
  helperText?: string;
  error?: string;
}

export default function BudgetAmountInput({
  value,
  onChange,
  helperText,
  error,
}: BudgetAmountInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    const num = raw ? parseInt(raw, 10) : 0;
    onChange(num);
  };

  const formattedDisplay = value > 0 ? value.toLocaleString('id-ID') : '';

  return (
    <div className="space-y-1">
      <div
        className={`p-3.5 sm:p-4 rounded-2xl bg-[#F8F9FD] border transition-all ${
          error
            ? 'border-[#B83A38] bg-[#FFF0EF]/20'
            : 'border-black/[0.06] focus-within:border-[#7C7CE6] focus-within:bg-white'
        }`}
      >
        <label className="text-[11px] font-bold text-[#757A95] uppercase tracking-wider block mb-1">
          Batas Anggaran (Limit)
        </label>
        <div className="flex items-center text-xl sm:text-2xl font-black text-[#242636]">
          <span className="text-[#757A95] mr-2 text-lg sm:text-xl font-bold select-none">
            Rp
          </span>
          <input
            type="text"
            required
            value={formattedDisplay}
            onChange={handleChange}
            placeholder="0"
            className="w-full bg-transparent focus:outline-none tracking-tight font-black text-[#242636] placeholder-[#757A95]/40"
          />
        </div>
      </div>

      {error ? (
        <p className="text-[11px] font-semibold text-[#B83A38] pl-1">{error}</p>
      ) : helperText ? (
        <p className="text-[11px] text-[#757A95] pl-1">{helperText}</p>
      ) : null}
    </div>
  );
}
