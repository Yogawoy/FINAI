'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';

export default function SidebarBrand() {
  return (
    <Link
      href="/app"
      className="flex items-center gap-3 px-2 py-1 group select-none transition-transform active:scale-98"
    >
      {/* Brand Icon Mark */}
      <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#7C7CE6] via-[#8C8BE8] to-[#D6E4FA] flex items-center justify-center shadow-[0_4px_14px_rgba(124,124,230,0.35)] group-hover:scale-105 transition-transform shrink-0">
        <Sparkles size={18} className="text-white" />
      </div>

      {/* Brand Titles */}
      <div className="min-w-0">
        <span className="font-black tracking-tight text-lg text-[#242636] block leading-none">
          FinAI
        </span>
        <span className="text-[9px] tracking-[0.14em] uppercase font-bold text-[#7C7CE6] block mt-1 leading-none">
          SPATIAL FINANCE
        </span>
      </div>
    </Link>
  );
}
