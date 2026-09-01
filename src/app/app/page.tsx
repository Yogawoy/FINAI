'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Plus,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Send,
  Sliders,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingDown,
  CheckCircle2,
  Wallet,
  MoreVertical,
  Gem,
  Apple,
  User,
  Coffee,
  ShoppingBag,
  Minus,
  CreditCard,
  Target,
  LineChart,
  Bot,
  Calculator,
  MessageSquare,
  Building,
  Check,
  PieChart,
} from 'lucide-react';
import { IncomeExpenseChart } from '@/components/charts';
import Header from '@/components/navigation/Header';
import Button from '@/components/ui/Button';
import CustomSelect from '@/components/ui/CustomSelect';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import WalletCard from '@/components/wallet/WalletCard';
import {
  USER_PROFILE,
  MOCK_CASHFLOW,
  MOCK_BUDGETS,
  formatIDR,
} from '@/data/mockData';
import { BudgetCategory } from '@/types';
import DashboardSkeleton from '@/components/loading/DashboardSkeleton';
import PageTransition from '@/components/loading/PageTransition';

interface TransactionItem {
  id: string;
  name: string;
  date: string;
  amount: number;
  type: 'expense' | 'income';
  avatarType: 'apple' | 'user1' | 'user2';
  avatarBg?: string;
  avatarText?: string;
}

