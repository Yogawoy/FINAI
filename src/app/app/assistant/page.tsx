'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Send,
  Mic,
  MessageSquare,
  RefreshCw,
  ArrowRight,
} from 'lucide-react';
import Header from '@/components/navigation/Header';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import AICore from '@/components/visual/AICore';
import { AIMessage, AICoreState } from '@/types';

// Loading & Page Transition
import AIChatSkeleton from '@/components/loading/AIChatSkeleton';
import PageTransition from '@/components/loading/PageTransition';

const INDO_PRESET_PROMPTS = [
  {
    id: 'p-1',
    label: 'Aku tadi beli ayam geprek 10 ribu.',
    answer: 'Dicatat!\n\n• **Ayam Geprek** — Rp10.000 (Food)\n\nTotal pengeluaran hari ini: **Rp54.000**\nSisa kuota harian aman: **Rp66.000**',
    insights: [
      { label: 'Kategori', value: 'Food & Dining' },
      { label: 'Tercatat', value: '-Rp10.000' },
    ],
  },
  {
    id: 'p-2',
    label: 'Aku hari ini sudah keluar berapa?',
    answer: 'Hari ini kamu sudah menghabiskan **Rp54.000** dari batas nyaman harian Rp120.000.\n\nPengeluaran terbesar hari ini:\n• **Food & Dining** — Rp36.000\n• **Transportation** — Rp18.000',
    insights: [
      { label: 'Total Hari Ini', value: 'Rp54.000' },
      { label: 'Status Harian', value: 'Sangat Aman' },
    ],
  },
  {
    id: 'p-3',
    label: 'Dimana pengeluaran terbesarku?',
    answer: 'Sepanjang Agustus, pengeluaran terbesarmu berada di pos **Food & Dining sebesar 34% (Rp2.150.000)**, disusul **Bills & Utilities 22% (Rp1.100.000)**.',
    insights: [
      { label: 'Terbesar #1', value: 'Food (34%)' },
      { label: 'Terbesar #2', value: 'Bills (22%)' },
    ],
  },
  {
    id: 'p-4',
    label: 'Bisa nabung berapa bulan ini?',
    answer: 'Berdasarkan inflow dan outflow bulan Agustus, kamu diproyeksikan mengamankan **Rp6.250.000** net savings (Savings Rate: **34.2%**).\n\nFinAI sarankan menyisihkan:\n• Rp1.280.000 ke Goal Laptop\n• Rp1.800.000 ke Goal Liburan Jepang',
    insights: [
      { label: 'Proyeksi Tabungan', value: 'Rp6.250.000' },
      { label: 'Savings Rate', value: '34.2%' },
    ],
  },
];

const INITIAL_MESSAGES: AIMessage[] = [
  {
    id: 'ai-init',
    sender: 'assistant',
    content: 'Halo Yoga! Saya FinAI Companion. Cashflow kamu bulan Agustus sangat sehat dengan savings rate 34.2%. Ada pengeluaran baru yang ingin kamu catat atau tanyakan?',
    timestamp: '14:02',
    quickInsights: [
      { label: 'Health Score', value: '82 / 100' },
      { label: 'Surplus Margin', value: 'Rp2.450.000' },
    ],
  },
];

