'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function CTASection() {
  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
      <div className="rounded-[32px] sm:rounded-[36px] p-8 sm:p-14 lg:p-16 text-center bg-gradient-to-br from-[#EAE8FB] via-[#E4E2FB] to-[#D8E4FA] border border-white/80 shadow-[0_20px_50px_rgba(124,124,230,0.12)] relative overflow-hidden space-y-6 select-none">
        {/* Ambient decorative blur circles */}
        <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-white/40 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-[#7C7CE6]/15 blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/70 border border-white/90 text-xs font-bold text-[#7C7CE6] shadow-2xs">
            <Sparkles size={14} />
            <span>Mulai Tanpa Biaya</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#242636] tracking-tight leading-tight">
            Mulai memahami keuanganmu hari ini.
          </h2>

          <p className="text-sm sm:text-base text-[#525672] leading-relaxed max-w-lg mx-auto">
            Catat lebih mudah. Rencanakan lebih jelas. Capai target lebih terarah.
          </p>

          <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              href="/register"
              className="w-full sm:w-auto h-12 sm:h-[50px] px-8 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm bg-[#7C7CE6] hover:bg-[#6A6AD6] active:scale-98 text-white shadow-[0_10px_24px_rgba(124,124,230,0.35)] transition-all flex items-center justify-center gap-2 cursor-pointer select-none"
            >
              <span>Mulai Gratis</span>
              <ArrowRight size={15} />
            </Link>

            <Link
              href="/login"
              className="w-full sm:w-auto h-12 sm:h-[50px] px-7 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm bg-white hover:bg-[#F8F9FD] active:scale-98 text-[#242636] border border-white/90 shadow-2xs transition-all flex items-center justify-center cursor-pointer select-none"
            >
              Sudah Punya Akun? Masuk
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
