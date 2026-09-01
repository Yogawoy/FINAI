'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, MessageSquareCode, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';
import AIConversationPreview from './AIConversationPreview';

export default function AISection() {
  return (
    <section
      id="ai-assistant"
      className="py-16 sm:py-24 bg-gradient-to-b from-[#F2F1FD] via-[#EDEBFB] to-[#F6F7FB] border-y border-[#E8EAF2]/80 scroll-mt-16"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
          {/* Left Column (5 Cols): Editorial description */}
          <div className="lg:col-span-5 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/80 border border-[#D6D4F7] text-xs font-bold text-[#7C7CE6] shadow-2xs">
              <Sparkles size={13} />
              <span>Kecerdasan Kontekstual</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#242636] leading-tight">
              Keuanganmu bisa diajak bicara.
            </h2>

            <p className="text-sm sm:text-base text-[#757A95] leading-relaxed">
              FinAI memahami konteks keuanganmu, bukan hanya kata-kata yang kamu tulis. Cukup ketik seperti sedang berkirim pesan dengan sahabatmu.
            </p>

            <div className="space-y-3 pt-2 text-left max-w-md mx-auto lg:mx-0">
              <div className="flex items-start gap-3 text-xs sm:text-sm text-[#242636]">
                <div className="w-5 h-5 rounded-md bg-[#D0EFE5] text-[#1B7354] flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 size={13} />
                </div>
                <span><strong>Deteksi Tindakan Otomatis:</strong> Langsung mengonversi percakapan ke kartu transaksi kas.</span>
              </div>
              <div className="flex items-start gap-3 text-xs sm:text-sm text-[#242636]">
                <div className="w-5 h-5 rounded-md bg-[#D0EFE5] text-[#1B7354] flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 size={13} />
                </div>
                <span><strong>Simulasi Tabungan & Target:</strong> Mempersiapkan rencana setoran berkala hanya dengan satu kalimat.</span>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#7C7CE6] hover:bg-[#6A6AD6] text-white text-xs sm:text-sm font-bold shadow-[0_8px_20px_rgba(124,124,230,0.3)] transition-all cursor-pointer select-none"
              >
                <span>Coba Asisten FinAI</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>

          {/* Right Column (7 Cols): The interactive chat cards */}
          <div className="lg:col-span-7">
            <AIConversationPreview />
          </div>
        </div>
      </div>
    </section>
  );
}
