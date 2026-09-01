'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Utensils, PiggyBank, Check } from 'lucide-react';

export default function AIConversationPreview() {
  return (
    <div className="w-full max-w-xl mx-auto space-y-4 select-none">
      {/* ===================================================================== */}
      {/* EXCHANGE 1: PENGELUARAN MAKANAN                                       */}
      {/* ===================================================================== */}
      {/* 1. User Message 1 */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.4 }}
        className="flex justify-end"
      >
        <div className="bg-[#7C7CE6] text-white px-4.5 py-3 rounded-2xl rounded-tr-xs text-xs sm:text-sm font-medium shadow-xs max-w-[85%]">
          Tadi aku beli ayam geprek 10 ribu.
        </div>
      </motion.div>

      {/* 2. FinAI Response 1 */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="flex items-start gap-2.5 max-w-[92%]"
      >
        <div className="w-7 h-7 rounded-xl bg-[#7C7CE6] text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
          <Sparkles size={14} />
        </div>
        <div className="space-y-2 w-full">
          <div className="bg-white border border-[#E8EAF2] text-[#242636] px-4 py-2.5 rounded-2xl rounded-tl-xs text-xs sm:text-sm font-medium shadow-xs inline-block">
            Aku memahami ini sebagai pengeluaran.
          </div>

          {/* Action Card 1: Ayam Geprek */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: 0.25 }}
            className="p-4 rounded-2xl bg-white border border-[#E8EAF2] shadow-[0_6px_20px_rgba(36,38,54,0.04)] space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#FFEFEB] text-[#E0533C] flex items-center justify-center">
                  <Utensils size={16} />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-[#242636]">
                    Ayam Geprek
                  </h4>
                  <span className="text-[11px] text-[#757A95]">
                    Kategori: Makanan · Dompet: BCA •••• 4821
                  </span>
                </div>
              </div>
              <span className="text-xs sm:text-sm font-extrabold text-[#E0533C] tabular-nums">
                -Rp10.000
              </span>
            </div>

            <button
              type="button"
              className="w-full py-2 px-3 rounded-xl bg-[#F0EFFC] hover:bg-[#E4E2FB] text-xs font-bold text-[#5F5ED4] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Check size={14} strokeWidth={2.5} />
              <span>Simpan Transaksi</span>
            </button>
          </motion.div>
        </div>
      </motion.div>

      {/* ===================================================================== */}
      {/* EXCHANGE 2: SETORAN TABUNGAN                                          */}
      {/* ===================================================================== */}
      {/* 3. User Message 2 */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.4, delay: 0.35 }}
        className="flex justify-end pt-2"
      >
        <div className="bg-[#7C7CE6] text-white px-4.5 py-3 rounded-2xl rounded-tr-xs text-xs sm:text-sm font-medium shadow-xs max-w-[85%]">
          Aku mau nabung 500 ribu buat kuliah.
        </div>
      </motion.div>

      {/* 4. FinAI Response 2 */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.4, delay: 0.45 }}
        className="flex items-start gap-2.5 max-w-[92%]"
      >
        <div className="w-7 h-7 rounded-xl bg-[#7C7CE6] text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
          <Sparkles size={14} />
        </div>
        <div className="space-y-2 w-full">
          <div className="bg-white border border-[#E8EAF2] text-[#242636] px-4 py-2.5 rounded-2xl rounded-tl-xs text-xs sm:text-sm font-medium shadow-xs inline-block">
            Siap. Aku akan menyiapkan setoran:
          </div>

          {/* Action Card 2: Setoran Tabungan */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: 0.55 }}
            className="p-4 rounded-2xl bg-white border border-[#E8EAF2] shadow-[0_6px_20px_rgba(36,38,54,0.04)] space-y-3"
          >
            <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-[#F8F9FD] border border-black/[0.04] text-xs">
              <div className="min-w-0">
                <span className="text-[10px] text-[#757A95] block">Sumber</span>
                <span className="font-bold text-[#242636] block">BCA</span>
                <span className="font-extrabold text-[#E0533C] tabular-nums">-Rp500.000</span>
              </div>

              <ArrowRight size={16} className="text-[#7C7CE6] shrink-0" />

              <div className="min-w-0 text-right">
                <span className="text-[10px] text-[#757A95] block">Tujuan</span>
                <span className="font-bold text-[#242636] block">Tabungan Kuliah</span>
                <span className="font-extrabold text-[#1B7354] tabular-nums">+Rp500.000</span>
              </div>
            </div>

            <button
              type="button"
              className="w-full py-2 px-3 rounded-xl bg-[#D0EFE5] hover:bg-[#BCE8D9] text-xs font-bold text-[#1B7354] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Check size={14} strokeWidth={2.5} />
              <span>Konfirmasi Setoran</span>
            </button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
