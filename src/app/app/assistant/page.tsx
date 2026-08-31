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

const INDO_PRESET_PROMPTS = [
  {
    id: 'p-1',
    label: 'Aku tadi beli ayam geprek 10 ribu.',
    answer: 'Dicatat!\n\n• **Ayam Geprek** — Rp10.000 (Food)\n\nTotal pengeluaran hari ini: **Rp54.000**\nSisa kuota harian aman: **Rp66.000**',
    insights: [
      { label: 'Kategori', value: 'Food & Dining' },
      { label: 'Tercatat', value: '-Rp10.000' }
    ]
  },
  {
    id: 'p-2',
    label: 'Aku hari ini sudah keluar berapa?',
    answer: 'Hari ini kamu sudah menghabiskan **Rp54.000** dari batas nyaman harian Rp120.000.\n\nPengeluaran terbesar hari ini:\n• **Food & Dining** — Rp36.000\n• **Transportation** — Rp18.000',
    insights: [
      { label: 'Total Hari Ini', value: 'Rp54.000' },
      { label: 'Status Harian', value: 'Sangat Aman' }
    ]
  },
  {
    id: 'p-3',
    label: 'Dimana pengeluaran terbesarku?',
    answer: 'Sepanjang Agustus, pengeluaran terbesarmu berada di pos **Food & Dining sebesar 34% (Rp2.150.000)**, disusul **Bills & Utilities 22% (Rp1.100.000)**.',
    insights: [
      { label: 'Terbesar #1', value: 'Food (34%)' },
      { label: 'Terbesar #2', value: 'Bills (22%)' }
    ]
  },
  {
    id: 'p-4',
    label: 'Bisa nabung berapa bulan ini?',
    answer: 'Berdasarkan inflow dan outflow bulan Agustus, kamu diproyeksikan mengamankan **Rp6.250.000** net savings (Savings Rate: **34.2%**).\n\nFinAI sarankan menyisihkan:\n• Rp1.280.000 ke Goal Laptop\n• Rp1.800.000 ke Goal Liburan Jepang',
    insights: [
      { label: 'Proyeksi Tabungan', value: 'Rp6.250.000' },
      { label: 'Savings Rate', value: '34.2%' }
    ]
  }
];

const INITIAL_MESSAGES: AIMessage[] = [
  {
    id: 'ai-init',
    sender: 'assistant',
    content: "Halo Yoga! Saya FinAI Companion. Cashflow kamu bulan Agustus sangat sehat dengan savings rate 34.2%. Ada pengeluaran baru yang ingin kamu catat atau tanyakan?",
    timestamp: '14:02',
    quickInsights: [
      { label: 'Health Score', value: '82 / 100' },
      { label: 'Surplus Margin', value: 'Rp2.450.000' }
    ]
  }
];

