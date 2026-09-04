'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Send,
  Bot,
  TrendingUp,
  ShieldCheck,
  Utensils,
  RefreshCw,
  Zap,
  HelpCircle,
  Clock,
  ArrowRight,
} from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { formatIDR } from '@/lib/format';

interface AITransactionPromptProps {
  isOpen: boolean;
  onClose: () => void;
  initialPrompt?: string;
}

interface MessageItem {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  time: string;
  highlight?: string;
}

const CATEGORY_PROMPTS = [
  {
    category: 'Analisis Mutasi',
    prompts: [
      'Berapa total pengeluaranku hari ini?',
      'Ke mana uangku paling banyak keluar bulan ini?',
      'Berapa total tagihan yang sudah dibayar?',
    ],
  },
  {
    category: 'Evaluasi & Tips',
    prompts: [
      'Kenapa pengeluaranku bulan ini meningkat?',
      'Apakah masih aman untuk makan di luar malam ini?',
      'Berikan rekomendasi hemat untuk minggu ini',
    ],
  },
];

export default function AITransactionPrompt({
  isOpen,
  onClose,
  initialPrompt,
}: AITransactionPromptProps) {
  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversation, setConversation] = useState<MessageItem[]>([
    {
      id: 'msg-1',
      sender: 'assistant',
      text: 'Halo Yoga! Saya Asisten Intelijen FinAI. Saya telah menganalisis 25 mutasi buku kasmu di bulan Agustus 2026. Ada yang ingin kamu ketahui seputar keuanganmu?',
      time: '12:45 PM',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && initialPrompt) {
      handleSend(initialPrompt);
    }
  }, [isOpen, initialPrompt]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation, isTyping]);

  const handleSend = (textToSend?: string) => {
    const query = textToSend || inputQuery;
    if (!query.trim()) return;

    const userMessage: MessageItem = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: query,
      time: 'Baru saja',
    };

    setConversation((prev) => [...prev, userMessage]);
    setInputQuery('');
    setIsTyping(true);

    // Simulasi respons intelijen FinAI yang komprehensif
    setTimeout(() => {
      let responseText =
        'FinAI telah memeriksa seluruh mutasi kasmu. Arus kas bulan ini surplus Rp4.200.000 dengan rasio tabungan optimal di angka 34,2%.';
      let highlightNote: string | undefined = undefined;

      const q = query.toLowerCase();

      if (q.includes('hari ini') || q.includes('today')) {
        responseText =
          'Hari ini (31 Agustus 2026) kamu mencatat 3 transaksi pengeluaran senilai total Rp68.000:\n• Ayam Geprek Sambal Matah (Rp28.000)\n• GrabBike Kantor (Rp18.000)\n• Coffee Latte (Rp22.000)\n\nLaju belanja hari ini masih sangat aman di bawah batas harian rata-ratamu (Rp276.000).';
        highlightNote = 'Status: Pengeluaran Hari Ini Terkendali (Rp68.000)';
      } else if (q.includes('banyak') || q.includes('mana') || q.includes('boros')) {
        responseText =
          'Kategori pengeluaran terbesarmu bulan ini adalah Makanan & Minuman dengan total Rp2.150.000 (34% dari total pengeluaran), disusul oleh Belanja Kebutuhan Rp1.700.000 (27%).';
        highlightNote = 'Kategori Terbesar: Makanan & Minuman (34%)';
      } else if (q.includes('meningkat') || q.includes('kenapa') || q.includes('naik')) {
        responseText =
          'Peningkatan pengeluaran minggu ini dipicu oleh belanja bulanan supermarket (Groceries Rp450.000) dan perpanjangan langganan internet IndiHome (Rp399.000). Namun arus kasmu tetap surplus karena ada tambahan pemasukan freelance Rp3.800.000.';
        highlightNote = 'Surplus Bersih Masih Aman di +Rp4.200.000';
      } else if (q.includes('makan') || q.includes('aman') || q.includes('malam') || q.includes('restoran')) {
        responseText =
          'Sangat aman! Kuota anggaran Makanan & Minumanmu masih menyisakan buffer Rp850.000 dari plafon Rp3.000.000 bulan ini. Kamu masih punya jatah harian aman sekitar Rp71.000 - Rp150.000 untuk makan malam.';
        highlightNote = 'Rekomendasi: Aman untuk Makan di Luar';
      } else if (q.includes('tagihan') || q.includes('bills')) {
        responseText =
          'Total tagihan rutin yang sudah kamu selesaikan bulan ini adalah Rp1.250.000, meliputi Listrik PLN (Rp350.000), Internet Fiber (Rp399.000), Netflix (Rp186.000), dan Spotify Duo (Rp74.900). Seluruh tagihan wajib sudah terbayar lunas!';
        highlightNote = 'Status Tagihan: 100% Lunas';
      } else if (q.includes('tips') || q.includes('hemat') || q.includes('rekomendasi')) {
        responseText =
          'Berikut 3 tips personal dari FinAI untuk optimasi sisa bulan ini:\n1. Manfaatkan promo akhir bulan untuk kebutuhan transportasi.\n2. Alihkan sisa surplus Rp4.200.000 sebesar 50% langsung ke instrumen reksadana atau target liburan.\n3. Masak sendiri saat akhir pekan untuk menjaga rasio tabungan di atas 35%.';
        highlightNote = 'Potensi Tambahan Tabungan: +Rp450.000/bulan';
      }

      const assistantMessage: MessageItem = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        text: responseText,
        time: 'Baru saja',
        highlight: highlightNote,
      };

      setIsTyping(false);
      setConversation((prev) => [...prev, assistantMessage]);
    }, 600);
  };

  const handleClearChat = () => {
    setConversation([
      {
        id: 'msg-1',
        sender: 'assistant',
        text: 'Percakapan direset. Silakan tanyakan hal lain seputar buku kas dan analisis pengeluaranmu.',
        time: 'Baru saja',
      },
    ]);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="2xl"
      noPadding
      className="overflow-hidden"
    >
      <div className="flex flex-col lg:flex-row min-h-[600px] max-h-[85vh]">
        {/* ========================================================================= */}
        {/* KOLOM KIRI: PANEL WAWASAN INTELIJEN & METRIK KAS CEPAT                    */}
        {/* ========================================================================= */}
        <div className="lg:w-5/12 bg-gradient-to-br from-[#F5F4FE] via-[#EDEAFC] to-[#E2EDFC] p-6 sm:p-7 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#E4E2FB] relative overflow-y-auto">
          {/* Ambient Glows */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-[#7C7CE6]/15 rounded-full blur-3xl pointer-events-none" />

          {/* Header Panel Kiri */}
          <div className="space-y-4 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#7C7CE6] to-[#8C8BE8] text-white flex items-center justify-center shadow-[0_8px_20px_rgba(124,124,230,0.35)] relative">
                <Sparkles size={22} />
                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#1B7354] border-2 border-white" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-[#242636] leading-tight">
                  FinAI Core Assistant
                </h3>
                <span className="text-[11px] font-bold text-[#1B7354] bg-[#D0EFE5] px-2 py-0.5 rounded-full inline-block mt-0.5">
                  ● Aktif Menganalisis
                </span>
              </div>
            </div>

            <p className="text-xs text-[#757A95] leading-relaxed">
              Asisten berbasis intelijen yang membaca mutasi kasmu secara otomatis untuk memberikan wawasan dan rekomendasi cerdas.
            </p>

            {/* 3 Kartu Insight Cepat */}
            <div className="space-y-2.5 pt-1">
              <span className="text-[11px] font-extrabold text-[#757A95] uppercase tracking-wider block">
                Kondisi Kas Saat Ini:
              </span>

              {/* Insight 1: Hari Ini */}
              <div className="p-3.5 rounded-2xl bg-white/85 border border-white shadow-xs space-y-1">
                <div className="flex items-center justify-between text-[11px] font-bold text-[#757A95]">
                  <span className="flex items-center gap-1.5 text-[#242636]">
                    <Clock size={13} className="text-[#7C7CE6]" />
                    Belanja Hari Ini
                  </span>
                  <span className="text-[#1B7354] bg-[#D0EFE5] px-2 py-0.5 rounded-full">Aman</span>
                </div>
                <div className="text-base font-extrabold text-[#242636]">
                  Rp68.000 <span className="text-[11px] text-[#757A95] font-normal">(3 Transaksi)</span>
                </div>
              </div>

              {/* Insight 2: Kategori Terbesar */}
              <div className="p-3.5 rounded-2xl bg-white/85 border border-white shadow-xs space-y-1">
                <div className="flex items-center justify-between text-[11px] font-bold text-[#757A95]">
                  <span className="flex items-center gap-1.5 text-[#242636]">
                    <Utensils size={13} className="text-[#B83A38]" />
                    Pos Terbesar
                  </span>
                  <span className="text-[#7C7CE6]">34% Porsi</span>
                </div>
                <div className="text-sm font-bold text-[#242636]">
                  Makanan & Minuman <span className="text-xs text-[#757A95] font-normal">(Rp2.150.000)</span>
                </div>
              </div>

              {/* Insight 3: Buffer Anggaran */}
              <div className="p-3.5 rounded-2xl bg-white/85 border border-white shadow-xs space-y-1">
                <div className="flex items-center justify-between text-[11px] font-bold text-[#757A95]">
                  <span className="flex items-center gap-1.5 text-[#242636]">
                    <ShieldCheck size={13} className="text-[#1B7354]" />
                    Sisa Kuota Harian
                  </span>
                  <span className="text-[#1B7354] font-extrabold">+Rp71.000/hari</span>
                </div>
                <div className="text-xs text-[#757A95]">
                  Bisa digunakan santai tanpa khawatir overbudget.
                </div>
              </div>
            </div>
          </div>

          {/* Footer Panel Kiri */}
          <div className="pt-4 border-t border-black/[0.05] text-[11px] text-[#757A95] flex items-center justify-between">
            <span>Privasi Data Keuangan Aman</span>
            <span className="font-bold text-[#7C7CE6]">FinAI Pro v2.4</span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* KOLOM KANAN: RUANG PERCAKAPAN AI YANG LUAS & INTERAKTIF                   */}
        {/* ========================================================================= */}
        <div className="lg:w-7/12 p-6 sm:p-7 flex flex-col justify-between bg-white relative">
          {/* Header Percakapan */}
          <div className="flex items-center justify-between pb-3 border-b border-black/[0.05]">
            <div>
              <h4 className="text-base font-extrabold text-[#242636]">
                Ruang Dialog FinAI
              </h4>
              <p className="text-xs text-[#757A95]">
                Tanya analisis pengeluaran atau minta saran alokasi dana
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleClearChat}
                className="p-2 rounded-xl bg-black/[0.03] hover:bg-[#E4E2FB] text-[#757A95] hover:text-[#5F5ED4] transition-colors cursor-pointer text-xs flex items-center gap-1"
                title="Reset Percakapan"
              >
                <RefreshCw size={13} />
                <span className="hidden sm:inline">Reset</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#757A95] hover:text-[#242636] hover:bg-black/[0.04] transition-colors cursor-pointer text-lg"
              >
                ×
              </button>
            </div>
          </div>

          {/* Thread Chat Feed (Expanded Scrollable Box) */}
          <div className="flex-1 overflow-y-auto py-4 space-y-3.5 pr-1 min-h-[320px] max-h-[400px]">
            {conversation.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[88%] p-4 rounded-3xl text-xs sm:text-[13px] leading-relaxed shadow-xs ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-[#7C7CE6] to-[#8C8BE8] text-white rounded-br-md shadow-[0_6px_20px_rgba(124,124,230,0.3)]'
                      : 'bg-[#F8F9FD] text-[#242636] border border-black/[0.05] rounded-bl-md'
                  }`}
                >
                  {msg.sender === 'assistant' && (
                    <div className="flex items-center justify-between gap-2 mb-1.5 pb-1 border-b border-black/[0.04]">
                      <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-[#7C7CE6]">
                        <Sparkles size={13} />
                        <span>Analisis FinAI</span>
                      </div>
                      <span className="text-[10px] text-[#757A95] font-medium">{msg.time}</span>
                    </div>
                  )}

                  <div className="whitespace-pre-line">{msg.text}</div>

                  {/* Highlight Box jika ada */}
                  {msg.highlight && (
                    <div className="mt-2.5 p-2 rounded-xl bg-[#E4E2FB]/70 border border-[#7C7CE6]/30 text-[11px] font-bold text-[#5F5ED4] flex items-center gap-1.5">
                      <Zap size={13} className="shrink-0" />
                      <span>{msg.highlight}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}

            {/* Indikator Mengetik */}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="p-3.5 rounded-2xl bg-[#F8F9FD] border border-black/[0.05] flex items-center gap-2 text-xs text-[#757A95]">
                  <div className="w-4 h-4 rounded-full border-2 border-[#7C7CE6] border-t-transparent animate-spin" />
                  <span>FinAI sedang membaca mutasi kasmu...</span>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Pills (Categorized) */}
          <div className="pt-2 pb-3 space-y-1.5 border-t border-black/[0.04]">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {CATEGORY_PROMPTS.flatMap((cat) => cat.prompts).map((prompt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSend(prompt)}
                  className="px-3 py-1.5 rounded-xl bg-[#F8F9FD] hover:bg-[#E4E2FB] text-[11px] font-semibold text-[#5F5ED4] border border-black/[0.05] hover:border-[#7C7CE6]/30 transition-all whitespace-nowrap shadow-2xs cursor-pointer shrink-0"
                >
                  ✦ {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Input Bar Mewah */}
          <div className="flex items-center gap-2 pt-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Tanyakan apa saja seputar pengeluaran, anggaran, atau saldo..."
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSend();
                }}
                className="w-full pl-4 pr-10 py-3 bg-[#F8F9FD] border border-black/[0.06] rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#7C7CE6]/40 focus:bg-white text-[#242636] transition-all"
              />
              <Sparkles
                size={16}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#7C7CE6]/60 pointer-events-none"
              />
            </div>

            <button
              type="button"
              onClick={() => handleSend()}
              disabled={!inputQuery.trim()}
              className="py-3 px-5 rounded-2xl bg-gradient-to-r from-[#7C7CE6] to-[#8C8BE8] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-[0_6px_20px_rgba(124,124,230,0.35)] hover:brightness-105 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shrink-0"
            >
              <Send size={15} />
              <span className="hidden sm:inline">Kirim</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
