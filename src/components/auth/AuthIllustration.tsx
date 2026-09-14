'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Wallet,
  ArrowUpRight,
  PieChart,
} from 'lucide-react';
import AuthBrand from './AuthBrand';

interface AuthIllustrationProps {
  mode: 'login' | 'register';
  className?: string;
}

export default function AuthIllustration({
  mode,
  className = '',
}: AuthIllustrationProps) {
  const isLogin = mode === 'login';

  return (
    <div
      className={`relative w-full h-full flex flex-col justify-between overflow-hidden bg-gradient-to-br from-[#F4F5FD] via-[#ECEAFD] to-[#E2E6FA] select-none p-8 sm:p-10 lg:p-12 ${className}`}
    >
      {/* Soft Ambient Ethereal Glows */}
      <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-[#E4E2FB]/80 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-20 w-96 h-96 rounded-full bg-[#D6E4FA]/70 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 left-1/3 w-80 h-80 rounded-full bg-[#D0EFE5]/50 blur-3xl pointer-events-none" />

      {/* 1. Header Section: Brand & Dynamic Copy */}
      <div className="relative z-20 space-y-6">
        <AuthBrand />

        <AnimatePresence mode="wait">
          {isLogin ? (
            <motion.div
              key="login-heading"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-2.5 max-w-sm"
            >
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#242636] tracking-tight leading-snug">
                Kelola Keuangan <br />
                <span className="text-[#7C7CE6]">Lebih Tenang</span> & Terarah
              </h2>
              <p className="text-xs sm:text-sm text-[#757A95] leading-relaxed">
                Pantau arus kas, pos anggaran, dan impian finansialmu dalam satu ekosistem cerdas.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="register-heading"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-2.5 max-w-sm"
            >
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#242636] tracking-tight leading-snug">
                Mulai Rencana <br />
                <span className="text-[#7C7CE6]">Finansial Baru</span> Bersama FinAI
              </h2>
              <p className="text-xs sm:text-sm text-[#757A95] leading-relaxed">
                Bergabunglah untuk mendapatkan ringkasan otomatis, insight cerdas, dan kontrol penuh atas asetmu.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 2. Middle Section: Calm Floating Fintech Preview Cards */}
      <div className="relative z-20 my-auto py-6 space-y-3.5 max-w-sm w-full">
        {/* Card 1: Balance Snapshot */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white/85 backdrop-blur-md rounded-2xl p-4 border border-white/90 shadow-[0_10px_30px_rgba(36,38,54,0.06)]"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-[#E4E2FB] text-[#7C7CE6] flex items-center justify-center">
                <Wallet size={14} />
              </div>
              <span className="text-xs font-semibold text-[#757A95]">Total Saldo Kas</span>
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#1B7354] bg-[#D0EFE5]/50 px-2 py-0.5 rounded-full">
              <TrendingUp size={11} /> +12.8%
            </span>
          </div>
          <div className="text-xl font-extrabold text-[#242636] tracking-tight">
            Rp 24.850.000
          </div>
        </motion.div>

        {/* Card 2: AI Financial Insight */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white/85 backdrop-blur-md rounded-2xl p-4 border border-white/90 shadow-[0_10px_30px_rgba(36,38,54,0.06)] flex items-start gap-3"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#7C7CE6] to-[#A3A2F0] text-white flex items-center justify-center shrink-0 shadow-xs">
            <Sparkles size={16} />
          </div>
          <div className="space-y-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#242636]">Insight FinAI</span>
              <span className="text-[10px] text-[#757A95] font-medium">Hari ini</span>
            </div>
            <p className="text-[11px] text-[#757A95] leading-relaxed">
              Arus kas bulan ini sangat sehat! Alokasi anggaran bulanan berada di bawah batas 70%.
            </p>
          </div>
        </motion.div>

        {/* Card 3: Smart Budget Capsule */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white/85 backdrop-blur-md rounded-2xl p-3.5 border border-white/90 shadow-[0_10px_30px_rgba(36,38,54,0.06)] flex items-center justify-between"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-[#D0EFE5] text-[#1B7354] flex items-center justify-center">
              <PieChart size={14} />
            </div>
            <div>
              <div className="text-xs font-bold text-[#242636]">Anggaran Kebutuhan</div>
              <div className="text-[10px] text-[#757A95]">Rp 3.200.000 / Rp 5.000.000</div>
            </div>
          </div>
          <div className="text-xs font-extrabold text-[#7C7CE6]">64%</div>
        </motion.div>
      </div>

      {/* 3. Footer Trust Badge */}
      <div className="relative z-20 flex items-center gap-2 text-xs font-medium text-[#757A95] pt-2">
        <ShieldCheck size={16} className="text-[#1B7354]" />
        <span>Enkripsi Standar Perbankan • Privasi Terlindungi</span>
      </div>
    </div>
  );
}
