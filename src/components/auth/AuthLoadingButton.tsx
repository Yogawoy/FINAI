'use client';

import React from 'react';

interface AuthLoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  children: React.ReactNode;
  loadingText?: string;
  variant?: 'primary' | 'secondary';
}

export default function AuthLoadingButton({
  isLoading = false,
  children,
  loadingText = 'Memproses...',
  variant = 'primary',
  disabled,
  className = '',
  type = 'submit',
  ...props
}: AuthLoadingButtonProps) {
  const isPrimary = variant === 'primary';

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={`w-full h-[50px] sm:h-[52px] rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm tracking-wide transition-all duration-200 flex items-center justify-center gap-2.5 select-none ${
        isPrimary
          ? 'bg-[#7C7CE6] hover:bg-[#6A6AD6] active:scale-[0.99] text-white shadow-[0_8px_20px_rgba(124,124,230,0.32)] hover:shadow-[0_10px_24px_rgba(124,124,230,0.42)]'
          : 'bg-white hover:bg-[#F8F9FD] border border-[#E4E6EF] text-[#242636]'
      } ${disabled || isLoading ? 'opacity-70 cursor-not-allowed transform-none' : 'cursor-pointer'} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          {/* Small clean spinner SVG */}
          <svg
            className="animate-spin h-4 w-4 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3.5"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>{loadingText}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