export default function AssistantPage() {
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 450);
    return () => clearTimeout(timer);
  }, []);

  const [messages, setMessages] = useState<AIMessage[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [aiState, setAiState] = useState<AICoreState>('idle');
  const [activeTopic, setActiveTopic] = useState('Analisis Pengeluaran Agustus');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, aiState]);

  const handleSendPrompt = (promptText: string, customAnswer?: string, insights?: { label: string; value: string }[]) => {
    if (!promptText.trim()) return;

    // 1. User message
    const userMsg: AIMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      content: promptText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');

    // 2. Set state to thinking
    setAiState('thinking');

    // 3. Simulate reasoning transition to responding
    setTimeout(() => {
      setAiState('responding');

      const fallbackAnswer = `Saya mencatat permintaan Anda: "${promptText}". Saat ini sistem mutasi dan budget Anda sudah otomatis disesuaikan secara real-time.`;

      const aiMsg: AIMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        content: customAnswer || fallbackAnswer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        quickInsights: insights || [
          { label: 'Status Input', value: 'Berhasil Tercatat' },
          { label: 'AI Confidence', value: '99.4%' },
        ],
      };

      setMessages((prev) => [...prev, aiMsg]);

      // 4. Return to idle
      setTimeout(() => {
        setAiState('idle');
      }, 1800);
    }, 1200);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendPrompt(inputText);
  };

  if (isLoading) {
    return <AIChatSkeleton />;
  }

  return (
    <PageTransition>
      <div className="space-y-8 max-w-7xl mx-auto pb-16">
        {/* Header */}
        <Header
          title="FinAI Assistant"
          subtitle="Conversational financial interface with layered CSS AI Core"
          actionButton={
            <div className="flex items-center gap-1.5 glass-pill px-3 py-1.5 rounded-2xl">
              <span className="text-xs font-semibold text-[#757A95]">State:</span>
              {(['idle', 'thinking', 'responding'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setAiState(s)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold uppercase transition-all cursor-pointer ${
                    aiState === s
                      ? 'bg-[#7C7CE6] text-white shadow-xs'
                      : 'text-[#757A95] hover:text-[#242636]'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          }
        />

        {/* Main 3-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Topics & History (3 Columns) */}
          <div className="lg:col-span-3 space-y-4">
            <GlassCard variant="subtle" className="p-4 space-y-3">
              <span className="text-xs font-bold text-[#757A95] uppercase tracking-wider block">
                Sesi Percakapan
              </span>

              <div className="space-y-1.5">
                {[
                  'Analisis Pengeluaran Agustus',
                  'Pencatatan Makan & Jajan',
                  'Pacing Goal Laptop M3',
                  'Evaluasi Tabungan Jepang',
                ].map((topic) => (
                  <button
                    key={topic}
                    onClick={() => setActiveTopic(topic)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-2 cursor-pointer ${
                      activeTopic === topic
                        ? 'bg-white text-[#7C7CE6] font-bold shadow-xs border border-white'
                        : 'text-[#757A95] hover:text-[#242636] hover:bg-black/[0.02]'
                    }`}
                  >
                    <MessageSquare size={13} className="shrink-0 text-[#7C7CE6]" />
                    <span className="truncate">{topic}</span>
                  </button>
                ))}
              </div>
            </GlassCard>

            <GlassCard variant="subtle" className="p-4 space-y-3">
              <span className="text-xs font-bold text-[#757A95] uppercase tracking-wider block">
                AI Core Status
              </span>
              <div className="py-2 flex justify-center">
                <AICore state={aiState} />
              </div>
              <p className="text-[11px] text-[#757A95] text-center leading-relaxed">
                {aiState === 'idle' && 'FinAI siap menerima instruksi atau pertanyaan baru.'}
                {aiState === 'thinking' && 'Memproses pola keuangan dan data cashflow Anda...'}
                {aiState === 'responding' && 'Menyusun rekomendasi dan respons personal...'}
              </p>
            </GlassCard>
          </div>

          {/* Center/Right Column: Chat Stream (9 Columns) */}
          <GlassCard className="lg:col-span-9 p-4 sm:p-6 min-h-[580px] flex flex-col justify-between space-y-4">
            {/* Message Stream */}
            <div className="space-y-4 max-h-[480px] overflow-y-auto pr-2 custom-scrollbar">
              <AnimatePresence>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex items-start gap-3 ${
                      msg.sender === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {msg.sender === 'assistant' && (
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#7C7CE6] to-[#A0A0FC] flex items-center justify-center text-white shrink-0 shadow-xs mt-1">
                        <Sparkles size={16} />
                      </div>
                    )}

                    <div
                      className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-2xl text-xs sm:text-sm leading-relaxed space-y-3 ${
                        msg.sender === 'user'
                          ? 'bg-[#7C7CE6] text-white rounded-tr-xs shadow-xs'
                          : 'bg-[#F8F9FD] text-[#242636] border border-black/[0.04] rounded-tl-xs'
                      }`}
                    >
                      <div className="whitespace-pre-line">{msg.content}</div>

                      {/* Quick Insights Cards */}
                      {msg.quickInsights && (
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-black/[0.05]">
                          {msg.quickInsights.map((qi, idx) => (
                            <div
                              key={idx}
                              className="p-2 rounded-xl bg-white border border-black/[0.04] shadow-2xs space-y-0.5"
                            >
                              <span className="text-[10px] font-bold text-[#757A95] uppercase block">
                                {qi.label}
                              </span>
                              <span className="text-xs font-extrabold text-[#7C7CE6] block">
                                {qi.value}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      <span
                        className={`text-[10px] block text-right font-medium ${
                          msg.sender === 'user' ? 'text-white/70' : 'text-[#757A95]'
                        }`}
                      >
                        {msg.timestamp}
                      </span>
                    </div>

                    {msg.sender === 'user' && (
                      <div className="w-8 h-8 rounded-xl bg-[#242636] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-1 shadow-xs">
                        YW
                      </div>
                    )}
                  </motion.div>
                ))}

                {/* Thinking bubble indicator */}
                {aiState === 'thinking' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#7C7CE6] to-[#A0A0FC] flex items-center justify-center text-white shrink-0 shadow-xs">
                      <Sparkles size={16} className="animate-spin" />
                    </div>
                    <div className="p-3.5 rounded-2xl bg-[#F8F9FD] border border-black/[0.04] flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#7C7CE6] animate-pulse" />
                      <span className="w-2 h-2 rounded-full bg-[#7C7CE6] animate-pulse delay-100" />
                      <span className="w-2 h-2 rounded-full bg-[#7C7CE6] animate-pulse delay-200" />
                      <span className="text-xs text-[#757A95] font-semibold ml-2">
                        FinAI sedang menganalisis...
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div ref={chatEndRef} />
            </div>

            {/* Bottom Controls: Preset Prompts + Input Bar */}
            <div className="space-y-3 pt-3 border-t border-black/[0.04]">
              {/* Preset Prompts horizontal scroll */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
                <span className="text-[11px] font-bold text-[#757A95] shrink-0 flex items-center gap-1">
                  <MessageSquare size={13} /> Saran Cepat:
                </span>
                {INDO_PRESET_PROMPTS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleSendPrompt(p.label, p.answer, p.insights)}
                    className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#F8F9FD] text-[#242636] border border-black/[0.06] shadow-2xs text-xs font-semibold whitespace-nowrap transition-all cursor-pointer hover:border-[#7C7CE6]/40"
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {/* Input Form */}
              <form onSubmit={handleFormSubmit} className="relative">
                <input
                  type="text"
                  placeholder="Ketik pertanyaan atau catat pengeluaran Anda (misal: 'Beli bensin 30rb')..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="w-full pl-4 pr-24 py-3 rounded-2xl bg-white border border-black/[0.08] shadow-inner text-xs sm:text-sm text-[#242636] placeholder-[#757A95] focus:outline-none focus:ring-2 focus:ring-[#7C7CE6]/40 transition-all"
                />

                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                  <button
                    type="button"
                    title="Voice input placeholder"
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-[#757A95] hover:text-[#7C7CE6] hover:bg-black/[0.04] transition-colors cursor-pointer"
                  >
                    <Mic size={16} />
                  </button>

                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    className="h-8 px-3 rounded-xl"
                  >
                    <Send size={14} />
                  </Button>
                </div>
              </form>
            </div>
          </GlassCard>
        </div>
      </div>
    </PageTransition>
  );
}