export default function AssistantPage() {
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

      const answerContent =
        customAnswer ||
        `Catatan diproses untuk "${promptText}". Berdasarkan posisi keuanganmu saat ini, alokasi cashflow tetap seimbang dan berada di koridor aman.`;

      const aiMsg: AIMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        content: answerContent,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        quickInsights: insights || [
          { label: 'Status', value: 'Tersinkronisasi' },
          { label: 'Surplus', value: '+Rp2.450.000' }
        ]
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

  return (
    <div className="space-y-8">
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

            <div className="pt-3 border-t border-black/[0.04]">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-xs text-[#757A95]"
                icon={<RefreshCw size={12} />}
                onClick={() => setMessages(INITIAL_MESSAGES)}
              >
                Reset Percakapan
              </Button>
            </div>
          </GlassCard>

          {/* AI Core State Indicator */}
          <GlassCard variant="subtle" className="p-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  aiState === 'thinking'
                    ? 'bg-[#7C7CE6] animate-ping'
                    : aiState === 'responding'
                    ? 'bg-[#50B89C] animate-pulse'
                    : 'bg-[#7C7CE6]'
                }`}
              />
              <div>
                <span className="text-xs font-bold text-[#242636] block capitalize">
                  Core: {aiState}
                </span>
                <span className="text-[10px] text-[#757A95]">
                  {aiState === 'thinking'
                    ? 'Memproses data transaksi...'
                    : aiState === 'responding'
                    ? 'Menampilkan insight...'
                    : 'Siap menerima pertanyaan'}
                </span>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Right / Center Column: CSS/SVG AI Core & Chat Stream (9 Columns) */}
        <div className="lg:col-span-9 space-y-6">
          {/* Central CSS/SVG AI Core Stage */}
          <div className="glass-panel p-6 rounded-3xl relative overflow-hidden flex flex-col items-center justify-center border border-white/90 shadow-[0_10px_35px_rgba(124,124,230,0.06)]">
            <div className="absolute top-4 left-6 z-10 flex items-center gap-2">
              <Badge variant="periwinkle" size="sm" icon={<Sparkles size={12} />}>
                FinAI Layered Core
              </Badge>
              <Badge
                variant={aiState === 'thinking' ? 'periwinkle' : aiState === 'responding' ? 'mint' : 'glass'}
                size="sm"
              >
                {aiState.toUpperCase()}
              </Badge>
            </div>

            <div className="my-2">
              <AICore state={aiState} />
            </div>

            <p className="text-xs text-[#757A95] text-center max-w-md mt-1 font-medium">
              {aiState === 'thinking'
                ? 'Menganalisis pengeluaran dan kecepatan anggaran...'
                : aiState === 'responding'
                ? 'Menyusun rekomendasi keuangan personal...'
                : 'FinAI Spatial Core memantau keseimbangan uangmu secara real-time.'}
            </p>
          </div>

          {/* Suggested Prompt Chips */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-[#757A95] uppercase tracking-wider block">
              Contoh Pertanyaan (Klik untuk mencoba)
            </span>
            <div className="flex flex-wrap gap-2">
              {INDO_PRESET_PROMPTS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handleSendPrompt(preset.label, preset.answer, preset.insights)}
                  className="px-3.5 py-2 rounded-2xl bg-white/75 hover:bg-white text-xs font-semibold text-[#242636] border border-white/90 shadow-xs hover:shadow-[0_4px_16px_rgba(124,124,230,0.12)] hover:text-[#7C7CE6] transition-all cursor-pointer flex items-center gap-2"
                >
                  <Sparkles size={12} className="text-[#7C7CE6]" />
                  <span>{preset.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Chat Stream Panel */}
          <GlassCard className="p-6 space-y-6 min-h-[360px] flex flex-col justify-between">
            {/* Message Stream */}
            <div className="space-y-4 overflow-y-auto max-h-[420px] pr-2">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${
                    msg.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {msg.sender === 'assistant' && (
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#7C7CE6] to-[#8C8BE8] flex items-center justify-center text-white shrink-0 shadow-xs mt-1">
                      <Sparkles size={15} />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-3xl text-xs sm:text-sm leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-gradient-to-r from-[#7C7CE6] to-[#8C8BE8] text-white rounded-br-sm shadow-[0_4px_16px_rgba(124,124,230,0.25)]'
                        : 'bg-white/90 text-[#242636] rounded-bl-sm border border-white shadow-[0_6px_20px_rgba(48,51,74,0.03)]'
                    }`}
                  >
                    <div className="whitespace-pre-line">{msg.content}</div>

                    {msg.quickInsights && msg.quickInsights.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-black/[0.05]">
                        {msg.quickInsights.map((ins, i) => (
                          <div
                            key={i}
                            className="px-2.5 py-1 rounded-xl bg-[#E4E2FB]/70 text-[#7C7CE6] text-[11px] font-bold"
                          >
                            <span>{ins.label}: </span>
                            <span className="text-[#242636]">{ins.value}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <span
                      className={`text-[10px] block mt-2 text-right ${
                        msg.sender === 'user' ? 'text-white/75' : 'text-[#757A95]'
                      }`}
                    >
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              ))}

              {/* Thinking Indicator */}
              {aiState === 'thinking' && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#7C7CE6] to-[#8C8BE8] flex items-center justify-center text-white shrink-0">
                    <Sparkles size={14} className="animate-spin" />
                  </div>
                  <div className="px-4 py-3 rounded-2xl bg-white/80 border border-white text-xs text-[#757A95] flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#7C7CE6] animate-ping" />
                    <span>FinAI sedang memproses catatan keuanganmu...</span>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Chat Input Bar */}
            <form onSubmit={handleFormSubmit} className="pt-4 border-t border-black/[0.04]">
              <div className="relative flex items-center">
                <input
                  type="text"
                  placeholder="Ceritakan pengeluaranmu (misal: Beli ayam geprek 10 ribu)..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="w-full pl-5 pr-28 py-3.5 bg-black/[0.02] border border-black/[0.06] rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#7C7CE6]/50 focus:bg-white text-[#242636] transition-all"
                />

                <div className="absolute right-2 flex items-center gap-1.5">
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
              </div>
            </form>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
