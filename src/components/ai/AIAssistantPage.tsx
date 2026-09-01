'use client';

import React, { useState } from 'react';
import { AIMessage as AIMessageType, AIFinancialAction } from '@/types';
import AIHeader from './AIHeader';
import AIContextBar from './AIContextBar';
import AIConversation from './AIConversation';
import AIInput from './AIInput';
import AIQuickActions from './AIQuickActions';

const INITIAL_MOCK_CONVERSATION: AIMessageType[] = [
  {
    id: 'm-1',
    sender: 'user',
    content: 'Tadi aku beli ayam geprek 10 ribu.',
    timestamp: '09:42',
  },
  {
    id: 'm-2',
    sender: 'assistant',
    content: 'Aku memahami ini sebagai pengeluaran baru. Silakan konfirmasi detail berikut sebelum disimpan ke buku kas Anda:',
    timestamp: '09:42',
    action: {
      id: 'act-1',
      type: 'expense',
      title: 'Ayam Geprek',
      amount: 10000,
      category: 'Makanan & Minuman',
      sourceWallet: 'BCA •••• 4821',
      date: '1 September 2026',
      status: 'pending',
    },
  },
  {
    id: 'm-3',
    sender: 'user',
    content: 'Aku mau nabung 500 ribu buat kuliah dari BCA.',
    timestamp: '09:45',
  },
  {
    id: 'm-4',
    sender: 'assistant',
    content: 'Siap! Saya telah menyiapkan setoran tabungan untuk target impianmu. Konfirmasi untuk mengeksekusi transfer internal:',
    timestamp: '09:45',
    action: {
      id: 'act-2',
      type: 'goal_contribution',
      title: 'Target Kuliah',
      amount: 500000,
      sourceWallet: 'BCA •••• 4821',
      destinationWallet: 'Tabungan Kuliah',
      date: '1 September 2026',
      status: 'pending',
    },
  },
];

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<AIMessageType[]>(INITIAL_MOCK_CONVERSATION);
  const [isThinking, setIsThinking] = useState(false);
  const [showPresetsModal, setShowPresetsModal] = useState(false);

  // Financial live context state
  const [balance, setBalance] = useState(24560000);
  const [monthlyExpense, setMonthlyExpense] = useState(6230000);

  // Handle user sending message
  const handleSendMessage = (text: string) => {
    const timeStr = new Date().toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const userMsg: AIMessageType = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      content: text,
      timestamp: timeStr,
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsThinking(true);

    // Natural Language Response Simulation
    setTimeout(() => {
      setIsThinking(false);
      const lower = text.toLowerCase();

      // 1. Detect Expense Recording
      if (
        lower.includes('beli') ||
        lower.includes('bayar') ||
        lower.includes('makan') ||
        lower.includes('kopi') ||
        lower.includes('geprek') ||
        lower.includes('sepatu') ||
        lower.includes('listrik')
      ) {
        let title = 'Pengeluaran Harian';
        let amount = 25000;
        let category = 'Makanan & Minuman';

        if (lower.includes('kopi')) {
          title = 'Kopi Susu Espresso';
          amount = 18000;
          category = 'Makanan & Minuman';
        } else if (lower.includes('geprek')) {
          title = 'Ayam Geprek Sambal';
          amount = 10000;
          category = 'Makanan & Minuman';
        } else if (lower.includes('listrik')) {
          title = 'Tagihan Listrik PLN';
          amount = 250000;
          category = 'Tagihan & Utilitas';
        } else if (lower.includes('sepatu')) {
          title = 'Sepatu Olahraga';
          amount = 700000;
          category = 'Belanja & Kebutuhan';
        }

        // Try extracting numeric amount from text
        const matchedDigits = text.match(/\d+(\.\d+)?/);
        if (matchedDigits) {
          const num = parseInt(matchedDigits[0].replace(/\./g, ''), 10);
          if (num > 0) {
            if (num < 1000 && lower.includes('ribu')) {
              amount = num * 1000;
            } else if (num < 100 && lower.includes('juta')) {
              amount = num * 1000000;
            } else {
              amount = num;
            }
          }
        }

        const aiMsg: AIMessageType = {
          id: `ai-${Date.now()}`,
          sender: 'assistant',
          content: 'Aku memahami ini sebagai transaksi pengeluaran. Berikut rincian yang disiapkan untuk dikonfirmasi:',
          timestamp: timeStr,
          action: {
            id: `act-${Date.now()}`,
            type: 'expense',
            title,
            amount,
            category,
            sourceWallet: 'BCA •••• 4821',
            date: '1 September 2026',
            status: 'pending',
          },
        };
        setMessages((prev) => [...prev, aiMsg]);
        return;
      }

      // 2. Detect Goal Contribution
      if (
        lower.includes('nabung') ||
        lower.includes('tabungan') ||
        lower.includes('kuliah') ||
        lower.includes('target') ||
        lower.includes('laptop')
      ) {
        let title = 'Target Kuliah';
        let amount = 500000;
        let destWallet = 'Tabungan Kuliah';

        if (lower.includes('laptop')) {
          title = 'Laptop Baru';
          destWallet = 'Tabungan Laptop';
        }

        const aiMsg: AIMessageType = {
          id: `ai-${Date.now()}`,
          sender: 'assistant',
          content: 'Siap! Saya telah menyiapkan setoran tabungan untuk target impianmu. Konfirmasi sebelum dana dialokasikan:',
          timestamp: timeStr,
          action: {
            id: `act-${Date.now()}`,
            type: 'goal_contribution',
            title,
            amount,
            sourceWallet: 'BCA •••• 4821',
            destinationWallet: destWallet,
            date: '1 September 2026',
            status: 'pending',
          },
        };
        setMessages((prev) => [...prev, aiMsg]);
        return;
      }

      // 3. Detect Budget Question
      if (lower.includes('budget') || lower.includes('anggaran') || lower.includes('aman')) {
        const aiMsg: AIMessageType = {
          id: `ai-${Date.now()}`,
          sender: 'assistant',
          content: 'Pos anggaran Makanan & Minuman saat ini masih dalam batas aman (terpakai 72%). Berikut ringkasannya:',
          timestamp: timeStr,
          insight: {
            type: 'budget',
            title: 'Anggaran Makanan & Minuman',
            subtitle: 'Evaluasi Periode September 2026',
            metrics: [
              { label: 'Batas Anggaran', value: 'Rp3.000.000' },
              { label: 'Total Terpakai', value: 'Rp2.150.000' },
              { label: 'Sisa Kuota', value: 'Rp850.000', color: 'text-[#1B7354]' },
              { label: 'Persentase', value: '72%', color: 'text-[#5F5ED4]' },
            ],
            actionLabel: 'Lihat Semua Pos Anggaran',
            actionHref: '/app/budgets',
          },
        };
        setMessages((prev) => [...prev, aiMsg]);
        return;
      }

      // 4. Detect Analytics / Spending Question
      if (
        lower.includes('pengeluaran') ||
        lower.includes('gimana') ||
        lower.includes('analisis') ||
        lower.includes('keuangan')
      ) {
        const aiMsg: AIMessageType = {
          id: `ai-${Date.now()}`,
          sender: 'assistant',
          content:
            'Pengeluaranmu bulan ini mencapai Rp6.230.000, sekitar 8% lebih tinggi dibanding bulan lalu. Namun kamu masih memiliki rasio tabungan sehat sebesar 34,2%.',
          timestamp: timeStr,
          insight: {
            type: 'analytics',
            title: 'Keseimbangan Arus Kas',
            subtitle: 'Kategori Terbesar: Makanan & Minuman (Rp2.150.000)',
            metrics: [
              { label: 'Total Pemasukan', value: 'Rp16.900.000' },
              { label: 'Total Pengeluaran', value: 'Rp6.230.000' },
              { label: 'Net Cashflow', value: '+Rp10.670.000', color: 'text-[#1B7354]' },
              { label: 'Rasio Tabungan', value: '34,2%', color: 'text-[#5F5ED4]' },
            ],
            actionLabel: 'Buka Analisis Mendalam',
            actionHref: '/app/analytics',
          },
        };
        setMessages((prev) => [...prev, aiMsg]);
        return;
      }

      // 5. Default Friendly Financial Assistance
      const defaultAiMsg: AIMessageType = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        content:
          'Aku siap membantumu mencatat transaksi harian, mengecek ketersediaan anggaran, atau menghitung progres target tabunganmu. Kamu cukup ceritakan secara alami apa yang baru saja terjadi.',
        timestamp: timeStr,
      };
      setMessages((prev) => [...prev, defaultAiMsg]);
    }, 750);
  };

  // Confirm Financial Action
  const handleConfirmAction = (actionId: string) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.action && msg.action.id === actionId) {
          const updatedAction: AIFinancialAction = {
            ...msg.action,
            status: 'confirmed',
          };

          // Update context metrics
          if (updatedAction.type === 'expense') {
            setBalance((b) => Math.max(b - updatedAction.amount, 0));
            setMonthlyExpense((e) => e + updatedAction.amount);
          }

          return {
            ...msg,
            action: updatedAction,
          };
        }
        return msg;
      })
    );
  };

  // Cancel Financial Action
  const handleCancelAction = (actionId: string) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.action && msg.action.id === actionId) {
          return {
            ...msg,
            action: {
              ...msg.action,
              status: 'cancelled',
            },
          };
        }
        return msg;
      })
    );
  };

  // Reset to new conversation
  const handleNewChat = () => {
    setMessages([]);
  };

  // Clear conversation
  const handleClearChat = () => {
    setMessages([]);
  };

  return (
    <div className="max-w-[1150px] mx-auto pb-8 space-y-6">
      {/* 1. Header */}
      <AIHeader onNewChat={handleNewChat} onClearChat={handleClearChat} />

      {/* 2. Context Summary Bar */}
      <AIContextBar
        balance={balance}
        monthlyExpense={monthlyExpense}
        activeGoalsCount={4}
        activeBudgetsCount={6}
        contextDate="September 2026"
      />

      {/* 3. Conversation Area */}
      <div className="min-h-[420px] max-w-[920px] mx-auto pt-2">
        <AIConversation
          messages={messages}
          isThinking={isThinking}
          onConfirmAction={handleConfirmAction}
          onCancelAction={handleCancelAction}
          onSelectAction={handleSendMessage}
        />
      </div>

      {/* Quick Suggestions below conversation if there are messages */}
      {messages.length > 0 && (
        <div className="max-w-[920px] mx-auto pt-2">
          <AIQuickActions onSelectAction={handleSendMessage} />
        </div>
      )}

      {/* 4. Sticky Input Area */}
      <div className="max-w-[920px] mx-auto">
        <AIInput
          onSendMessage={handleSendMessage}
          disabled={isThinking}
          onOpenPresets={() => setShowPresetsModal(!showPresetsModal)}
        />
      </div>
    </div>
  );
}
