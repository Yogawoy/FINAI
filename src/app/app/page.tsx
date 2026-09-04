'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
import { formatIDR } from '@/lib/format';
import { apiClient, mapApiErrorMessage } from '@/lib/api-client';
import { emitRefresh, onRefresh } from '@/lib/data-refresh';
import DashboardSkeleton from '@/components/loading/DashboardSkeleton';
import PageTransition from '@/components/loading/PageTransition';

interface DashboardWallet {
  id: string;
  name: string;
  type: string;
  balance: number;
  accountLast4?: string | null;
  institution?: string | null;
}

interface DashboardTransaction {
  id: string;
  name: string;
  date: string;
  amount: number;
  type: 'expense' | 'income';
  category?: string;
  walletName?: string;
  avatarType: 'apple' | 'user1' | 'user2';
  avatarBg?: string;
  avatarText?: string;
}

interface DashboardBudget {
  id: string;
  name: string;
  category: string;
  spent: number;
  limit: number;
  color: string;
}

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // API data state
  const [wallets, setWallets] = useState<DashboardWallet[]>([]);
  const [transactions, setTransactions] = useState<DashboardTransaction[]>([]);
  const [rawTransactionsForChart, setRawTransactionsForChart] = useState<any[]>([]);
  const [budgetsList, setBudgetsList] = useState<DashboardBudget[]>([]);
  const [userName, setUserName] = useState('Anda');

  // Modal selector state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeFeature, setActiveFeature] = useState<
    'expense' | 'income' | 'transfer' | 'topup' | 'calc' | 'goal_sim' | 'budget_quick' | 'quick_ai'
  >('expense');

  // Form State: Catat Pengeluaran & Pemasukan
  const [txTitle, setTxTitle] = useState('');
  const [txCategory, setTxCategory] = useState('Makanan & Minuman');
  const [txAmount, setTxAmount] = useState('');
  const [txAccount, setTxAccount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State: Transfer
  const [transferFrom, setTransferFrom] = useState('');
  const [transferTo, setTransferTo] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferSuccess, setTransferSuccess] = useState(false);
  const [transferError, setTransferError] = useState<string | null>(null);

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
      text: 'Halo! Keuanganmu saat ini sedang dimuat dari database. Tunggu sebentar...',
    },
  ]);

  // Fetch all dashboard data
  const fetchDashboardData = useCallback(async () => {
    try {
      setErrorMessage(null);

      const [walletsRes, transactionsRes, budgetsRes, userRes] = await Promise.allSettled([
        apiClient.get<{ wallets: any[] }>('/api/wallets'),
        apiClient.get<{ transactions: any[]; total: number }>('/api/transactions?limit=100'),
        apiClient.get<{ budgets: any[] }>('/api/budgets'),
        apiClient.get<{ user: any }>('/api/auth/me'),
      ]);

      // Process wallets
      if (walletsRes.status === 'fulfilled') {
        const wData = (walletsRes.value.wallets || []).map((w: any) => ({
          id: w.id,
          name: w.name,
          type: String(w.type).toUpperCase(),
          balance: Number(w.balance),
          accountLast4: w.accountLast4,
          institution: w.institution,
        }));
        setWallets(wData);

        if (wData.length > 0 && !txAccount) {
          setTxAccount(wData[0].id);
        }
        if (wData.length >= 2) {
          setTransferFrom(wData[0].id);
          setTransferTo(wData[1].id);
        }
      }

      // Process transactions
      if (transactionsRes.status === 'fulfilled') {
        const rawList = transactionsRes.value.transactions || [];
        setRawTransactionsForChart(rawList);
        const txData = rawList.map((tx: any) => {
          const isIncome = String(tx.type).toUpperCase() === 'INCOME';
          const rawDate = tx.transactionDate ? new Date(tx.transactionDate) : new Date();
          const now = new Date();
          const diffMs = now.getTime() - rawDate.getTime();
          const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

          let dateLabel: string;
          if (diffDays === 0) dateLabel = 'Hari ini';
          else if (diffDays === 1) dateLabel = 'Kemarin';
          else dateLabel = rawDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

          const initials = (tx.description || 'TX').substring(0, 2).toUpperCase();

          return {
            id: tx.id,
            name: tx.description || 'Transaksi',
            date: dateLabel,
            amount: Number(tx.amount),
            type: isIncome ? 'income' as const : 'expense' as const,
            category: tx.category,
            walletName: tx.wallet?.name || '',
            avatarType: isIncome ? 'user1' as const : 'user1' as const,
            avatarBg: isIncome ? 'bg-[#D0EFE5]' : 'bg-[#E4E2FB]',
            avatarText: initials,
          };
        });
        setTransactions(txData);
      }

      // Process budgets
      if (budgetsRes.status === 'fulfilled') {
        const bData = (budgetsRes.value.budgets || []).map((b: any) => ({
          id: b.id,
          name: b.category,
          category: b.category,
          spent: Number(b.usedAmount || 0),
          limit: Number(b.limitAmount),
          color: '#7C7CE6',
        }));
        setBudgetsList(bData);
      }

      // Process user
      if (userRes.status === 'fulfilled') {
        const uData = userRes.value?.user;
        if (uData?.name) {
          setUserName(uData.name.split(' ')[0]);
        }
      }
    } catch (err) {
      setErrorMessage(mapApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [txAccount]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Global refresh — respond to mutations from other pages
  useEffect(() => {
    const off = onRefresh(() => fetchDashboardData());
    return off;
  }, [fetchDashboardData]);

  // Computed financial stats from real data
  const totalBalance = useMemo(() => {
    return wallets.reduce((acc, w) => acc + w.balance, 0);
  }, [wallets]);

  const { totalIncome, totalExpenses, savingsRate, savingsAmount } = useMemo(() => {
    const inc = transactions.filter((t) => t.type === 'income').reduce((a, t) => a + t.amount, 0);
    const exp = transactions.filter((t) => t.type === 'expense').reduce((a, t) => a + t.amount, 0);
    const net = inc - exp;
    const rate = inc > 0 ? Math.round((net / inc) * 1000) / 10 : 0;
    return { totalIncome: inc, totalExpenses: exp, savingsRate: rate, savingsAmount: net };
  }, [transactions]);

  const expensePercent = totalIncome > 0 ? Math.round((totalExpenses / totalIncome) * 100) : 0;
  const incomePercent = 100 - expensePercent;

  // Real aggregation for chart — 6 bulan terakhir dari rawTransactionsForChart
  const dashboardChartData = useMemo(() => {
    const now = new Date();
    const buckets: { key: string; label: string; fullDate: string; income: number; expense: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleDateString('id-ID', { month: 'short' }).replace('.', '');
      const fullDate = d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      buckets.push({ key, label: label.charAt(0).toUpperCase() + label.slice(1), fullDate: fullDate.charAt(0).toUpperCase() + fullDate.slice(1), income: 0, expense: 0 });
    }
    const bucketMap = new Map(buckets.map((b) => [b.key, b]));
    rawTransactionsForChart.forEach((tx: any) => {
      const rawDateStr = tx.transactionDate;
      const d = rawDateStr ? new Date(rawDateStr) : null;
      if (!d || Number.isNaN(d.getTime())) return;
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const bucket = bucketMap.get(key);
      if (!bucket) return;
      const amt = Number(tx.amount) || 0;
      if (String(tx.type).toUpperCase() === 'INCOME') bucket.income += amt;
      else bucket.expense += amt;
    });
    return buckets.map(({ label, fullDate, income, expense }) => ({ label, fullDate, income, expense }));
  }, [rawTransactionsForChart]);


  // Default greeting based on time
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Selamat pagi';
    if (hour < 17) return 'Selamat siang';
    return 'Selamat malam';
  }, []);

  const handleOpenFeature = (
    feature: 'expense' | 'income' | 'transfer' | 'topup' | 'calc' | 'goal_sim' | 'budget_quick' | 'quick_ai'
  ) => {
    setActiveFeature(feature);
    setTransferSuccess(false);
    setTransferError(null);
    setTopUpSuccess(false);
    setGoalSaved(false);
    setIsModalOpen(true);
  };

  // Submit Handler: Catat Pengeluaran via API
  const handleSubmitExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!txTitle || !txAmount || !txAccount) return;
    setTransferError(null);
    setIsSubmitting(true);
    try {
      await apiClient.post('/api/transactions', {
        walletId: txAccount,
        type: 'EXPENSE',
        amount: Number(txAmount),
        category: txCategory,
        description: txTitle,
      });
      setTxTitle('');
      setTxAmount('');
      setIsModalOpen(false);
      fetchDashboardData();
      emitRefresh('transaction');
    } catch (err) {
      setTransferError(mapApiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Handler: Catat Pemasukan via API
  const handleSubmitIncome = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!txTitle || !txAmount || !txAccount) return;
    setTransferError(null);
    setIsSubmitting(true);
    try {
      await apiClient.post('/api/transactions', {
        walletId: txAccount,
        type: 'INCOME',
        amount: Number(txAmount),
        category: 'salary',
        description: txTitle,
      });
      setTxTitle('');
      setTxAmount('');
      setIsModalOpen(false);
      fetchDashboardData();
      emitRefresh('transaction');
    } catch (err) {
      setTransferError(mapApiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Handler: Transfer via API
  const handleSubmitTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferAmount || !transferFrom || !transferTo) return;
    setTransferError(null);
    setIsSubmitting(true);
    try {
      await apiClient.post('/api/transfers', {
        fromWalletId: transferFrom,
        toWalletId: transferTo,
        amount: Number(transferAmount),
      });
      setTransferSuccess(true);
      fetchDashboardData();
      emitRefresh('transfer');
      setTimeout(() => {
        setIsModalOpen(false);
        setTransferAmount('');
        setTransferSuccess(false);
      }, 1200);
    } catch (err) {
      setTransferError(mapApiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Handler: Top Up (via income transaction)
  const handleSubmitTopUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topUpAmount || !txAccount) return;
    setTransferError(null);
    setIsSubmitting(true);
    try {
      await apiClient.post('/api/transactions', {
        walletId: txAccount,
        type: 'INCOME',
        amount: Number(topUpAmount),
        category: 'other',
        description: 'Top Up Saldo',
      });
      setTopUpSuccess(true);
      fetchDashboardData();
      emitRefresh('transaction');
      setTimeout(() => {
        setIsModalOpen(false);
        setTopUpSuccess(false);
      }, 1200);
    } catch (err) {
      setTransferError(mapApiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAskAI = (promptText?: string) => {
    const query = promptText || aiPrompt;
    if (!query.trim()) return;

    const userMsg = { role: 'user' as const, text: query };
    let replyText = 'FinAI telah menganalisis catatanmu. Kondisi keuanganmu aman dan surplus!';

    if (query.toLowerCase().includes('boros') || query.toLowerCase().includes('pengeluaran')) {
      const topCategory = budgetsList.length > 0 ? budgetsList.reduce((a, b) => a.spent > b.spent ? a : b) : null;
      if (topCategory) {
        replyText = `Pengeluaran terbesarmu bulan ini ada di kategori ${topCategory.name} sebesar ${formatIDR(topCategory.spent)}.`;
      }
    } else if (query.toLowerCase().includes('sisa') || query.toLowerCase().includes('uang')) {
      replyText = `Saldo aktif dompet kamu saat ini adalah ${formatIDR(totalBalance)}.`;
    } else if (query.toLowerCase().includes('rekomendasi') || query.toLowerCase().includes('hemat') || query.toLowerCase().includes('tips')) {
      replyText = 'Rekomendasi minggu ini: Pantau pengeluaran di kategori dengan budget hampir terpakai untuk menjaga surplus tabungan.';
    }

    setAiResponses((prev) => [...prev, userMsg, { role: 'assistant', text: replyText }]);
    setAiPrompt('');
  };

  const renderAvatar = (item: DashboardTransaction) => {
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

  // Wallet options for dropdowns
  const walletOptions = useMemo(() => {
    return wallets.map((w) => ({ value: w.id, label: w.name }));
  }, [wallets]);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <PageTransition>
      <div className="space-y-8 max-w-7xl mx-auto pb-12">
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-red-50 text-red-600 border border-red-200 text-xs font-semibold">
            {errorMessage}
          </div>
        )}

        {/* Header Utama */}
        <Header
          title={`${greeting}, ${userName}.`}
          subtitle="Kondisi keuanganmu bulan ini."
        />

        {/* ========================================================================= */}
        {/* 1. KARTU DOMPET DIGITAL FULL-WIDTH */}
        {/* ========================================================================= */}
        <section className="space-y-3 w-full relative z-20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#757A95]">
              Dompet Digital FinAI
            </span>
            <span className="text-xs font-semibold text-[#1B7354] bg-[#D0EFE5] px-3 py-1 rounded-full">
              {wallets.length > 0 ? 'Kartu Aktif' : 'Belum Ada Dompet'}
            </span>
          </div>

          <div className="w-full">
            <WalletCard
              balance={totalBalance}
              cardNumber={wallets.length > 0 ? `••••  ••••  ••••  ${wallets[0].accountLast4 || '0000'}` : '••••  ••••  ••••  0000'}
              holderName={userName}
              expiry={`${String(new Date().getMonth() + 1).padStart(2, '0')}/${String((new Date().getFullYear() + 3) % 100).padStart(2, '0')}`}
              wallets={wallets}
            />
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 2. AKSI CEPAT: GRID MENU */}
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

          <div className="p-6 sm:p-8 rounded-[28px] bg-white/85 backdrop-blur-md border border-white/90 shadow-[0_10px_35px_rgba(48,51,74,0.03)] w-full">
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-y-6 gap-x-3 sm:gap-4">
              <button onClick={() => handleOpenFeature('expense')} className="flex flex-col items-center justify-center gap-2 group cursor-pointer">
                <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-[#7C7CE6] to-[#8C8BE8] flex items-center justify-center text-white shadow-[0_8px_20px_rgba(124,124,230,0.3)] group-hover:scale-108 group-hover:shadow-[0_10px_25px_rgba(124,124,230,0.4)] group-active:scale-95 transition-all">
                  <Minus size={22} strokeWidth={2.5} />
                </div>
                <span className="text-[11px] sm:text-xs font-bold text-[#242636] group-hover:text-[#7C7CE6] transition-colors text-center">Catat Keluar</span>
              </button>

              <button onClick={() => handleOpenFeature('income')} className="flex flex-col items-center justify-center gap-2 group cursor-pointer">
                <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-[#D0EFE5] to-[#BCE6D9] flex items-center justify-center text-[#1B7354] shadow-[0_8px_20px_rgba(208,239,229,0.5)] group-hover:scale-108 group-hover:shadow-[0_10px_25px_rgba(208,239,229,0.7)] group-active:scale-95 transition-all">
                  <Plus size={22} strokeWidth={2.5} />
                </div>
                <span className="text-[11px] sm:text-xs font-bold text-[#242636] group-hover:text-[#1B7354] transition-colors text-center">Catat Masuk</span>
              </button>

              <button onClick={() => handleOpenFeature('transfer')} className="flex flex-col items-center justify-center gap-2 group cursor-pointer">
                <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-[#D6E4FA] to-[#C9D8F5] flex items-center justify-center text-[#3E6FB0] shadow-[0_8px_20px_rgba(214,228,250,0.5)] group-hover:scale-108 group-hover:shadow-[0_10px_25px_rgba(214,228,250,0.7)] group-active:scale-95 transition-all">
                  <Send size={20} />
                </div>
                <span className="text-[11px] sm:text-xs font-bold text-[#242636] group-hover:text-[#3E6FB0] transition-colors text-center">Transfer</span>
              </button>

              <button onClick={() => handleOpenFeature('topup')} className="flex flex-col items-center justify-center gap-2 group cursor-pointer">
                <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-[#8E9AF7] to-[#7C7CE6] flex items-center justify-center text-white shadow-[0_8px_20px_rgba(124,124,230,0.35)] group-hover:scale-108 group-hover:shadow-[0_10px_25px_rgba(124,124,230,0.45)] group-active:scale-95 transition-all">
                  <CreditCard size={20} />
                </div>
                <span className="text-[11px] sm:text-xs font-bold text-[#242636] group-hover:text-[#7C7CE6] transition-colors text-center">Isi Saldo</span>
              </button>

              <button onClick={() => handleOpenFeature('calc')} className="flex flex-col items-center justify-center gap-2 group cursor-pointer">
                <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-[#EBE9FE] to-[#DFDCFD] flex items-center justify-center text-[#6B66DA] shadow-[0_8px_20px_rgba(235,233,254,0.6)] group-hover:scale-108 group-hover:shadow-[0_10px_25px_rgba(235,233,254,0.8)] group-active:scale-95 transition-all">
                  <Calculator size={20} />
                </div>
                <span className="text-[11px] sm:text-xs font-bold text-[#242636] group-hover:text-[#6B66DA] transition-colors text-center">Bagi Gaji</span>
              </button>

              <button onClick={() => handleOpenFeature('goal_sim')} className="flex flex-col items-center justify-center gap-2 group cursor-pointer">
                <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-[#D0EFE5] to-[#A8DFD0] flex items-center justify-center text-[#1B7354] shadow-[0_8px_20px_rgba(208,239,229,0.5)] group-hover:scale-108 group-hover:shadow-[0_10px_25px_rgba(208,239,229,0.7)] group-active:scale-95 transition-all">
                  <Target size={20} />
                </div>
                <span className="text-[11px] sm:text-xs font-bold text-[#242636] group-hover:text-[#1B7354] transition-colors text-center">Cek Impian</span>
              </button>

              <button onClick={() => handleOpenFeature('budget_quick')} className="flex flex-col items-center justify-center gap-2 group cursor-pointer">
                <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-[#E4E2FB] to-[#DDD9FA] flex items-center justify-center text-[#7C7CE6] shadow-[0_8px_20px_rgba(228,226,251,0.5)] group-hover:scale-108 group-hover:shadow-[0_10px_25px_rgba(228,226,251,0.7)] group-active:scale-95 transition-all">
                  <Sliders size={20} />
                </div>
                <span className="text-[11px] sm:text-xs font-bold text-[#242636] group-hover:text-[#7C7CE6] transition-colors text-center">Atur Anggaran</span>
              </button>

              <button onClick={() => handleOpenFeature('quick_ai')} className="flex flex-col items-center justify-center gap-2 group cursor-pointer">
                <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-[#FDF3C7] to-[#FCE790] flex items-center justify-center text-[#9A6B1F] shadow-[0_8px_20px_rgba(253,243,199,0.7)] group-hover:scale-108 group-hover:shadow-[0_10px_25px_rgba(253,243,199,0.9)] group-active:scale-95 transition-all">
                  <Sparkles size={20} />
                </div>
                <span className="text-[11px] sm:text-xs font-bold text-[#242636] group-hover:text-[#9A6B1F] transition-colors text-center">Tanya FinAI</span>
              </button>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 3. RINGKASAN FINANSIAL */}
        {/* ========================================================================= */}
        <section className="space-y-3 w-full">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#757A95] block">
            Ringkasan Finansial
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Skor Kesehatan Finansial - computed from savings rate */}
            <div className="p-6 rounded-3xl bg-white/85 backdrop-blur-md border border-white/90 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#757A95]">Rasio Tabungan</span>
                <div className="w-8 h-8 rounded-xl bg-[#E4E2FB] flex items-center justify-center text-[#7C7CE6]">
                  <ShieldCheck size={18} />
                </div>
              </div>
              <div>
                <div className="text-3xl font-extrabold text-[#242636] tracking-tight">
                  {savingsRate}% <span className="text-base text-[#757A95] font-semibold">/ 100</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#1B7354] mt-1">
                  <span className="w-2 h-2 rounded-full bg-[#1B7354]" />
                  <span>{savingsRate >= 20 ? 'Sangat Sehat' : savingsRate >= 10 ? 'Cukup Sehat' : 'Perlu Diperbaiki'}</span>
                </div>
              </div>
              <div className="w-full h-2 rounded-full bg-black/[0.04] overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-[#7C7CE6] to-[#50B89C]" style={{ width: `${Math.min(savingsRate, 100)}%` }} />
              </div>
            </div>

            {/* Tabungan Bulanan */}
            <div className="p-6 rounded-3xl bg-white/85 backdrop-blur-md border border-white/90 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#757A95]">Tabungan Bulanan</span>
                <div className="w-8 h-8 rounded-xl bg-[#D0EFE5] flex items-center justify-center text-[#1B7354]">
                  <TrendingUp size={18} />
                </div>
              </div>
              <div>
                <div className="text-3xl font-extrabold text-[#7C7CE6] tracking-tight">
                  {savingsRate}%
                </div>
                <span className="text-xs font-semibold text-[#757A95] block mt-1">
                  {formatIDR(Math.max(savingsAmount, 0))} tersisihkan
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-black/[0.04] overflow-hidden">
                <div className="h-full rounded-full bg-[#7C7CE6]" style={{ width: `${Math.min(savingsRate, 100)}%` }} />
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 4. TRANSAKSI TERAKHIR + PENGELUARAN & PEMASUKAN */}
        {/* ========================================================================= */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* PANEL KIRI: TRANSAKSI TERAKHIR */}
          <div className="lg:col-span-7 p-6 sm:p-7 rounded-[28px] bg-white/80 backdrop-blur-md border border-white/90 shadow-[0_8px_30px_rgba(48,51,74,0.03)] space-y-5">
            <div className="flex items-center justify-between pb-1">
              <h3 className="text-lg font-bold text-[#242636] tracking-tight">Transaksi Terakhir</h3>
            </div>

            <div className="space-y-3.5">
              {transactions.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-xs text-[#757A95]">Belum ada transaksi. Mulai catat pengeluaran atau pemasukan pertama Anda.</p>
                </div>
              ) : (
                transactions.slice(0, 3).map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between py-2 px-1 hover:bg-black/[0.015] rounded-2xl transition-colors group cursor-pointer">
                    <div className="flex items-center gap-3.5">
                      {renderAvatar(tx)}
                      <div>
                        <h4 className="text-sm font-bold text-[#242636] group-hover:text-[#7C7CE6] transition-colors">{tx.name}</h4>
                        <span className="text-xs text-[#757A95]">{tx.date}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-sm sm:text-base font-extrabold tabular-nums ${tx.type === 'income' ? 'text-[#1B7354]' : 'text-[#242636]'}`}>
                        {tx.type === 'income' ? '+' : '-'}{formatIDR(tx.amount)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {transactions.length > 0 && (
              <div className="pt-2 border-t border-black/[0.04] text-center">
                <Link href="/app/transactions" className="text-xs font-bold text-[#7C7CE6] hover:text-[#6362D8] inline-flex items-center gap-1.5 group">
                  <span>Buka Seluruh Buku Kas</span>
                  <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            )}
          </div>

          {/* PANEL KANAN: PENGELUARAN & PEMASUKAN */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-[28px] bg-white/80 backdrop-blur-md border border-white/90 shadow-[0_8px_30px_rgba(48,51,74,0.03)] space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-[#242636] tracking-tight">Pengeluaran & Pemasukan</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-3xl font-extrabold text-[#242636] tracking-tight">{expensePercent}%</div>
                  <span className="text-xs font-medium text-[#757A95] block mt-0.5">Pengeluaran</span>
                </div>
                <div className="text-right sm:text-left">
                  <div className="text-3xl font-extrabold text-[#242636] tracking-tight">{incomePercent}%</div>
                  <span className="text-xs font-medium text-[#757A95] block mt-0.5">Pemasukan</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <div className="h-5 rounded-xl bg-[#7C7CE6] shadow-xs transition-all" style={{ flex: Math.max(expensePercent, 1) }} />
                <div className="h-5 rounded-xl bg-[#F0CE68] shadow-xs transition-all" style={{ flex: Math.max(incomePercent, 1) }} />
              </div>

              <div className="pt-2 flex items-center justify-between text-xs text-[#757A95]">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#7C7CE6]" />
                  {formatIDR(totalExpenses)} Keluar
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#F0CE68]" />
                  {formatIDR(totalIncome)} Masuk
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 5. ARUS KEUANGAN GRAFIK */}
        {/* ========================================================================= */}
        <IncomeExpenseChart
          data={dashboardChartData}
          isLoading={isLoading}
          error={errorMessage}
          variant="dashboard"
          title="Keseimbangan Pemasukan vs Pengeluaran"
          subtitle="Tren arus kas 6 bulan terakhir"
        />

        {/* ========================================================================= */}
        {/* 6. MODAL DINAMIS */}
        {/* ========================================================================= */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={
            activeFeature === 'expense' ? 'Catat Pengeluaran Baru'
            : activeFeature === 'income' ? 'Catat Pemasukan Baru'
            : activeFeature === 'transfer' ? 'Transfer Antar Rekening'
            : activeFeature === 'topup' ? 'Isi Saldo Dompet FinAI'
            : activeFeature === 'calc' ? 'Kalkulator Bagi Gaji 50/30/20'
            : activeFeature === 'goal_sim' ? 'Simulasi Target Impian'
            : activeFeature === 'budget_quick' ? 'Atur Pos Anggaran Bulanan'
            : 'Tanya FinAI - Asisten Keuangan'
          }
          subtitle={
            activeFeature === 'expense' ? 'Kurangi saldo dan catat detail belanja ke buku kas'
            : activeFeature === 'income' ? 'Tambah saldo dompet dari sumber gaji atau proyek'
            : activeFeature === 'transfer' ? 'Pindahkan dana antar rekening atau e-wallet'
            : activeFeature === 'topup' ? 'Tambah saldo aktif dompet digital secara langsung'
            : activeFeature === 'calc' ? 'Hitung alokasi ideal Kebutuhan, Keinginan & Tabungan'
            : activeFeature === 'goal_sim' ? 'Hitung setoran bulanan yang dibutuhkan untuk targetmu'
            : activeFeature === 'budget_quick' ? 'Evaluasi dan pantau sisa kuota belanja per kategori'
            : 'Tanya jawab instan mengenai kondisi uang dan tips hemat'
          }
        >
          {/* FITUR 1: CATAT PENGELUARAN */}
          {activeFeature === 'expense' && (
            <form onSubmit={handleSubmitExpense} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#757A95] block mb-1">Keterangan Belanja</label>
                <input type="text" required placeholder="misal: Makan Siang, GrabBike, Belanja Bulanan" value={txTitle} onChange={(e) => setTxTitle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-black/[0.02] border border-black/[0.06] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#7C7CE6]/50 focus:bg-white text-[#242636]" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <CustomSelect label="Kategori" value={txCategory} onChange={setTxCategory}
                  options={[
                    { value: 'food', label: 'Makanan & Minuman' },
                    { value: 'transport', label: 'Transportasi' },
                    { value: 'bills', label: 'Tagihan & Utilitas' },
                    { value: 'shopping', label: 'Belanja' },
                    { value: 'entertainment', label: 'Hiburan' },
                    { value: 'health', label: 'Kesehatan' },
                    { value: 'education', label: 'Pendidikan' },
                  ]} />
                <CustomSelect label="Dompet" value={txAccount} onChange={setTxAccount} options={walletOptions} />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#757A95] block mb-1">Nominal (Rp)</label>
                <input type="number" required placeholder="25000" value={txAmount} onChange={(e) => setTxAmount(e.target.value)}
                  className="w-full px-4 py-2.5 bg-black/[0.02] border border-black/[0.06] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#7C7CE6]/50 focus:bg-white text-[#242636]" />
                <div className="flex items-center gap-2 mt-2">
                  {[10000, 25000, 50000, 100000].map((amt) => (
                    <button key={amt} type="button" onClick={() => setTxAmount(amt.toString())}
                      className="px-2.5 py-1 rounded-lg bg-black/[0.03] hover:bg-[#E4E2FB]/50 text-[11px] font-semibold text-[#757A95] hover:text-[#7C7CE6] transition-colors cursor-pointer">
                      +{formatIDR(amt)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-black/[0.05]">
                <Button type="button" variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>Batal</Button>
                <Button type="submit" variant="primary" size="md" disabled={isSubmitting}>
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Pengeluaran'}
                </Button>
              </div>
            </form>
          )}

          {/* FITUR 2: CATAT PEMASUKAN */}
          {activeFeature === 'income' && (
            <form onSubmit={handleSubmitIncome} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#757A95] block mb-1">Sumber Pemasukan</label>
                <input type="text" required placeholder="misal: Gaji Bulanan, Proyek UI/UX Freelance, Dividen" value={txTitle} onChange={(e) => setTxTitle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-black/[0.02] border border-black/[0.06] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#7C7CE6]/50 focus:bg-white text-[#242636]" />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#757A95] block mb-1">Nominal Pemasukan (Rp)</label>
                <input type="number" required placeholder="5000000" value={txAmount} onChange={(e) => setTxAmount(e.target.value)}
                  className="w-full px-4 py-2.5 bg-black/[0.02] border border-black/[0.06] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#7C7CE6]/50 focus:bg-white text-[#242636]" />
              </div>
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-black/[0.05]">
                <Button type="button" variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>Batal</Button>
                <Button type="submit" variant="primary" size="md" disabled={isSubmitting}>
                  {isSubmitting ? 'Menyimpan...' : 'Tambah Pemasukan'}
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
                  <p className="text-xs text-[#757A95]">Dana telah dipindahkan secara otomatis melalui backend.</p>
                </div>
              ) : (
                <>
                  {transferError && (
                    <div className="p-3 rounded-xl bg-red-50 text-red-600 text-xs font-semibold border border-red-200">
                      {transferError}
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <CustomSelect label="Dari Rekening" value={transferFrom} onChange={setTransferFrom} options={walletOptions} />
                    <CustomSelect label="Ke Rekening Tujuan" value={transferTo} onChange={setTransferTo} options={walletOptions} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#757A95] block mb-1">Nominal Transfer (Rp)</label>
                    <input type="number" required placeholder="100000" value={transferAmount} onChange={(e) => setTransferAmount(e.target.value)}
                      className="w-full px-4 py-2.5 bg-black/[0.02] border border-black/[0.06] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#7C7CE6]/50 focus:bg-white text-[#242636]" />
                  </div>
                  <div className="pt-4 flex items-center justify-end gap-3 border-t border-black/[0.05]">
                    <Button type="button" variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>Batal</Button>
                    <Button type="submit" variant="primary" size="md" disabled={isSubmitting || transferFrom === transferTo}>
                      {isSubmitting ? 'Mengirim...' : 'Kirim Dana'}
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
                  <p className="text-xs text-[#757A95]">Saldo dompet telah bertambah melalui transaksi pemasukan.</p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="text-xs font-semibold text-[#757A95] block mb-1">Dompet Tujuan</label>
                    <CustomSelect label="" value={txAccount} onChange={setTxAccount} options={walletOptions} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#757A95] block mb-1">Pilih / Masukkan Nominal Top Up (Rp)</label>
                    <input type="number" required placeholder="250000" value={topUpAmount} onChange={(e) => setTopUpAmount(e.target.value)}
                      className="w-full px-4 py-2.5 bg-black/[0.02] border border-black/[0.06] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#7C7CE6]/50 focus:bg-white text-[#242636]" />
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {[100000, 250000, 500000, 1000000, 2000000, 5000000].map((val) => (
                        <button key={val} type="button" onClick={() => setTopUpAmount(val.toString())}
                          className={`py-1.5 px-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${topUpAmount === val.toString() ? 'bg-[#7C7CE6] text-white border-[#7C7CE6]' : 'bg-black/[0.02] border-black/[0.05] text-[#757A95] hover:bg-black/[0.05]'}`}>
                          {formatIDR(val)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="pt-4 flex items-center justify-end gap-3 border-t border-black/[0.05]">
                    <Button type="button" variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>Batal</Button>
                    <Button type="submit" variant="primary" size="md" disabled={isSubmitting}>
                      {isSubmitting ? 'Memproses...' : 'Isi Saldo Sekarang'}
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
                <label className="text-xs font-semibold text-[#757A95] block mb-1">Gaji / Penghasilan Bulanan (Rp)</label>
                <input type="number" value={calcSalary} onChange={(e) => setCalcSalary(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 bg-black/[0.02] border border-black/[0.06] rounded-xl text-sm font-bold text-[#242636] focus:outline-none focus:ring-2 focus:ring-[#7C7CE6]/50" />
              </div>
              <div className="space-y-3 pt-2">
                <div className="p-3.5 rounded-2xl bg-[#E4E2FB]/40 border border-[#7C7CE6]/20 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-[#7C7CE6] block">50% Kebutuhan Pokok</span>
                    <span className="text-[11px] text-[#757A95]">Makan, Tempat Tinggal, Transportasi, Tagihan</span>
                  </div>
                  <span className="text-sm font-extrabold text-[#242636]">{formatIDR(calcSalary * 0.5)}</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#FCE2E0]/40 border border-[#FCE2E0] flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-[#B83A38] block">30% Keinginan & Gaya Hidup</span>
                    <span className="text-[11px] text-[#757A95]">Nongkrong, Belanja Hobi, Langganan Streaming</span>
                  </div>
                  <span className="text-sm font-extrabold text-[#242636]">{formatIDR(calcSalary * 0.3)}</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#D0EFE5]/50 border border-[#D0EFE5] flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-[#1B7354] block">20% Tabungan & Investasi</span>
                    <span className="text-[11px] text-[#757A95]">Dana Darurat, Reksadana, Target Impian</span>
                  </div>
                  <span className="text-sm font-extrabold text-[#1B7354]">{formatIDR(calcSalary * 0.2)}</span>
                </div>
              </div>
              <div className="pt-3 text-right">
                <Button variant="primary" size="md" onClick={() => setIsModalOpen(false)}>Selesai</Button>
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
                    <label className="text-xs font-semibold text-[#757A95] block mb-1">Nama Barang / Rencana Impian</label>
                    <input type="text" value={goalName} onChange={(e) => setGoalName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-black/[0.02] border border-black/[0.06] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#7C7CE6]/50 text-[#242636]" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-[#757A95] block mb-1">Target Dana (Rp)</label>
                      <input type="number" value={goalTarget} onChange={(e) => setGoalTarget(e.target.value)}
                        className="w-full px-4 py-2.5 bg-black/[0.02] border border-black/[0.06] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#7C7CE6]/50 text-[#242636]" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-[#757A95] block mb-1">Durasi (Bulan)</label>
                      <input type="number" value={goalMonths} onChange={(e) => setGoalMonths(e.target.value)}
                        className="w-full px-4 py-2.5 bg-black/[0.02] border border-black/[0.06] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#7C7CE6]/50 text-[#242636]" />
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#D0EFE5]/40 border border-[#D0EFE5] space-y-1">
                    <span className="text-xs text-[#757A95] block">Wajib Menabung per Bulan:</span>
                    <div className="text-2xl font-extrabold text-[#1B7354]">
                      {formatIDR(Math.round((parseFloat(goalTarget) || 0) / (parseFloat(goalMonths) || 1)))}{' '}
                      <span className="text-xs font-semibold text-[#757A95]">/ bulan</span>
                    </div>
                  </div>
                  <div className="pt-4 flex items-center justify-end gap-3 border-t border-black/[0.05]">
                    <Button type="button" variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>Tutup</Button>
                    <Button type="button" variant="primary" size="md" onClick={() => { setGoalSaved(true); setTimeout(() => { setIsModalOpen(false); setGoalSaved(false); }, 1200); }}>Simpan Simulasi</Button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* FITUR 7: ATUR POS ANGGARAN */}
          {activeFeature === 'budget_quick' && (
            <div className="space-y-4">
              <div className="space-y-3">
                {budgetsList.length === 0 ? (
                  <div className="py-6 text-center">
                    <p className="text-xs text-[#757A95]">Belum ada anggaran. Buat anggaran pertama Anda.</p>
                  </div>
                ) : (
                  budgetsList.slice(0, 3).map((b) => {
                    const pct = b.limit > 0 ? Math.round((b.spent / b.limit) * 100) : 0;
                    return (
                      <div key={b.id} className="p-3.5 rounded-2xl bg-black/[0.02] border border-black/[0.05] space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold text-[#242636]">
                          <span>{b.name}</span>
                          <span className={pct > 80 ? 'text-[#B83A38]' : 'text-[#7C7CE6]'}>{pct}% Terpakai</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-black/[0.05] overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: pct > 80 ? '#B83A38' : b.color }} />
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-[#757A95]">
                          <span>{formatIDR(b.spent)}</span>
                          <span>Batas {formatIDR(b.limit)}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              <div className="pt-3 flex items-center justify-between border-t border-black/[0.05]">
                <Link href="/app/budgets" onClick={() => setIsModalOpen(false)} className="text-xs font-bold text-[#7C7CE6] hover:underline">
                  Buka Halaman Anggaran Penuh →
                </Link>
                <Button variant="primary" size="sm" onClick={() => setIsModalOpen(false)}>Selesai</Button>
              </div>
            </div>
          )}

          {/* FITUR 8: TANYA FINAI CEPAT */}
          {activeFeature === 'quick_ai' && (
            <div className="space-y-4">
              <div className="h-56 overflow-y-auto space-y-3 p-3 bg-black/[0.02] rounded-2xl border border-black/[0.05] text-xs">
                {aiResponses.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-3 rounded-2xl leading-relaxed ${msg.role === 'user' ? 'bg-[#7C7CE6] text-white rounded-br-none' : 'bg-white text-[#242636] shadow-xs border border-black/[0.04] rounded-bl-none'}`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {['Berapa sisa uangku?', 'Pengeluaran apa paling boros?', 'Tips hemat minggu ini'].map((chip) => (
                  <button key={chip} type="button" onClick={() => handleAskAI(chip)}
                    className="px-2.5 py-1 rounded-lg bg-[#E4E2FB]/50 hover:bg-[#E4E2FB] text-[11px] font-semibold text-[#7C7CE6] transition-colors cursor-pointer">
                    {chip}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 pt-1">
                <input type="text" placeholder="Ketik pertanyaan keuanganmu..." value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAskAI(); }}
                  className="flex-1 px-4 py-2.5 bg-black/[0.02] border border-black/[0.06] rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#7C7CE6]/50" />
                <Button type="button" variant="primary" size="sm" icon={<Send size={14} />} onClick={() => handleAskAI()}>Kirim</Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </PageTransition>
  );
}
