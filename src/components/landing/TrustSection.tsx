'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Check } from 'lucide-react';

const TRUST_POINTS = [
  {
    title: 'Data terstruktur',
    desc: 'Semua data keuangan tersusun dalam satu tempat.',
    icon: Shield,
    color: 'text-[#1B7354]',
    bg: 'bg-[#D0EFE5]',
  },
  {
    title: 'Kontrol pengguna',
    desc: 'Kamu tetap memegang kendali atas setiap tindakan.',
    icon: Lock,
    color: 'text-[#7C7CE6]',
    bg: 'bg-[#E4E2FB]',
  },
  {
    title: 'Konfirmasi AI',
    desc: 'FinAI meminta konfirmasi sebelum melakukan perubahan finansial.',
    icon: Check,
    color: 'text-[#3E6FB0]',
    bg: 'bg-[#D6E4FA]',
  },
];

export default function TrustSection() {
  return (
    <section id="tentang" className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24 scroll-mt-24">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 space-y-3"
      >
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D0EFE5] text-[11px] font-bold uppercase tracking-wider text-[#1B7354]">
          Keamanan & Privasi
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#242636] leading-tight">
          Keuanganmu tetap milikmu.
        </h2>
        <p className="text-sm sm:text-base text-[#757A95]">
          Dirancang dengan prinsip perlindungan privasi dan kontrol pengguna yang tidak dapat ditawar.
        </p>
      </motion.div>

      {/* 3 Trust Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        {TRUST_POINTS.map((pt, index) => {
          const Icon = pt.icon;
          return (
            <motion.div
              key={pt.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.45, delay: index * 0.1, ease: 'easeOut' }}
              whileHover={{ y: -4 }}
              className="p-7 rounded-[24px] bg-white border border-[#E8EAF2] shadow-[0_4px_24px_rgba(36,38,54,0.03)] hover:shadow-[0_12px_32px_rgba(36,38,54,0.07)] transition-all space-y-4 select-none"
            >
              <div
                className={`w-12 h-12 rounded-2xl ${pt.bg} ${pt.color} flex items-center justify-center shadow-2xs`}
              >
                <Icon size={22} />
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#242636] tracking-tight">
                  {pt.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#757A95] mt-1.5 leading-relaxed">
                  {pt.desc}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
