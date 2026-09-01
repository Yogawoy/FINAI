'use client';

import React from 'react';

interface AuthDividerProps {
  text?: string;
  className?: string;
}

export default function AuthDivider({
  text = 'atau masuk dengan',
  className = '',
}: AuthDividerProps) {
  return (
    <div className={`relative flex items-center justify-center my-4 ${className}`}>
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-[#E8EAF2]" />
      </div>
      <div className="relative px-3 bg-white text-[11px] font-medium text-[#8A8FA8] uppercase tracking-wider">
        {text}
      </div>
    </div>
  );
}
