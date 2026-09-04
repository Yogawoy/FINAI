'use client';

import React from 'react';
import { ArrowDownLeft, ArrowUpRight, TrendingUp, Calendar, Sparkles } from 'lucide-react';
import { formatIDR } from '@/lib/format';

interface TransactionSummaryProps {
  income: number;
  expenses: number;
  net: number;
  avgDaily: number;
}

export default function TransactionSummary({
  income,
  expenses,
  net,
  avgDaily,
}: TransactionSummaryProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-extrabold uppercase tracking-widest text-[#757A95]">
          Ringkasan Finansial Bulan Ini
        </span>
        <span className="text-xs font-semibold text-[#7C7CE6] bg-[#E4E2FB] px-3 py-1 rounded-full border border-[#7C7CE6]/20">
          Agustus 2026
        </span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* 1. Kartu Pemasukan (Mint / Emerald Soft Gradient) */}
        <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#EAF8F3] via-[#D5F2E8] to-[#C2EBDD] border border-[#B0E5D4] shadow-[0_8px_25px_rgba(27,115,84,0.07)] space-y-2 transition-all hover:scale-[1.02] hover:shadow-[0_10px_30px_rgba(27,115,84,0.12)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#1B7354] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#1B7354]" />
              Pemasukan
            </span>
            <div className="w-7 h-7 rounded-xl bg-[#1B7354] text-white flex items-center justify-center shadow-xs">
              <ArrowDownLeft size={15} strokeWidth={2.5} />
            </div>
          </div>
          <div>
            <div className="text-lg sm:text-2xl font-extrabold text-[#145C42] tracking-tight tabular-nums">
              +{formatIDR(income)}
            </div>
            <span className="text-[11px] font-medium text-[#1B7354]/80 block mt-0.5">
              Gaji pokok & freelance
            </span>
          </div>
        </div>

        {/* 2. Kartu Pengeluaran (Peach / Coral Soft Gradient) */}
        <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#FFF1F0] via-[#FCE3E1] to-[#FAD4D0] border border-[#F7C0BC] shadow-[0_8px_25px_rgba(184,58,56,0.07)] space-y-2 transition-all hover:scale-[1.02] hover:shadow-[0_10px_30px_rgba(184,58,56,0.12)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#B83A38] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#B83A38]" />
              Pengeluaran
            </span>
            <div className="w-7 h-7 rounded-xl bg-[#B83A38] text-white flex items-center justify-center shadow-xs">
              <ArrowUpRight size={15} strokeWidth={2.5} />
            </div>
          </div>
          <div>
            <div className="text-lg sm:text-2xl font-extrabold text-[#942A28] tracking-tight tabular-nums">
              -{formatIDR(expenses)}
            </div>
            <span className="text-[11px] font-medium text-[#B83A38]/80 block mt-0.5">
              Total pos belanja aktif
            </span>
          </div>
        </div>

        {/* 3. Kartu Arus Kas Bersih (Periwinkle / Lavender Gradient) */}
        <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#F3F2FF] via-[#E7E5FC] to-[#DAD6FA] border border-[#CAC4F8] shadow-[0_8px_25px_rgba(124,124,230,0.08)] space-y-2 transition-all hover:scale-[1.02] hover:shadow-[0_10px_30px_rgba(124,124,230,0.14)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5F5ED4] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#5F5ED4]" />
              Arus Kas Bersih
            </span>
            <div className="w-7 h-7 rounded-xl bg-[#7C7CE6] text-white flex items-center justify-center shadow-xs">
              <TrendingUp size={15} strokeWidth={2.5} />
            </div>
          </div>
          <div>
            <div className="text-lg sm:text-2xl font-extrabold text-[#4F4DBF] tracking-tight tabular-nums">
              +{formatIDR(net)}
            </div>
            <span className="text-[11px] font-semibold text-[#1B7354] block mt-0.5">
              Surplus aman (34,2%)
            </span>
          </div>
        </div>

        {/* 4. Kartu Rata-rata Harian (Ice Blue / Sky Gradient) */}
        <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#F0F5FE] via-[#E0EDFD] to-[#D0E3FC] border border-[#BBD6FB] shadow-[0_8px_25px_rgba(62,111,176,0.07)] space-y-2 transition-all hover:scale-[1.02] hover:shadow-[0_10px_30px_rgba(62,111,176,0.12)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#3E6FB0] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#3E6FB0]" />
              Rata-rata Harian
            </span>
            <div className="w-7 h-7 rounded-xl bg-[#3E6FB0] text-white flex items-center justify-center shadow-xs">
              <Calendar size={15} strokeWidth={2.5} />
            </div>
          </div>
          <div>
            <div className="text-lg sm:text-2xl font-extrabold text-[#24528E] tracking-tight tabular-nums">
              {formatIDR(avgDaily)}
            </div>
            <span className="text-[11px] font-medium text-[#3E6FB0]/80 block mt-0.5">
              Laju pengeluaran per hari
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
