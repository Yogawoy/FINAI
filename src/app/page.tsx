'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  PieChart,
  Target,
  LineChart,
  Layers,
  Eye,
  CheckCircle2,
  Wallet,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import GlassCard from '@/components/ui/GlassCard';
import WalletCard from '@/components/wallet/WalletCard';
import { USER_PROFILE, formatIDR } from '@/data/mockData';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F6F7FB] text-[#242636] relative overflow-x-hidden selection:bg-[#E4E2FB] selection:text-[#7C7CE6]">
      {/* Background Multi-Layer Ambient Glows */}
      <div className="fixed -top-20 -left-20 w-[600px] h-[600px] rounded-full aurora-glow-1 pointer-events-none -z-10" />
      <div className="fixed top-1/2 -right-28 w-[550px] h-[550px] rounded-full aurora-glow-2 pointer-events-none -z-10" />

      {/* ========================================================================= */}
      {/* 1. FLOATING NAVBAR                                                        */}
      {/* ========================================================================= */}
      <header className="sticky top-4 z-40 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="glass-panel rounded-full px-5 sm:px-6 py-3 flex items-center justify-between shadow-[0_8px_30px_rgba(48,51,74,0.04)] border border-white/90">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#7C7CE6] to-[#8C8BE8] flex items-center justify-center shadow-[0_4px_12px_rgba(124,124,230,0.35)] group-hover:scale-105 transition-transform">
              <Sparkles size={16} className="text-white" />
            </div>
            <span className="font-extrabold tracking-tight text-lg text-[#242636]">
              FinAI
            </span>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-[#757A95]">
            <a href="#fitur" className="hover:text-[#242636] transition-colors">
              Fitur
            </a>
            <a href="#keunggulan" className="hover:text-[#242636] transition-colors">
              Keunggulan
            </a>
            <a href="#cara-kerja" className="hover:text-[#242636] transition-colors">
              Cara Kerja
            </a>
          </nav>

          {/* CTA */}
          <div className="flex items-center gap-3">
            <Link href="/app">
              <Button variant="primary" size="sm" icon={<ArrowRight size={14} />} iconPosition="right">
                Buka Aplikasi
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. HERO SECTION: EDITORIAL LAYOUT + DIGITAL WALLET SHOWCASE               */}
      {/* ========================================================================= */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 sm:pt-20 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column (6 Cols): Editorial Value Prop */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="lg:col-span-6 space-y-6 text-center lg:text-left"
          >
            <Badge variant="periwinkle" size="md" icon={<Sparkles size={13} />}>
              Aplikasi Keuangan Personal Modern
            </Badge>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-[#242636] leading-[1.08]">
              Uangmu.{' '}
              <span className="bg-gradient-to-r from-[#7C7CE6] via-[#8C8BE8] to-[#6362D8] bg-clip-text text-transparent block sm:inline">
                Mudah Dipahami.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-[#757A95] leading-relaxed max-w-xl mx-auto lg:mx-0 font-normal">
              Pahami ke mana uangmu pergi, kelola pos anggaran dengan tenang, dan capai target impianmu melalui antarmuka dompet digital yang bersih dan intuitif.
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link href="/app" className="w-full sm:w-auto">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full sm:w-auto shadow-[0_8px_25px_rgba(124,124,230,0.35)]"
                  icon={<ArrowRight size={17} />}
                  iconPosition="right"
                >
                  Mulai Sekarang
                </Button>
              </Link>
              <Link href="/app" className="w-full sm:w-auto">
                <Button
                  variant="glass"
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  Coba Prototipe
                </Button>
              </Link>
            </div>

            {/* Trust points */}
            <div className="pt-6 border-t border-black/[0.05] flex items-center justify-center lg:justify-start gap-6 text-xs text-[#757A95]">
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 size={15} className="text-[#1B7354]" />
                Tanpa Rumus Rumit
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 size={15} className="text-[#7C7CE6]" />
                Dompet Finansial Interaktif
              </span>
            </div>
          </motion.div>

          {/* Right Column (6 Cols): Large Digital Wallet Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.15, ease: 'easeOut' }}
            className="lg:col-span-6 relative flex flex-col items-center justify-center"
          >
            <WalletCard
              balance={USER_PROFILE.availableBalance}
              cardNumber="••••  ••••  ••••  4821"
              holderName="Yoga W."
              expiry="08/26"
            />

            <div className="mt-4 p-4 rounded-2xl bg-white/80 backdrop-blur-md border border-white/90 shadow-xs flex items-center justify-between w-full">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#757A95] block">
                  Arus Kas Bersih Bulan Ini
                </span>
                <div className="flex items-center gap-2 text-base font-extrabold text-[#1B7354] mt-0.5">
                  <TrendingUp size={16} />
                  <span>+Rp4.200.000</span>
                </div>
              </div>
              <span className="text-xs font-semibold text-[#1B7354] bg-[#D0EFE5] px-2.5 py-1 rounded-lg">
                Kesehatan 82/100
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. FILOSOFI: DESAIN BERSIH & FOKUS PENGGUNA                                */}
      {/* ========================================================================= */}
      <section id="keunggulan" className="max-w-6xl mx-auto px-4 sm:px-6 py-20 border-t border-black/[0.04]">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <Badge variant="periwinkle" size="sm">
            Pendekatan FinAI
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#242636]">
            Kelola Keuangan Tanpa Rasa Lelah
          </h2>
          <p className="text-sm text-[#757A95] leading-relaxed">
            FinAI didesain khusus untuk memberikan kejelasan posisi uangmu dalam hitungan detik dengan tata letak editorial yang lapang dan menenangkan.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <GlassCard variant="elevated" className="p-8 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#E4E2FB] flex items-center justify-center text-[#7C7CE6]">
              <Wallet size={24} />
            </div>
            <h3 className="text-xl font-bold text-[#242636]">
              Dompet Digital FinAI
            </h3>
            <p className="text-xs sm:text-sm text-[#757A95] leading-relaxed">
              Pusat kendali saldo yang interaktif dan responsif terhadap kursor mouse, memberikan kesan nyata kepemilikan aset finansial pribadimu.
            </p>
          </GlassCard>

          <GlassCard variant="elevated" className="p-8 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#D0EFE5] flex items-center justify-center text-[#1B7354]">
              <Eye size={24} />
            </div>
            <h3 className="text-xl font-bold text-[#242636]">
              Kejelasan 2D Yang Bersih
            </h3>
            <p className="text-xs sm:text-sm text-[#757A95] leading-relaxed">
              Buku kas transaksi, pos anggaran, dan kurva pertumbuhan tabungan disajikan dengan tipografi berstandar tinggi yang nyaman dibaca berulang kali.
            </p>
          </GlassCard>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. FITUR UTAMA                                                            */}
      {/* ========================================================================= */}
      <section id="fitur" className="max-w-6xl mx-auto px-4 sm:px-6 py-20 border-t border-black/[0.04]">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <Badge variant="periwinkle" size="sm">
            Fitur Lengkap
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#242636]">
            Semua yang Kamu Butuhkan dalam Satu Aplikasi
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <GlassCard variant="subtle" className="p-6 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E4E2FB] flex items-center justify-center text-[#7C7CE6]">
              <PieChart size={20} />
            </div>
            <h3 className="text-base font-bold text-[#242636]">
              Kontrol Anggaran
            </h3>
            <p className="text-xs text-[#757A95]">
              Pantau batas pengeluaran pos belanja dengan indikator kecepatan belanja yang aman.
            </p>
          </GlassCard>

          <GlassCard variant="subtle" className="p-6 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-[#D0EFE5] flex items-center justify-center text-[#1B7354]">
              <Target size={20} />
            </div>
            <h3 className="text-base font-bold text-[#242636]">
              Target Impian
            </h3>
            <p className="text-xs text-[#757A95]">
              Visualisasikan progres pembelian laptop, liburan, atau dana darurat secara berkala.
            </p>
          </GlassCard>

          <GlassCard variant="subtle" className="p-6 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-[#D6E4FA] flex items-center justify-center text-[#3E6FB0]">
              <LineChart size={20} />
            </div>
            <h3 className="text-base font-bold text-[#242636]">
              Analisis Arus Kas
            </h3>
            <p className="text-xs text-[#757A95]">
              Grafik 2D jernih yang memperlihatkan tren rasio tabungan dan kebiasaan belanja.
            </p>
          </GlassCard>

          <GlassCard variant="subtle" className="p-6 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FCE2E0] flex items-center justify-center text-[#B83A38]">
              <Sparkles size={20} />
            </div>
            <h3 className="text-base font-bold text-[#242636]">
              Asisten FinAI
            </h3>
            <p className="text-xs text-[#757A95]">
              Tanya jawab pengeluaran harian dan rekomendasi tabungan dengan bahasa sehari-hari.
            </p>
          </GlassCard>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. CALL TO ACTION & FOOTER                                                */}
      {/* ========================================================================= */}
      <section id="cara-kerja" className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
        <div className="glass-panel rounded-3xl p-8 sm:p-12 text-center space-y-6 relative overflow-hidden shadow-[0_20px_50px_rgba(124,124,230,0.12)] border border-white">
          <div className="w-14 h-14 rounded-3xl bg-gradient-to-tr from-[#7C7CE6] to-[#8C8BE8] flex items-center justify-center text-white mx-auto shadow-md">
            <Sparkles size={24} />
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#242636] max-w-lg mx-auto">
            Mulai kelola uangmu dengan cara yang lebih menyenangkan.
          </h2>

          <p className="text-sm text-[#757A95] max-w-md mx-auto">
            Coba prototipe interaktif FinAI lengkap dengan kartu dompet digital dan buku kas transaksi.
          </p>

          <div className="pt-2">
            <Link href="/app">
              <Button variant="primary" size="lg" icon={<ArrowRight size={17} />} iconPosition="right">
                Buka Aplikasi FinAI
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-4 sm:px-6 py-8 border-t border-black/[0.05] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#757A95]">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-[#7C7CE6] flex items-center justify-center text-white">
            <Sparkles size={11} />
          </div>
          <span className="font-bold text-[#242636]">FinAI</span>
          <span>— Uangmu. Mudah Dipahami.</span>
        </div>
        <span>Aplikasi Keuangan Personal Modern</span>
      </footer>
    </div>
  );
}
