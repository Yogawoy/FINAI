'use client';

import React from 'react';
import { AlertCircle } from 'lucide-react';

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: React.ReactNode;
  error?: string;
  helperText?: string;
  topRightAction?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export default function AuthInput({
  label,
  icon,
  error,
  helperText,
  topRightAction,
  rightElement,
  id,
  className = '',
  disabled,
  ...props
}: AuthInputProps) {
  const inputId = id || `auth-input-${label.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className={`space-y-1.5 w-full ${className}`}>
      {/* Label Row */}
      <div className="flex items-center justify-between">
        <label
          htmlFor={inputId}
          className="block text-xs sm:text-[13px] font-bold text-[#242636]"
        >
          {label}
        </label>
        {topRightAction}
      </div>

      {/* Input Container */}
      <div className="relative flex items-center">
        {icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#757A95] pointer-events-none flex items-center justify-center">
            {icon}
          </div>
        )}

        <input
          id={inputId}
          disabled={disabled}
          className={`w-full h-[50px] sm:h-[52px] rounded-xl sm:rounded-2xl text-xs sm:text-sm font-medium bg-[#F9FAFC] border transition-all text-[#242636] placeholder:text-[#A2A7BD] focus:outline-none focus:bg-white ${
            icon ? 'pl-11' : 'pl-4'
          } ${rightElement ? 'pr-11' : 'pr-4'} ${
            error
              ? 'border-[#F7C0BC] bg-[#FFF8F8] focus:border-[#B83A38] focus:ring-2 focus:ring-[#B83A38]/20'
              : 'border-[#E3E5EE] focus:border-[#7C7CE6] focus:ring-3 focus:ring-[#7C7CE6]/20'
          } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
          {...props}
        />

        {rightElement && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center">
            {rightElement}
          </div>
        )}
      </div>

      {/* Error or Helper text */}
      {error ? (
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#B83A38] pt-0.5">
          <AlertCircle size={12} className="shrink-0" />
          <span>{error}</span>
        </div>
      ) : helperText ? (
        <p className="text-[11px] font-normal text-[#757A95] pt-0.5 leading-tight">
          {helperText}
        </p>
      ) : null}
    </div>
  );
}
