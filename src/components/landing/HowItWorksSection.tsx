'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { UserPlus, MessageSquare, TrendingUp } from 'lucide-react';

const STEPS_DATA = [
  {
    step: '01',
    title: 'Buat akun',
    desc: 'Hubungkan kebutuhan finansialmu.',
    icon: UserPlus,
    color: 'text-[#7C7CE6]',
    bg: 'bg-[#E4E2FB]',
  },
  {
    step: '02',
    title: 'Catat dan ngobrol',
    desc: 'Ceritakan transaksi atau rencana keuanganmu.',
    icon: MessageSquare,
    color: 'text-[#3E6FB0]',
    bg: 'bg-[#D6E4FA]',
  },
  {
    step: '03',
    title: 'Pahami dan capai target',
    desc: 'Gunakan insight FinAI untuk membuat keputusan yang lebih baik.',
    icon: TrendingUp,
    color: 'text-[#1B7354]',
    bg: 'bg-[#D0EFE5]',
  },
];

export default function HowItWorksSection() {
  return (
    <section id="cara-kerja" className="max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-28 scroll-mt-28">
      <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E4E2FB]/70 border border-[#D6D4F7] text-[11px] font-bold uppercase tracking-wider text-[#7C7CE6]">
          Panduan Praktis
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#242636] leading-tight">
          Mulai dalam 3 langkah.
        </h2>
        <p className="text-sm sm:text-base text-[#757A95]">
          Proses onboarding yang ringan, terstruktur, dan langsung siap dipakai.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        {STEPS_DATA.map((s, index) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.step}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.45, delay: index * 0.12, ease: 'easeOut' }}
              whileHover={{ y: -4 }}
              className="p-7 rounded-[24px] bg-white border border-[#E8EAF2] shadow-[0_4px_24px_rgba(36,38,54,0.03)] hover:shadow-[0_12px_32px_rgba(36,38,54,0.07)] transition-all space-y-4 select-none relative"
            >
              <div className="flex items-center justify-between">
                <div
                  className={`w-11 h-11 rounded-2xl ${s.bg} ${s.color} flex items-center justify-center shadow-2xs`}
                >
                  <Icon size={20} />
                </div>
                <span className="font-mono text-2xl font-black text-[#DEDFF0] select-none">
                  {s.step}
                </span>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#242636] tracking-tight">
                  {s.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#757A95] mt-1.5 leading-relaxed">
                  {s.desc}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
