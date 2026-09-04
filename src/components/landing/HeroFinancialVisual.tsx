'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, Target, ArrowDownLeft, ShieldCheck, Wifi } from 'lucide-react';
import { formatIDR } from '@/lib/format';

export default function HeroFinancialVisual() {
  return (
    <div className="relative w-full max-w-[540px] mx-auto select-none">
      {/* Decorative ambient background glows behind composition */}
      <div className="absolute -top-10 -right-10 w-72 h-72 rounded-full bg-[#E4E2FB]/70 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-80 h-80 rounded-full bg-[#D6E4FA]/60 blur-3xl pointer-events-none" />

      {/* Composition Container */}
      <div className="relative z-10 space-y-4">
        {/* =================================================================== */}
        {/* 1. WALLET CARD: Rp24.560.000 with subtle floating animation         */}
        {/* =================================================================== */}
        <motion.div
          animate={{ y: [-4, 4, -4] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
          className="relative w-full rounded-[26px] p-6 sm:p-7 bg-gradient-to-br from-[#8E9AF7] via-[#7C7CE6] to-[#5F5ED4] text-white shadow-[0_20px_45px_-10px_rgba(124,124,230,0.38)] border border-white/40 overflow-hidden"
        >
          {/* Subtle wave overlays inside card */}
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/20 blur-xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-black/10 blur-xl pointer-events-none" />

          {/* Top row */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-wider text-white/90 drop-shadow-xs">
                FinAI Spatial Wallet
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <Wifi size={16} className="text-white/80 rotate-90" />
              <div className="w-7 h-7 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30">
                <Sparkles size={14} />
              </div>
            </div>
          </div>

          {/* Balance middle */}
          <div className="relative z-10 my-4 sm:my-5">
            <span className="text-[11px] font-semibold text-white/80 block uppercase tracking-wider">
              Total Saldo Tersedia
            </span>
            <div className="text-2xl sm:text-3xl font-black text-white tracking-tight tabular-nums mt-0.5">
              Rp24.560.000
            </div>
          </div>

          {/* Bottom row */}
          <div className="relative z-10 pt-2 border-t border-white/20 flex items-center justify-between text-xs text-white/90 font-mono">
            <span>••••  ••••  ••••  4821</span>
            <span className="text-[10px] font-sans font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20">
              Active Tier
            </span>
          </div>
        </motion.div>

        {/* =================================================================== */}
        {/* 2. LOWER ROW: 2 COMPACT WORKSPACE CARDS (CHART & GOAL)              */}
        {/* =================================================================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Card A: Spending Mini Chart */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="p-4.5 rounded-[22px] bg-white border border-[#E8EAF2] shadow-[0_10px_28px_rgba(36,38,54,0.05)] space-y-3"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-[#757A95] uppercase tracking-wider block">
                  Pengeluaran
                </span>
                <span className="text-sm font-extrabold text-[#242636] tabular-nums">
                  Rp1.420.000
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-[#D0EFE5] text-[#1B7354] text-[10px] font-bold flex items-center gap-1">
                <TrendingUp size={11} />
                -14%
              </span>
            </div>

            {/* Mini 7-day bar rhythm */}
            <div className="h-14 flex items-end justify-between gap-1.5 pt-1 px-1">
              {[45, 30, 65, 40, 85, 95, 60].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ duration: 0.7, delay: 0.2 + i * 0.05, ease: 'easeOut' }}
                    className={`w-full rounded-md transition-colors ${
                      i === 4 || i === 5
                        ? 'bg-[#7C7CE6]'
                        : 'bg-[#E4E2FB] hover:bg-[#D6E4FA]'
                    }`}
                  />
                  <span className="text-[9px] font-semibold text-[#8A8FA8]">
                    {['S', 'S', 'R', 'K', 'J', 'S', 'M'][i]}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Card B: Goal Target Progress (Laptop Baru) */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="p-4.5 rounded-[22px] bg-white border border-[#E8EAF2] shadow-[0_10px_28px_rgba(36,38,54,0.05)] space-y-2.5 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#E4E2FB] text-[#7C7CE6] flex items-center justify-center">
                  <Target size={14} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#242636] leading-tight">
                    Laptop Baru
                  </h4>
                  <span className="text-[10px] text-[#757A95] leading-tight">
                    Target Impian
                  </span>
                </div>
              </div>
              <span className="text-xs font-extrabold text-[#7C7CE6]">
                29%
              </span>
            </div>

            {/* Progress bar */}
            <div className="space-y-1">
              <div className="w-full h-2 rounded-full bg-[#F2F3FA] overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '29%' }}
                  transition={{ duration: 0.9, delay: 0.35, ease: 'easeOut' }}
                  className="h-full rounded-full bg-gradient-to-r from-[#7C7CE6] to-[#8C8BE8]"
                />
              </div>
              <div className="flex items-center justify-between text-[10px] font-semibold text-[#757A95]">
                <span>Rp3.500.000</span>
                <span>Rp12.000.000</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* =================================================================== */}
        {/* 3. AI INSIGHT FLOATING CARD: Fade-in on viewport                     */}
        {/* =================================================================== */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="p-3.5 sm:p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-[#E8EAF2] shadow-[0_10px_30px_rgba(36,38,54,0.06)] flex items-center gap-3"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#7C7CE6] to-[#8C8BE8] text-white flex items-center justify-center shrink-0 shadow-xs">
            <Sparkles size={16} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#7C7CE6]">
                FinAI Insight
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#1B7354]" />
            </div>
            <p className="text-xs font-semibold text-[#242636] leading-tight truncate sm:whitespace-normal">
              Pengeluaran makananmu minggu ini 14% lebih rendah.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
