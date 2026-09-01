'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';
import Link from 'next/link';

interface AuthBrandProps {
  className?: string;
  variant?: 'light' | 'dark';
}

export default function AuthBrand({ className = '' }: AuthBrandProps) {
  return (
    <Link
      href="/"
      className={`inline-flex items-center gap-2.5 group select-none transition-transform active:scale-98 ${className}`}
    >
      {/* 4-pointed Sparkle Star Icon */}
      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#7C7CE6] via-[#8C8BE8] to-[#D6E4FA] flex items-center justify-center shadow-[0_4px_12px_rgba(124,124,230,0.3)] group-hover:scale-105 transition-transform shrink-0">
        <Sparkles size={16} className="text-white" />
      </div>

      <div className="min-w-0">
        <span className="font-black tracking-tight text-lg text-[#242636] block leading-none">
          FinAI
        </span>
        <span className="text-[9px] tracking-[0.16em] uppercase font-bold text-[#7C7CE6] block mt-1 leading-none">
          SPATIAL FINANCE
        </span>
      </div>
    </Link>
  );
}
