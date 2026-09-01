'use client';

import React from 'react';
import { motion } from 'framer-motion';
import IncomeExpenseChart from '@/components/charts/IncomeExpenseChart';

export default function AnalyticsPreviewSection() {
  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="text-center max-w-2xl mx-auto mb-10 sm:mb-12 space-y-3"
      >
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E4E2FB]/70 border border-[#D6D4F7] text-[11px] font-bold uppercase tracking-wider text-[#7C7CE6]">
          Analisis Visual
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#242636] leading-tight">
          Lihat ke mana uangmu bergerak.
        </h2>
        <p className="text-sm sm:text-base text-[#757A95]">
          Pola pemasukan dan belanja tersaji dalam grafik yang mudah dibaca tanpa interpretasi yang rumit.
        </p>
      </motion.div>

      {/* Actual FinAI Chart Component in Card Wrapper */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="rounded-[32px] bg-white border border-[#E8EAF2] p-4 sm:p-6 shadow-[0_12px_45px_rgba(36,38,54,0.04)]"
      >
        <IncomeExpenseChart
          variant="dashboard"
          title="Keseimbangan Pemasukan vs Pengeluaran"
          subtitle="Tren arus kas 6 bulan terakhir"
        />
      </motion.div>
    </section>
  );
}
