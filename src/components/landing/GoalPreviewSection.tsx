'use client';

import React from 'react';
import Link from 'next/link';
import { Target, Calendar, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function GoalPreviewSection() {
  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
      <div className="rounded-[32px] bg-white border border-[#E8EAF2] p-8 sm:p-12 lg:p-16 shadow-[0_12px_45px_rgba(36,38,54,0.04)] grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
        {/* Left Column (5 Cols): Editorial */}
        <div className="lg:col-span-5 space-y-5 text-center lg:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E4E2FB]/70 border border-[#D6D4F7] text-[11px] font-bold uppercase tracking-wider text-[#7C7CE6]">
            Perencanaan Sasaran
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#242636] leading-tight">
            Uangmu punya tujuan.
          </h2>

          <p className="text-sm sm:text-base text-[#757A95] leading-relaxed">
            Membeli laptop baru, liburan impian, atau menyusun dana darurat terasa lebih terjangkau saat dipecah menjadi langkah bulanan yang realistis.
          </p>

          <div className="pt-2">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#7C7CE6] hover:text-[#5F5ED4] transition-colors"
            >
              <span>Mulai Buat Target Impian</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>

        {/* Right Column (7 Cols): The Target Card Visual */}
        <div className="lg:col-span-7 flex justify-center">
          <div className="w-full max-w-lg p-6 sm:p-8 rounded-[24px] bg-[#FAFBFD] border border-[#E8EAF2] shadow-sm space-y-6 select-none">
            {/* Header row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#E4E2FB] text-[#7C7CE6] flex items-center justify-center shadow-xs">
                  <Target size={22} />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-[#242636]">
                    Laptop Baru
                  </h3>
                  <span className="text-xs text-[#757A95] flex items-center gap-1 mt-0.5">
                    <Calendar size={12} />
                    Target: Desember 2026
                  </span>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full bg-[#E4E2FB] text-[#5F5ED4] text-xs font-black">
                29%
              </span>
            </div>

            {/* Progress bar */}
            <div className="space-y-2">
              <div className="flex items-baseline justify-between text-xs font-bold">
                <span className="text-base font-extrabold text-[#242636] tabular-nums">
                  Rp3.500.000
                </span>
                <span className="text-[#757A95] tabular-nums">
                  dari Rp12.000.000
                </span>
              </div>

              <div className="w-full h-3 rounded-full bg-[#E8EAF2] overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: '29%' }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.9, ease: 'easeOut' }}
                  className="h-full rounded-full bg-gradient-to-r from-[#7C7CE6] to-[#8C8BE8]"
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-[#757A95] pt-0.5">
                <span>Tersimpan: 29%</span>
                <span>Sisa: Rp8.500.000</span>
              </div>
            </div>

            {/* Monthly calculation badge */}
            <div className="p-3.5 rounded-2xl bg-white border border-[#E8EAF2] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#757A95] block">
                  Perkiraan setoran bulanan
                </span>
                <span className="text-sm sm:text-base font-black text-[#1B7354] tabular-nums">
                  Rp2.125.000 / bulan
                </span>
              </div>
              <span className="text-[11px] font-semibold text-[#7C7CE6] bg-[#E4E2FB]/50 px-2.5 py-1 rounded-lg">
                4 Bulan Tersisa
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
