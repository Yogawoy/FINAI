'use client';

import React from 'react';
import { Sparkles, ArrowRight, HelpCircle, MessageSquare } from 'lucide-react';
import Button from '@/components/ui/Button';

interface AITransactionBannerProps {
  onOpenAI: (initialPrompt?: string) => void;
}

export default function AITransactionBanner({ onOpenAI }: AITransactionBannerProps) {
  return (
    <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#F4F3FF] via-[#EAE8FD] to-[#E2EDFC] border border-[#D8D4FA] shadow-[0_8px_30px_rgba(124,124,230,0.06)] flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
      {/* Sisi Kiri: Ikon + Penjelasan Fitur AI */}
      <div className="flex items-start sm:items-center gap-3.5">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#7C7CE6] to-[#8C8BE8] text-white flex items-center justify-center shadow-xs shrink-0 mt-0.5 sm:mt-0">
          <Sparkles size={20} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm sm:text-base font-bold text-[#242636]">
              Asisten Analisis FinAI
            </h3>
            <span className="px-2 py-0.5 rounded-md bg-[#7C7CE6]/15 text-[#5F5ED4] text-[10px] font-extrabold uppercase tracking-wide">
              AI Kas
            </span>
          </div>
          <p className="text-xs text-[#757A95] mt-0.5 leading-relaxed">
            Tanyakan ringkasan pengeluaran instan, deteksi pos paling boros, atau cek batas aman belanja hari ini.
          </p>
        </div>
      </div>

      {/* Sisi Kanan: Chip Pertanyaan Cepat + Tombol Buka AI */}
      <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={() => onOpenAI('Berapa pengeluaranku hari ini?')}
          className="px-3 py-1.5 rounded-xl bg-white/80 hover:bg-white text-[11px] sm:text-xs font-semibold text-[#5F5ED4] border border-[#D8D4FA] shadow-2xs hover:shadow-xs transition-all cursor-pointer hidden lg:inline-block"
        >
          ✦ Habis berapa hari ini?
        </button>

        <button
          type="button"
          onClick={() => onOpenAI('Ke mana uangku paling banyak keluar?')}
          className="px-3 py-1.5 rounded-xl bg-white/80 hover:bg-white text-[11px] sm:text-xs font-semibold text-[#5F5ED4] border border-[#D8D4FA] shadow-2xs hover:shadow-xs transition-all cursor-pointer hidden xl:inline-block"
        >
          ✦ Kategori paling boros?
        </button>

        <Button
          type="button"
          variant="primary"
          size="sm"
          icon={<Sparkles size={14} />}
          onClick={() => onOpenAI()}
          className="whitespace-nowrap shadow-xs hover:shadow-sm cursor-pointer"
        >
          Tanya FinAI
        </Button>
      </div>
    </div>
  );
}
