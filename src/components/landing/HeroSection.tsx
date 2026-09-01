'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import HeroFinancialVisual from './HeroFinancialVisual';

export default function HeroSection() {
  return (
    <section className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 lg:pt-20 pb-16 lg:pb-24 overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
        {/* =================================================================== */}
        {/* LEFT COLUMN: EDITORIAL VALUE PROP & HEADLINE (6 COLS)               */}
        {/* =================================================================== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="lg:col-span-6 space-y-6 text-center lg:text-left"
        >
          {/* Subtle Top Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E4E2FB]/70 border border-[#D6D4F7] text-xs font-bold text-[#7C7CE6] shadow-2xs">
            <Sparkles size={13} className="text-[#7C7CE6]" />
            <span>Personal Finance Assistant Berbasis AI</span>
          </div>

          {/* Main H1 Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-[54px] font-extrabold tracking-tight text-[#242636] leading-[1.12]">
            Kelola keuanganmu.{' '}
            <span className="text-[#7C7CE6] block sm:inline">
              Lebih mudah
            </span>{' '}
            dengan FinAI.
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-[#757A95] leading-[1.65] max-w-xl mx-auto lg:mx-0 font-normal">
            Catat pengeluaran, atur anggaran, capai target, dan ngobrol dengan AI yang memahami kondisi keuanganmu.
          </p>

          {/* CTAs */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5">
            <Link
              href="/register"
              className="w-full sm:w-auto h-12 sm:h-[50px] px-7 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm bg-[#7C7CE6] hover:bg-[#6A6AD6] active:scale-98 text-white shadow-[0_10px_24px_rgba(124,124,230,0.35)] transition-all flex items-center justify-center gap-2 cursor-pointer select-none"
            >
              <span>Mulai Gratis</span>
              <ArrowRight size={15} />
            </Link>

            <a
              href="#cara-kerja"
              className="w-full sm:w-auto h-12 sm:h-[50px] px-6 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm bg-white hover:bg-[#F8F9FD] active:scale-98 text-[#242636] border border-[#E4E6EF] shadow-2xs transition-all flex items-center justify-center cursor-pointer select-none"
            >
              Lihat Cara Kerja
            </a>
          </div>

          {/* Trust points */}
          <div className="pt-4 border-t border-black/[0.05] flex items-center justify-center lg:justify-start gap-6 text-xs text-[#757A95]">
            <span className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 size={14} className="text-[#1B7354]" />
              Tanpa Rumus Rumit
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 size={14} className="text-[#7C7CE6]" />
              Data Tersimpan Aman
            </span>
          </div>
        </motion.div>

        {/* =================================================================== */}
        {/* RIGHT COLUMN: HERO FINANCIAL VISUAL (6 COLS)                        */}
        {/* =================================================================== */}
        <div className="lg:col-span-6 flex items-center justify-center">
          <HeroFinancialVisual />
        </div>
      </div>
    </section>
  );
}