// 3 transaksi terakhir awal
const INITIAL_TRANSACTIONS: TransactionItem[] = [
  {
    id: 'tx-1',
    name: 'Apple Services',
    date: '03 Agustus 2026',
    amount: 653000,
    type: 'expense',
    avatarType: 'apple',
  },
  {
    id: 'tx-2',
    name: 'Ralph Edwards',
    date: '01 Agustus 2026',
    amount: 2643000,
    type: 'income',
    avatarType: 'user1',
    avatarBg: 'bg-[#E4E2FB]',
    avatarText: 'RE',
  },
  {
    id: 'tx-3',
    name: 'Jerome Bell',
    date: '27 Juli 2026',
    amount: 320000,
    type: 'expense',
    avatarType: 'user2',
    avatarBg: 'bg-[#D6E4FA]',
    avatarText: 'JB',
  },
];

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 450);
    return () => clearTimeout(timer);
  }, []);

  // Real-time prototype balance state
  const [balance, setBalance] = useState<number>(USER_PROFILE.availableBalance);
  const [transactions, setTransactions] = useState<TransactionItem[]>(INITIAL_TRANSACTIONS);
  const [budgetsList, setBudgetsList] = useState<BudgetCategory[]>(MOCK_BUDGETS);

  // Modal selector state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeFeature, setActiveFeature] = useState<
    'expense' | 'income' | 'transfer' | 'topup' | 'calc' | 'goal_sim' | 'budget_quick' | 'quick_ai'
  >('expense');

  // Form State: Catat Pengeluaran & Pemasukan
  const [txTitle, setTxTitle] = useState('');
  const [txCategory, setTxCategory] = useState('Makanan & Minuman');
  const [txAmount, setTxAmount] = useState('');
  const [txAccount, setTxAccount] = useState('BCA Prioritas');

  // Form State: Transfer
  const [transferFrom, setTransferFrom] = useState('Dompet FinAI');
  const [transferTo, setTransferTo] = useState('GoPay');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferSuccess, setTransferSuccess] = useState(false);

  // Form State: Top Up
  const [topUpAmount, setTopUpAmount] = useState('250000');
  const [topUpBank, setTopUpBank] = useState('BCA Virtual Account');
  const [topUpSuccess, setTopUpSuccess] = useState(false);

  // Form State: Kalkulator 50/30/20
  const [calcSalary, setCalcSalary] = useState<number>(10000000);

  // Form State: Simulasi Target
  const [goalName, setGoalName] = useState('Liburan ke Bali');
  const [goalTarget, setGoalTarget] = useState('6000000');
  const [goalMonths, setGoalMonths] = useState('6');
  const [goalSaved, setGoalSaved] = useState(false);

  // Form State: Tanya FinAI Cepat
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponses, setAiResponses] = useState<
    { role: 'user' | 'assistant'; text: string }[]
  >([
    {
      role: 'assistant',
      text: 'Halo Yoga! Kondisi keuanganmu saat ini sangat sehat dengan skor 82/100 dan rasio tabungan 34,2%. Ada yang ingin kamu tanyakan mengenai alokasi uangmu?',
    },
  ]);

  const handleOpenFeature = (
    feature: 'expense' | 'income' | 'transfer' | 'topup' | 'calc' | 'goal_sim' | 'budget_quick' | 'quick_ai'
  ) => {
    setActiveFeature(feature);
    setTransferSuccess(false);
    setTopUpSuccess(false);
    setGoalSaved(false);
    setIsModalOpen(true);
  };

  // Submit Handler untuk semua transaksi
  const handleSubmitExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!txTitle || !txAmount) return;
    const num = parseFloat(txAmount);

    setBalance((prev) => prev - num);
    const newTx: TransactionItem = {
      id: `tx-${Date.now()}`,
      name: txTitle,
      date: 'Hari ini',
      amount: num,
      type: 'expense',
      avatarType: 'user1',
      avatarBg: 'bg-[#E4E2FB]',
      avatarText: txTitle.substring(0, 2).toUpperCase(),
    };
    setTransactions([newTx, ...transactions.slice(0, 2)]);
    setTxTitle('');
    setTxAmount('');
    setIsModalOpen(false);
  };

  const handleSubmitIncome = (e: React.FormEvent) => {
    e.preventDefault();
    if (!txTitle || !txAmount) return;
    const num = parseFloat(txAmount);

    setBalance((prev) => prev + num);
    const newTx: TransactionItem = {
      id: `tx-${Date.now()}`,
      name: txTitle,
      date: 'Hari ini',
      amount: num,
      type: 'income',
      avatarType: 'user1',
      avatarBg: 'bg-[#D0EFE5]',
      avatarText: txTitle.substring(0, 2).toUpperCase(),
    };
    setTransactions([newTx, ...transactions.slice(0, 2)]);
    setTxTitle('');
    setTxAmount('');
    setIsModalOpen(false);
  };

  const handleSubmitTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferAmount) return;
    const num = parseFloat(transferAmount);
    setBalance((prev) => prev - num);
    setTransferSuccess(true);
    setTimeout(() => {
      setIsModalOpen(false);
      setTransferAmount('');
      setTransferSuccess(false);
    }, 1200);
  };

  const handleSubmitTopUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topUpAmount) return;
    const num = parseFloat(topUpAmount);
    setBalance((prev) => prev + num);
    setTopUpSuccess(true);
    setTimeout(() => {
      setIsModalOpen(false);
      setTopUpSuccess(false);
    }, 1200);
  };

  const handleAskAI = (promptText?: string) => {
    const query = promptText || aiPrompt;
    if (!query.trim()) return;

    const userMsg = { role: 'user' as const, text: query };
    let replyText = 'FinAI telah menganalisis catatanmu. Kondisi keuanganmu aman dan surplus!';

    if (query.toLowerCase().includes('boros') || query.toLowerCase().includes('pengeluaran')) {
      replyText = 'Pengeluaran terbesarmu bulan ini ada di kategori Makanan & Minuman sebesar Rp2.150.000 (34% dari total pengeluaran).';
    } else if (query.toLowerCase().includes('sisa') || query.toLowerCase().includes('uang')) {
      replyText = `Saldo aktif di dompet FinAI kamu saat ini adalah ${formatIDR(balance)}.`;
    } else if (query.toLowerCase().includes('rekomendasi') || query.toLowerCase().includes('hemat') || query.toLowerCase().includes('tips')) {
      replyText = 'Rekomendasi minggu ini: Batasi makan di luar saat akhir pekan untuk menambah surplus tabungan target Liburanmu.';
    }

    setAiResponses((prev) => [...prev, userMsg, { role: 'assistant', text: replyText }]);
    setAiPrompt('');
  };

  const renderAvatar = (item: TransactionItem) => {
    if (item.avatarType === 'apple') {
      return (
        <div className="w-11 h-11 rounded-full bg-[#242636] flex items-center justify-center text-white shadow-xs shrink-0">
          <Apple size={20} />
        </div>
      );
    }
    return (
      <div
        className={`w-11 h-11 rounded-full ${item.avatarBg || 'bg-[#E4E2FB]'} text-[#7C7CE6] font-bold text-xs flex items-center justify-center shadow-xs shrink-0`}
      >
        {item.avatarText || 'TX'}
      </div>
    );
  };

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <PageTransition>
      <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header Utama */}
      <Header
        title="Selamat siang, Yoga."
        subtitle="Kondisi keuanganmu bulan ini sangat sehat."
      />

      {/* ========================================================================= */}
      {/* 1. KARTU DOMPET DIGITAL FULL-WIDTH (TANPA KONTEN DI SAMPINGNYA)           */}
      {/* ========================================================================= */}
      <section className="space-y-3 w-full">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#757A95]">
            Dompet Digital FinAI
          </span>
          <span className="text-xs font-semibold text-[#1B7354] bg-[#D0EFE5] px-3 py-1 rounded-full">
            Kartu Aktif
          </span>
        </div>

        {/* Kartu Dompet Penuh Kiri-Kanan */}
        <div className="w-full">
          <WalletCard
            balance={balance}
            cardNumber="••••  ••••  ••••  4821"
            holderName="Yoga W."
            expiry="08/26"
          />
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. AKSI CEPAT: GRID MENU LENGKAP ALA DANA (8 FITUR INTERAKTIF)             */}
      {/* ========================================================================= */}
      <section className="space-y-3 w-full">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#757A95] block">
            Aksi Cepat
          </span>
          <span className="text-[11px] font-semibold text-[#7C7CE6]">
            8 Fitur Transaksi & Finansial
          </span>
        </div>

        {/* Card Menu Grid ala DANA (8 Fitur Lengkap) */}
        <div className="p-6 sm:p-8 rounded-[28px] bg-white/85 backdrop-blur-md border border-white/90 shadow-[0_10px_35px_rgba(48,51,74,0.03)] w-full">
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-y-6 gap-x-3 sm:gap-4">
            {/* 1. Catat Keluar */}
            <button
              onClick={() => handleOpenFeature('expense')}
              className="flex flex-col items-center justify-center gap-2 group cursor-pointer"
            >
              <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-[#7C7CE6] to-[#8C8BE8] flex items-center justify-center text-white shadow-[0_8px_20px_rgba(124,124,230,0.3)] group-hover:scale-108 group-hover:shadow-[0_10px_25px_rgba(124,124,230,0.4)] group-active:scale-95 transition-all">
                <Minus size={22} strokeWidth={2.5} />
              </div>
              <span className="text-[11px] sm:text-xs font-bold text-[#242636] group-hover:text-[#7C7CE6] transition-colors text-center">
                Catat Keluar
              </span>
            </button>

            {/* 2. Catat Masuk */}
            <button
              onClick={() => handleOpenFeature('income')}
              className="flex flex-col items-center justify-center gap-2 group cursor-pointer"
            >
              <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-[#D0EFE5] to-[#BCE6D9] flex items-center justify-center text-[#1B7354] shadow-[0_8px_20px_rgba(208,239,229,0.5)] group-hover:scale-108 group-hover:shadow-[0_10px_25px_rgba(208,239,229,0.7)] group-active:scale-95 transition-all">
                <Plus size={22} strokeWidth={2.5} />
              </div>
              <span className="text-[11px] sm:text-xs font-bold text-[#242636] group-hover:text-[#1B7354] transition-colors text-center">
                Catat Masuk
              </span>
            </button>

            {/* 3. Transfer */}
            <button
              onClick={() => handleOpenFeature('transfer')}
              className="flex flex-col items-center justify-center gap-2 group cursor-pointer"
            >
              <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-[#D6E4FA] to-[#C9D8F5] flex items-center justify-center text-[#3E6FB0] shadow-[0_8px_20px_rgba(214,228,250,0.5)] group-hover:scale-108 group-hover:shadow-[0_10px_25px_rgba(214,228,250,0.7)] group-active:scale-95 transition-all">
                <Send size={20} />
              </div>
              <span className="text-[11px] sm:text-xs font-bold text-[#242636] group-hover:text-[#3E6FB0] transition-colors text-center">
                Transfer
              </span>
            </button>

            {/* 4. Isi Saldo (Top Up) */}
            <button
              onClick={() => handleOpenFeature('topup')}
              className="flex flex-col items-center justify-center gap-2 group cursor-pointer"
            >
              <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-[#8E9AF7] to-[#7C7CE6] flex items-center justify-center text-white shadow-[0_8px_20px_rgba(124,124,230,0.35)] group-hover:scale-108 group-hover:shadow-[0_10px_25px_rgba(124,124,230,0.45)] group-active:scale-95 transition-all">
                <CreditCard size={20} />
              </div>
              <span className="text-[11px] sm:text-xs font-bold text-[#242636] group-hover:text-[#7C7CE6] transition-colors text-center">
                Isi Saldo
              </span>
            </button>

            {/* 5. Bagi Gaji 50/30/20 */}
            <button
              onClick={() => handleOpenFeature('calc')}
              className="flex flex-col items-center justify-center gap-2 group cursor-pointer"
            >
              <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-[#EBE9FE] to-[#DFDCFD] flex items-center justify-center text-[#6B66DA] shadow-[0_8px_20px_rgba(235,233,254,0.6)] group-hover:scale-108 group-hover:shadow-[0_10px_25px_rgba(235,233,254,0.8)] group-active:scale-95 transition-all">
                <Calculator size={20} />
              </div>
              <span className="text-[11px] sm:text-xs font-bold text-[#242636] group-hover:text-[#6B66DA] transition-colors text-center">
                Bagi Gaji
              </span>
            </button>

            {/* 6. Cek Impian */}
            <button
              onClick={() => handleOpenFeature('goal_sim')}
              className="flex flex-col items-center justify-center gap-2 group cursor-pointer"
            >
              <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-[#D0EFE5] to-[#A8DFD0] flex items-center justify-center text-[#1B7354] shadow-[0_8px_20px_rgba(208,239,229,0.5)] group-hover:scale-108 group-hover:shadow-[0_10px_25px_rgba(208,239,229,0.7)] group-active:scale-95 transition-all">
                <Target size={20} />
              </div>
              <span className="text-[11px] sm:text-xs font-bold text-[#242636] group-hover:text-[#1B7354] transition-colors text-center">
                Cek Impian
              </span>
            </button>

            {/* 7. Atur Anggaran */}
            <button
              onClick={() => handleOpenFeature('budget_quick')}
              className="flex flex-col items-center justify-center gap-2 group cursor-pointer"
            >
              <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-[#E4E2FB] to-[#DDD9FA] flex items-center justify-center text-[#7C7CE6] shadow-[0_8px_20px_rgba(228,226,251,0.5)] group-hover:scale-108 group-hover:shadow-[0_10px_25px_rgba(228,226,251,0.7)] group-active:scale-95 transition-all">
                <Sliders size={20} />
              </div>
              <span className="text-[11px] sm:text-xs font-bold text-[#242636] group-hover:text-[#7C7CE6] transition-colors text-center">
                Atur Anggaran
              </span>
            </button>

            {/* 8. Tanya FinAI */}
            <button
              onClick={() => handleOpenFeature('quick_ai')}
              className="flex flex-col items-center justify-center gap-2 group cursor-pointer"
            >
              <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-[#FDF3C7] to-[#FCE790] flex items-center justify-center text-[#9A6B1F] shadow-[0_8px_20px_rgba(253,243,199,0.7)] group-hover:scale-108 group-hover:shadow-[0_10px_25px_rgba(253,243,199,0.9)] group-active:scale-95 transition-all">
                <Sparkles size={20} />
              </div>
              <span className="text-[11px] sm:text-xs font-bold text-[#242636] group-hover:text-[#9A6B1F] transition-colors text-center">
                Tanya FinAI
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. RINGKASAN FINANSIAL (KESEHATAN & TABUNGAN BULANAN)                     */}
      {/* ========================================================================= */}
      <section className="space-y-3 w-full">
        <span className="text-xs font-extrabold uppercase tracking-widest text-[#757A95] block">
          Ringkasan Finansial
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Skor Kesehatan Finansial */}
          <div className="p-6 rounded-3xl bg-white/85 backdrop-blur-md border border-white/90 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#757A95]">
                Kesehatan Finansial
              </span>
              <div className="w-8 h-8 rounded-xl bg-[#E4E2FB] flex items-center justify-center text-[#7C7CE6]">
                <ShieldCheck size={18} />
              </div>
            </div>

            <div>
              <div className="text-3xl font-extrabold text-[#242636] tracking-tight">
                82 <span className="text-base text-[#757A95] font-semibold">/ 100</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#1B7354] mt-1">
                <span className="w-2 h-2 rounded-full bg-[#1B7354]" />
                <span>Sangat Sehat</span>
              </div>
            </div>

            {/* Visual Bar Minimal */}
            <div className="w-full h-2 rounded-full bg-black/[0.04] overflow-hidden">
              <div className="w-[82%] h-full rounded-full bg-gradient-to-r from-[#7C7CE6] to-[#50B89C]" />
            </div>
          </div>

          {/* Tabungan Bulanan */}
          <div className="p-6 rounded-3xl bg-white/85 backdrop-blur-md border border-white/90 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#757A95]">
                Tabungan Bulanan
              </span>
              <div className="w-8 h-8 rounded-xl bg-[#D0EFE5] flex items-center justify-center text-[#1B7354]">
                <TrendingUp size={18} />
              </div>
            </div>

            <div>
              <div className="text-3xl font-extrabold text-[#7C7CE6] tracking-tight">
                34,2%
              </div>
              <span className="text-xs font-semibold text-[#757A95] block mt-1">
                Rp6.250.000 tersisihkan
              </span>
            </div>

            {/* Visual Bar Tabungan */}
            <div className="w-full h-2 rounded-full bg-black/[0.04] overflow-hidden">
              <div className="w-[34.2%] h-full rounded-full bg-[#7C7CE6]" />
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. TRANSAKSI TERAKHIR (3 ITEM) + PENGELUARAN & PEMASUKAN                  */}
      {/* ========================================================================= */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* PANEL KIRI (7 Kolom): TRANSAKSI TERAKHIR (3 Item) */}
        <div className="lg:col-span-7 p-6 sm:p-7 rounded-[28px] bg-white/80 backdrop-blur-md border border-white/90 shadow-[0_8px_30px_rgba(48,51,74,0.03)] space-y-5">
          <div className="flex items-center justify-between pb-1">
            <h3 className="text-lg font-bold text-[#242636] tracking-tight">
              Transaksi Terakhir
            </h3>
            <button className="text-[#757A95] hover:text-[#242636] p-1.5 rounded-xl hover:bg-black/[0.03] transition-colors cursor-pointer">
              <MoreVertical size={18} />
            </button>
          </div>

          {/* Tepat 3 Transaksi Teratas */}
          <div className="space-y-3.5">
            {transactions.slice(0, 3).map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between py-2 px-1 hover:bg-black/[0.015] rounded-2xl transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  {renderAvatar(tx)}
                  <div>
                    <h4 className="text-sm font-bold text-[#242636] group-hover:text-[#7C7CE6] transition-colors">
                      {tx.name}
                    </h4>
                    <span className="text-xs text-[#757A95]">{tx.date}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`text-sm sm:text-base font-extrabold tabular-nums ${
                      tx.type === 'income' ? 'text-[#1B7354]' : 'text-[#242636]'
                    }`}
                  >
                    {tx.type === 'income' ? '+' : '-'}{formatIDR(tx.amount)}
                  </span>
                  <button className="text-[#A0A4B8] hover:text-[#242636] p-1 rounded-lg transition-colors">
                    <MoreVertical size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-black/[0.04] text-center">
            <Link
              href="/app/transactions"
              className="text-xs font-bold text-[#7C7CE6] hover:text-[#6362D8] inline-flex items-center gap-1.5 group"
            >
              <span>Buka Seluruh Buku Kas</span>
              <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* PANEL KANAN (5 Kolom): PENGELUARAN & PEMASUKAN */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card Pengeluaran & Pemasukan (Expenses & Income) */}
          <div className="p-6 rounded-[28px] bg-white/80 backdrop-blur-md border border-white/90 shadow-[0_8px_30px_rgba(48,51,74,0.03)] space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#242636] tracking-tight">
                Pengeluaran & Pemasukan
              </h3>
              <button className="text-[#757A95] hover:text-[#242636] p-1 rounded-xl transition-colors cursor-pointer">
                <MoreVertical size={18} />
              </button>
            </div>

            {/* Statistik Persentase */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-3xl font-extrabold text-[#242636] tracking-tight">
                  60%
                </div>
                <span className="text-xs font-medium text-[#757A95] block mt-0.5">
                  Pengeluaran
                </span>
              </div>

              <div className="text-right sm:text-left">
                <div className="text-3xl font-extrabold text-[#242636] tracking-tight">
                  40%
                </div>
                <span className="text-xs font-medium text-[#757A95] block mt-0.5">
                  Pemasukan
                </span>
              </div>
            </div>

            {/* Segmented Dual Bar sesuai visual referensi */}
            <div className="flex items-center gap-2 pt-1">
              <div className="h-5 rounded-xl bg-[#7C7CE6] flex-1 shadow-xs transition-all" style={{ flex: '6' }} />
              <div className="h-5 rounded-xl bg-[#F0CE68] shadow-xs transition-all" style={{ flex: '4' }} />
            </div>

            <div className="pt-2 flex items-center justify-between text-xs text-[#757A95]">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#7C7CE6]" />
                Rp8.300.000 Keluar
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F0CE68]" />
                Rp12.500.000 Masuk
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. ARUS KEUANGAN GRAFIK (Keseimbangan Pemasukan vs Pengeluaran)            */}
      {/* ========================================================================= */}
      <IncomeExpenseChart
        variant="dashboard"
        title="Keseimbangan Pemasukan vs Pengeluaran"
        subtitle="Tren arus kas 6 bulan terakhir"
      />

      {/* ========================================================================= */}
      {/* 6. MODAL DINAMIS UNTUK 8 FITUR INTERAKTIF NYATA                            */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          activeFeature === 'expense'
            ? 'Catat Pengeluaran Baru'
            : activeFeature === 'income'
            ? 'Catat Pemasukan Baru'
            : activeFeature === 'transfer'
            ? 'Transfer Antar Rekening'
            : activeFeature === 'topup'
            ? 'Isi Saldo Dompet FinAI'
            : activeFeature === 'calc'
            ? 'Kalkulator Bagi Gaji 50/30/20'
            : activeFeature === 'goal_sim'
            ? 'Simulasi Target Impian'
            : activeFeature === 'budget_quick'
            ? 'Atur Pos Anggaran Bulanan'
            : 'Tanya FinAI — Asisten Keuangan'
        }
        subtitle={
          activeFeature === 'expense'
            ? 'Kurangi saldo dan catat detail belanja ke buku kas'
            : activeFeature === 'income'
            ? 'Tambah saldo dompet dari sumber gaji atau proyek'
            : activeFeature === 'transfer'
            ? 'Pindahkan dana antar rekening atau e-wallet'
            : activeFeature === 'topup'
            ? 'Tambah saldo aktif dompet digital secara langsung'
            : activeFeature === 'calc'
            ? 'Hitung alokasi ideal Kebutuhan, Keinginan & Tabungan'
            : activeFeature === 'goal_sim'
            ? 'Hitung setoran bulanan yang dibutuhkan untuk targetmu'
            : activeFeature === 'budget_quick'
            ? 'Evaluasi dan pantau sisa kuota belanja per kategori'
            : 'Tanya jawab instan mengenai kondisi uang dan tips hemat'
        }
      >
        {/* FITUR 1: CATAT PENGELUARAN */}
        {activeFeature === 'expense' && (
          <form onSubmit={handleSubmitExpense} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-[#757A95] block mb-1">
                Keterangan Belanja
              </label>
              <input
                type="text"
                required
                placeholder="misal: Makan Siang, GrabBike, Belanja Bulanan"
                value={txTitle}
                onChange={(e) => setTxTitle(e.target.value)}
                className="w-full px-4 py-2.5 bg-black/[0.02] border border-black/[0.06] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#7C7CE6]/50 focus:bg-white text-[#242636]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <CustomSelect
                label="Kategori"
                value={txCategory}
                onChange={setTxCategory}
                options={[
                  { value: 'Makanan & Minuman', label: 'Makanan & Minuman' },
                  { value: 'Transportasi', label: 'Transportasi' },
                  { value: 'Tagihan & Utilitas', label: 'Tagihan & Utilitas' },
                  { value: 'Belanja', label: 'Belanja' },
                  { value: 'Hiburan', label: 'Hiburan' },
                ]}
              />

              <CustomSelect
                label="Metode Bayar"
                value={txAccount}
                onChange={setTxAccount}
                options={[
                  { value: 'Dompet FinAI', label: 'Dompet FinAI' },
                  { value: 'BCA Prioritas', label: 'BCA Prioritas' },
                  { value: 'GoPay', label: 'GoPay' },
                  { value: 'Tunai', label: 'Tunai' },
                ]}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#757A95] block mb-1">
                Nominal (Rp)
              </label>
              <input
                type="number"
                required
                placeholder="25000"
                value={txAmount}
                onChange={(e) => setTxAmount(e.target.value)}
                className="w-full px-4 py-2.5 bg-black/[0.02] border border-black/[0.06] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#7C7CE6]/50 focus:bg-white text-[#242636]"
              />

              <div className="flex items-center gap-2 mt-2">
                {[10000, 25000, 50000, 100000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setTxAmount(amt.toString())}
                    className="px-2.5 py-1 rounded-lg bg-black/[0.03] hover:bg-[#E4E2FB]/50 text-[11px] font-semibold text-[#757A95] hover:text-[#7C7CE6] transition-colors cursor-pointer"
                  >
                    +{formatIDR(amt)}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 flex items-center justify-end gap-3 border-t border-black/[0.05]">
              <Button type="button" variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
                Batal
              </Button>
              <Button type="submit" variant="primary" size="md">
                Simpan Pengeluaran
              </Button>
            </div>
          </form>
        )}

        {/* FITUR 2: CATAT PEMASUKAN */}
        {activeFeature === 'income' && (
          <form onSubmit={handleSubmitIncome} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-[#757A95] block mb-1">
                Sumber Pemasukan
              </label>
              <input
                type="text"
                required
                placeholder="misal: Gaji Bulanan, Proyek UI/UX Freelance, Dividen"
                value={txTitle}
                onChange={(e) => setTxTitle(e.target.value)}
                className="w-full px-4 py-2.5 bg-black/[0.02] border border-black/[0.06] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#7C7CE6]/50 focus:bg-white text-[#242636]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#757A95] block mb-1">
                Nominal Pemasukan (Rp)
              </label>
              <input
                type="number"
                required
                placeholder="5000000"
                value={txAmount}
                onChange={(e) => setTxAmount(e.target.value)}
                className="w-full px-4 py-2.5 bg-black/[0.02] border border-black/[0.06] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#7C7CE6]/50 focus:bg-white text-[#242636]"
              />
            </div>

            <div className="pt-4 flex items-center justify-end gap-3 border-t border-black/[0.05]">
              <Button type="button" variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
                Batal
              </Button>
              <Button type="submit" variant="primary" size="md">
                Tambah Pemasukan
              </Button>
            </div>
          </form>
        )}

        {/* FITUR 3: TRANSFER */}
        {activeFeature === 'transfer' && (
          <form onSubmit={handleSubmitTransfer} className="space-y-4">
            {transferSuccess ? (
              <div className="p-6 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-[#D0EFE5] text-[#1B7354] flex items-center justify-center mx-auto">
                  <CheckCircle2 size={24} />
                </div>
                <h4 className="text-sm font-bold text-[#242636]">Transfer Berhasil!</h4>
                <p className="text-xs text-[#757A95]">Saldo telah dipotong secara lokal dari dompetmu.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <CustomSelect
                    label="Dari Rekening"
                    value={transferFrom}
                    onChange={setTransferFrom}
                    options={[
                      { value: 'Dompet FinAI', label: 'Dompet FinAI' },
                      { value: 'BCA Prioritas', label: 'BCA Prioritas' },
                      { value: 'GoPay', label: 'GoPay' },
                    ]}
                  />

                  <CustomSelect
                    label="Ke Rekening Tujuan"
                    value={transferTo}
                    onChange={setTransferTo}
                    options={[
                      { value: 'GoPay', label: 'GoPay' },
                      { value: 'OVO', label: 'OVO' },
                      { value: 'BCA Prioritas', label: 'BCA Prioritas' },
                      { value: 'Bibit Reksadana', label: 'Bibit Reksadana' },
                    ]}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#757A95] block mb-1">
                    Nominal Transfer (Rp)
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="100000"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    className="w-full px-4 py-2.5 bg-black/[0.02] border border-black/[0.06] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#7C7CE6]/50 focus:bg-white text-[#242636]"
                  />
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-black/[0.05]">
                  <Button type="button" variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
                    Batal
                  </Button>
                  <Button type="submit" variant="primary" size="md">
                    Kirim Dana
                  </Button>
                </div>
              </>
            )}
          </form>
        )}

        {/* FITUR 4: ISI SALDO (TOP UP) */}
        {activeFeature === 'topup' && (
          <form onSubmit={handleSubmitTopUp} className="space-y-4">
            {topUpSuccess ? (
              <div className="p-6 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-[#D0EFE5] text-[#1B7354] flex items-center justify-center mx-auto">
                  <CheckCircle2 size={24} />
                </div>
                <h4 className="text-sm font-bold text-[#242636]">Top Up Berhasil!</h4>
                <p className="text-xs text-[#757A95]">Saldo Dompet FinAI langsung bertambah secara real-time.</p>
              </div>
            ) : (
              <>
                <div>
                  <CustomSelect
                    label="Metode Pengisian"
                    value={topUpBank}
                    onChange={setTopUpBank}
                    options={[
                      { value: 'BCA Virtual Account', label: 'BCA Virtual Account' },
                      { value: 'Mandiri Livin', label: 'Mandiri Livin' },
                      { value: 'BRI Virtual Account', label: 'BRI Virtual Account' },
                      { value: 'Kartu Debit Online', label: 'Kartu Debit Online' },
                    ]}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#757A95] block mb-1">
                    Pilih / Masukkan Nominal Top Up (Rp)
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="250000"
                    value={topUpAmount}
                    onChange={(e) => setTopUpAmount(e.target.value)}
                    className="w-full px-4 py-2.5 bg-black/[0.02] border border-black/[0.06] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#7C7CE6]/50 focus:bg-white text-[#242636]"
                  />

                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {[100000, 250000, 500000, 1000000, 2000000, 5000000].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setTopUpAmount(val.toString())}
                        className={`py-1.5 px-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                          topUpAmount === val.toString()
                            ? 'bg-[#7C7CE6] text-white border-[#7C7CE6]'
                            : 'bg-black/[0.02] border-black/[0.05] text-[#757A95] hover:bg-black/[0.05]'
                        }`}
                      >
                        {formatIDR(val)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-black/[0.05]">
                  <Button type="button" variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
                    Batal
                  </Button>
                  <Button type="submit" variant="primary" size="md">
                    Isi Saldo Sekarang
                  </Button>
                </div>
              </>
            )}
          </form>
        )}

        {/* FITUR 5: KALKULATOR BAGI GAJI 50/30/20 */}
        {activeFeature === 'calc' && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-[#757A95] block mb-1">
                Gaji / Penghasilan Bulanan (Rp)
              </label>
              <input
                type="number"
                value={calcSalary}
                onChange={(e) => setCalcSalary(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-2.5 bg-black/[0.02] border border-black/[0.06] rounded-xl text-sm font-bold text-[#242636] focus:outline-none focus:ring-2 focus:ring-[#7C7CE6]/50"
              />
            </div>

            {/* Hasil Pembagian 50/30/20 */}
            <div className="space-y-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-[#E4E2FB]/40 border border-[#7C7CE6]/20 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[#7C7CE6] block">50% Kebutuhan Pokok</span>
                  <span className="text-[11px] text-[#757A95]">Makan, Tempat Tinggal, Transportasi, Tagihan</span>
                </div>
                <span className="text-sm font-extrabold text-[#242636]">
                  {formatIDR(calcSalary * 0.5)}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#FCE2E0]/40 border border-[#FCE2E0] flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[#B83A38] block">30% Keinginan & Gaya Hidup</span>
                  <span className="text-[11px] text-[#757A95]">Nongkrong, Belanja Hobi, Langganan Streaming</span>
                </div>
                <span className="text-sm font-extrabold text-[#242636]">
                  {formatIDR(calcSalary * 0.3)}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#D0EFE5]/50 border border-[#D0EFE5] flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[#1B7354] block">20% Tabungan & Investasi</span>
                  <span className="text-[11px] text-[#757A95]">Dana Darurat, Reksadana, Target Impian</span>
                </div>
                <span className="text-sm font-extrabold text-[#1B7354]">
                  {formatIDR(calcSalary * 0.2)}
                </span>
              </div>
            </div>

            <div className="pt-3 text-right">
              <Button variant="primary" size="md" onClick={() => setIsModalOpen(false)}>
                Selesai
              </Button>
            </div>
          </div>
        )}

        {/* FITUR 6: SIMULASI TARGET IMPIAN */}
        {activeFeature === 'goal_sim' && (
          <div className="space-y-4">
            {goalSaved ? (
              <div className="p-6 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-[#D0EFE5] text-[#1B7354] flex items-center justify-center mx-auto">
                  <CheckCircle2 size={24} />
                </div>
                <h4 className="text-sm font-bold text-[#242636]">Simulasi Target Disimpan!</h4>
                <p className="text-xs text-[#757A95]">Rekomendasi setoran bulanan berhasil dihitung.</p>
              </div>
            ) : (
              <>
                <div>
                  <label className="text-xs font-semibold text-[#757A95] block mb-1">
                    Nama Barang / Rencana Impian
                  </label>
                  <input
                    type="text"
                    value={goalName}
                    onChange={(e) => setGoalName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-black/[0.02] border border-black/[0.06] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#7C7CE6]/50 text-[#242636]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-[#757A95] block mb-1">
                      Target Dana (Rp)
                    </label>
                    <input
                      type="number"
                      value={goalTarget}
                      onChange={(e) => setGoalTarget(e.target.value)}
                      className="w-full px-4 py-2.5 bg-black/[0.02] border border-black/[0.06] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#7C7CE6]/50 text-[#242636]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#757A95] block mb-1">
                      Durasi (Bulan)
                    </label>
                    <input
                      type="number"
                      value={goalMonths}
                      onChange={(e) => setGoalMonths(e.target.value)}
                      className="w-full px-4 py-2.5 bg-black/[0.02] border border-black/[0.06] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#7C7CE6]/50 text-[#242636]"
                    />
                  </div>
                </div>

                {/* Hasil Kalkulasi Otomatis */}
                <div className="p-4 rounded-2xl bg-[#D0EFE5]/40 border border-[#D0EFE5] space-y-1">
                  <span className="text-xs text-[#757A95] block">Wajib Menabung per Bulan:</span>
                  <div className="text-2xl font-extrabold text-[#1B7354]">
                    {formatIDR(
                      Math.round(
                        (parseFloat(goalTarget) || 0) / (parseFloat(goalMonths) || 1)
                      )
                    )}{' '}
                    <span className="text-xs font-semibold text-[#757A95]">/ bulan</span>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-black/[0.05]">
                  <Button type="button" variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
                    Tutup
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    size="md"
                    onClick={() => {
                      setGoalSaved(true);
                      setTimeout(() => {
                        setIsModalOpen(false);
                        setGoalSaved(false);
                      }, 1200);
                    }}
                  >
                    Simpan Simulasi
                  </Button>
                </div>
              </>
            )}
          </div>
        )}

        {/* FITUR 7: ATUR POS ANGGARAN (QUICK BUDGET CHECKER) */}
        {activeFeature === 'budget_quick' && (
          <div className="space-y-4">
            <div className="space-y-3">
              {budgetsList.slice(0, 3).map((b) => {
                const pct = Math.round((b.spent / b.limit) * 100);
                return (
                  <div key={b.id} className="p-3.5 rounded-2xl bg-black/[0.02] border border-black/[0.05] space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-[#242636]">
                      <span>{b.name}</span>
                      <span className={pct > 80 ? 'text-[#B83A38]' : 'text-[#7C7CE6]'}>{pct}% Terpakai</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-black/[0.05] overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, backgroundColor: pct > 80 ? '#B83A38' : b.color }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-[#757A95]">
                      <span>{formatIDR(b.spent)}</span>
                      <span>Batas {formatIDR(b.limit)}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 flex items-center justify-between border-t border-black/[0.05]">
              <Link href="/app/budgets" onClick={() => setIsModalOpen(false)} className="text-xs font-bold text-[#7C7CE6] hover:underline">
                Buka Halaman Anggaran Penuh →
              </Link>
              <Button variant="primary" size="sm" onClick={() => setIsModalOpen(false)}>
                Selesai
              </Button>
            </div>
          </div>
        )}

        {/* FITUR 8: TANYA FINAI CEPAT */}
        {activeFeature === 'quick_ai' && (
          <div className="space-y-4">
            {/* Riwayat dialog mini */}
            <div className="h-56 overflow-y-auto space-y-3 p-3 bg-black/[0.02] rounded-2xl border border-black/[0.05] text-xs">
              {aiResponses.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-[#7C7CE6] text-white rounded-br-none'
                        : 'bg-white text-[#242636] shadow-xs border border-black/[0.04] rounded-bl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Rekomendasi Pertanyaan Cepat */}
            <div className="flex flex-wrap gap-1.5">
              {[
                'Berapa sisa uangku?',
                'Pengeluaran apa paling boros?',
                'Tips hemat minggu ini',
              ].map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => handleAskAI(chip)}
                  className="px-2.5 py-1 rounded-lg bg-[#E4E2FB]/50 hover:bg-[#E4E2FB] text-[11px] font-semibold text-[#7C7CE6] transition-colors cursor-pointer"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Input kirim prompt */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                placeholder="Ketik pertanyaan keuanganmu..."
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAskAI();
                }}
                className="flex-1 px-4 py-2.5 bg-black/[0.02] border border-black/[0.06] rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#7C7CE6]/50"
              />
              <Button
                type="button"
                variant="primary"
                size="sm"
                icon={<Send size={14} />}
                onClick={() => handleAskAI()}
              >
                Kirim
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  </PageTransition>
  );
}
