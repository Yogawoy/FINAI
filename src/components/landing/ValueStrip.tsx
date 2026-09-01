'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Receipt, Layers, Target, Sparkles } from 'lucide-react';

const VALUE_PILLARS = [
  {
    label: 'Catat',
    desc: 'Mutasi pemasukan & belanja instan',
    icon: Receipt,
    color: 'text-[#7C7CE6]',
    bg: 'bg-[#E4E2FB]',
  },
  {
    label: 'Atur',
    desc: 'Distribusi saldo multi dompet',
    icon: Layers,
    color: 'text-[#3E6FB0]',
    bg: 'bg-[#D6E4FA]',
  },
  {
    label: 'Rencanakan',
    desc: 'Batas pos anggaran & tabungan',
    icon: Target,
    color: 'text-[#1B7354]',
    bg: 'bg-[#D0EFE5]',
  },
  {
    label: 'Pahami',
    desc: 'Insight kecerdasan buatan FinAI',
    icon: Sparkles,
    color: 'text-[#6A6AD6]',
    bg: 'bg-[#EAE8FC]',
  },
];

export default function ValueStrip() {
  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="rounded-[24px] bg-white border border-[#E8EAF2] p-6 sm:p-8 shadow-[0_10px_35px_rgba(36,38,54,0.03)] space-y-6"
      >
        <div className="text-center max-w-lg mx-auto">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#7C7CE6] block mb-1">
            Ekosistem Terpadu
          </span>
          <h2 className="text-lg sm:text-xl font-extrabold text-[#242636] tracking-tight">
            Satu tempat untuk memahami keuanganmu.
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 pt-2">
          {VALUE_PILLARS.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <motion.div
                key={pillar.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08, ease: 'easeOut' }}
                className="flex flex-col items-center text-center p-3 rounded-2xl hover:bg-[#FAFBFD] transition-colors select-none"
              >
                <div
                  className={`w-11 h-11 rounded-2xl ${pillar.bg} ${pillar.color} flex items-center justify-center mb-3 shadow-2xs`}
                >
                  <Icon size={20} />
                </div>
                <h3 className="text-sm font-bold text-[#242636]">
                  {pillar.label}
                </h3>
                <p className="text-[11px] text-[#757A95] mt-0.5 leading-tight">
                  {pillar.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}
