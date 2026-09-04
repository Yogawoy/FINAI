'use client';

import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { formatIDR } from '@/lib/format';

interface BudgetInsightProps {
  insightText?: string;
  category?: string;
  dailySafeSpend?: number;
  onExplore?: () => void;
}

export default function BudgetInsight({
  insightText = "Dengan pola belanja saat ini, Anda berpotensi menghemat Rp420.000 pada pos Makanan & Minuman bulan ini.",
  category = 'Makanan & Minuman',
  dailySafeSpend = 51600,
  onExplore,
}: BudgetInsightProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#EDEAFC] via-[#F4F3F9] to-[#E9F7F2] p-5 sm:p-6 border border-[#7C7CE6]/20 shadow-2xs">
      {/* Decorative sparkle glow */}
      <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-[#7C7CE6]/10 blur-xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Sparkle Icon + Insights text */}
        <div className="flex items-start gap-3.5 max-w-2xl">
          <div className="w-10 h-10 rounded-2xl bg-white shadow-2xs border border-[#7C7CE6]/20 text-[#5F5ED4] flex items-center justify-center shrink-0">
            <Sparkles size={18} />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#5F5ED4]">
                ✦ Rekomendasi FinAI
              </span>
              <span className="text-[11px] font-semibold text-[#757A95]">• {category}</span>
            </div>
            <p className="text-xs sm:text-sm font-medium text-[#242636] leading-relaxed">
              {insightText}
            </p>
          </div>
        </div>

        {/* Right: Daily safe spend metric pill + Action button */}
        <div className="flex items-center gap-3 self-start md:self-center shrink-0">
          <div className="px-3.5 py-2 rounded-2xl bg-white/90 border border-black/[0.04] shadow-2xs space-y-0.5">
            <span className="text-[10px] font-bold text-[#757A95] uppercase tracking-wider block">
              Batas Belanja Harian Aman:
            </span>
            <div className="text-xs sm:text-sm font-black text-[#1B7354] flex items-center gap-1">
              <ShieldCheck size={14} />
              <span>{formatIDR(dailySafeSpend)}/hari</span>
            </div>
          </div>

          {onExplore && (
            <button
              type="button"
              onClick={onExplore}
              className="px-3.5 py-2.5 rounded-2xl bg-[#5F5ED4] hover:bg-[#4E4DC0] text-white text-xs font-bold shadow-[0_4px_14px_rgba(95,94,212,0.25)] transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>Lihat Detail</span>
              <ArrowRight size={13} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
