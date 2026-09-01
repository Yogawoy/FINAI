'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Receipt,
  Wallet,
  PieChart,
  Target,
  ChartLine,
  Sparkles,
} from 'lucide-react';
import FeatureCard from './FeatureCard';

const FEATURES_DATA = [
  {
    title: 'Catat Transaksi',
    description: 'Catat pemasukan dan pengeluaran dengan mudah.',
    icon: Receipt,
    colorClass: 'text-[#7C7CE6]',
    bgClass: 'bg-[#E4E2FB]',
  },
  {
    title: 'Dompet Digital',
    description: 'Kelola saldo dari berbagai dompet dalam satu tempat.',
    icon: Wallet,
    colorClass: 'text-[#3E6FB0]',
    bgClass: 'bg-[#D6E4FA]',
  },
  {
    title: 'Anggaran',
    description: 'Pantau pengeluaran sebelum melewati batas.',
    icon: PieChart,
    colorClass: 'text-[#1B7354]',
    bgClass: 'bg-[#D0EFE5]',
  },
  {
    title: 'Target Impian',
    description: 'Rencanakan tabungan untuk hal yang ingin kamu capai.',
    icon: Target,
    colorClass: 'text-[#B85D19]',
    bgClass: 'bg-[#FCE6D2]',
  },
  {
    title: 'Analisis',
    description: 'Lihat pola dan tren keuanganmu dengan jelas.',
    icon: ChartLine,
    colorClass: 'text-[#485CB4]',
    bgClass: 'bg-[#DFE7FC]',
  },
  {
    title: 'FinAI Assistant',
    description: 'Ceritakan kondisi keuanganmu dan biarkan AI membantu.',
    icon: Sparkles,
    colorClass: 'text-[#6A6AD6]',
    bgClass: 'bg-[#EAE8FC]',
  },
];

export default function FeaturesSection() {
  return (
    <section id="fitur" className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20 scroll-mt-24">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 space-y-3"
      >
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E4E2FB]/70 border border-[#D6D4F7] text-[11px] font-bold uppercase tracking-wider text-[#7C7CE6]">
          Fitur Lengkap
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#242636] leading-tight">
          Semua yang kamu butuhkan untuk mengatur keuangan.
        </h2>
        <p className="text-sm sm:text-base text-[#757A95] leading-relaxed">
          FinAI membantu kamu memahami uangmu, bukan hanya mencatatnya.
        </p>
      </motion.div>

      {/* 3x2 Grid on Desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {FEATURES_DATA.map((feat, index) => (
          <FeatureCard
            key={feat.title}
            title={feat.title}
            description={feat.description}
            icon={feat.icon}
            colorClass={feat.colorClass}
            bgClass={feat.bgClass}
            index={index}
          />
        ))}
      </div>
    </section>
  );
}
