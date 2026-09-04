'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  LineChart as LineChartIcon,
  TrendingUp,
  PieChart as PieChartIcon,
  Calendar,
  Sparkles,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { IncomeExpenseChart } from '@/components/charts';
import Header from '@/components/navigation/Header';
import GlassCard from '@/components/ui/GlassCard';
import Badge from '@/components/ui/Badge';
import { formatIDR } from '@/lib/format';
import { apiClient, mapApiErrorMessage } from '@/lib/api-client';
import { onRefresh } from '@/lib/data-refresh';

// Loading & Page Transition
import AnalyticsSkeleton from '@/components/loading/AnalyticsSkeleton';
import PageTransition from '@/components/loading/PageTransition';

const TIMEFRAMES = ['7 Hari', '30 Hari', '6 Bulan', '1 Tahun'];

const CATEGORY_COLORS: Record<string, string> = {
  food: '#7C7CE6',
  transport: '#8E9AF7',
  entertainment: '#D6E4FA',
  shopping: '#1B7354',
  bills: '#F97316',
  health: '#D0EFE5',
  education: '#9F7AEA',
  salary: '#10B981',
  freelance: '#3B82F6',
  investment: '#F59E0B',
  other: '#757A95',
};

const CATEGORY_LABELS: Record<string, string> = {
  food: 'Food & Dining',
  transport: 'Transportation',
  entertainment: 'Entertainment',
  shopping: 'Shopping & Goods',
  bills: 'Bills & Utilities',
  health: 'Health & Medical',
  education: 'Education',
  salary: 'Salary',
  freelance: 'Freelance',
  investment: 'Investment',
  other: 'Other',
};

interface TransactionRaw {
  id: string;
  type: string;
  amount: string;
  category: string;
  description: string;
  transactionDate: string;
}

export default function AnalyticsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<TransactionRaw[]>([]);

  const [selectedTimeframe, setSelectedTimeframe] = useState('6 Bulan');

  const fetchTransactions = useCallback(async () => {
    try {
      setErrorMessage(null);
      const res = await apiClient.get<{ transactions: any[]; total: number }>('/api/transactions?limit=500');
      setTransactions(res.transactions || []);
    } catch (err) {
      setErrorMessage(mapApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  useEffect(() => {
    const off = onRefresh((kind) => {
      if (kind === 'transaction' || kind === 'transfer' || kind === 'all') fetchTransactions();
    });
    return off;
  }, [fetchTransactions]);

  // Chart aggregation for IncomeExpenseChart — per selectedTimeframe
  const analyticsChartData = useMemo(() => {
    if (transactions.length === 0) return [] as { label: string; fullDate: string; income: number; expense: number }[];
    const now = new Date();
    if (selectedTimeframe === '7 Hari') {
      const buckets: { key: string; label: string; fullDate: string; income: number; expense: number }[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
        const label = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }).replace('.', '');
        const fullDate = d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' });
        const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        buckets.push({ key, label: label.charAt(0).toUpperCase() + label.slice(1), fullDate, income: 0, expense: 0 });
      }
      const map = new Map(buckets.map((b) => [b.key, b]));
      transactions.forEach((tx) => {
        const d = new Date(tx.transactionDate);
        if (Number.isNaN(d.getTime())) return;
        const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        const b = map.get(key);
        if (!b) return;
        const amt = Number(tx.amount) || 0;
        if (String(tx.type).toUpperCase() === 'INCOME') b.income += amt;
        else b.expense += amt;
      });
      return buckets.map(({ label, fullDate, income, expense }) => ({ label, fullDate, income, expense }));
    }
    if (selectedTimeframe === '30 Hari') {
      const buckets: { key: string; label: string; fullDate: string; income: number; expense: number }[] = [];
      for (let w = 3; w >= 0; w--) {
        const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() - w * 7);
        const start = new Date(end.getFullYear(), end.getMonth(), end.getDate() - 6);
        const sLabel = start.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }).replace('.', '');
        const eLabel = end.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }).replace('.', '');
        const fullDate = w === 0 ? `Minggu ini (${sLabel} - ${eLabel})` : `Minggu ${4 - w} (${sLabel} - ${eLabel})`;
        const label = `Mgg ${4 - w}`;
        buckets.push({ key: String(3 - w), label, fullDate, income: 0, expense: 0 });
      }
      // Distribute by days since epoch week index
      transactions.forEach((tx) => {
        const d = new Date(tx.transactionDate);
        if (Number.isNaN(d.getTime())) return;
        const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays < 0 || diffDays >= 30) return;
        const weekIdx = Math.floor((29 - diffDays) / 7);
        const idx = Math.max(0, Math.min(3, weekIdx));
        const b = buckets[idx];
        if (!b) return;
        const amt = Number(tx.amount) || 0;
        if (String(tx.type).toUpperCase() === 'INCOME') b.income += amt;
        else b.expense += amt;
      });
      return buckets.map(({ label, fullDate, income, expense }) => ({ label, fullDate, income, expense }));
    }
    const monthCount = selectedTimeframe === '3 Bulan' ? 3 : selectedTimeframe === '1 Tahun' ? 12 : 6;
    const buckets: { key: string; label: string; fullDate: string; income: number; expense: number }[] = [];
    for (let i = monthCount - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleDateString('id-ID', { month: 'short' }).replace('.', '');
      const fullDate = d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      buckets.push({ key, label: label.charAt(0).toUpperCase() + label.slice(1), fullDate: fullDate.charAt(0).toUpperCase() + fullDate.slice(1), income: 0, expense: 0 });
    }
    const map = new Map(buckets.map((b) => [b.key, b]));
    transactions.forEach((tx) => {
      const d = new Date(tx.transactionDate);
      if (Number.isNaN(d.getTime())) return;
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const b = map.get(key);
      if (!b) return;
      const amt = Number(tx.amount) || 0;
      if (String(tx.type).toUpperCase() === 'INCOME') b.income += amt;
      else b.expense += amt;
    });
    return buckets.map(({ label, fullDate, income, expense }) => ({ label, fullDate, income, expense }));
  }, [transactions, selectedTimeframe]);

  // Compute analytics from real transactions
  const analytics = useMemo(() => {
    const now = new Date();

    // Filter by timeframe
    const timeframeDays = selectedTimeframe === '7 Hari' ? 7
      : selectedTimeframe === '30 Hari' ? 30
      : selectedTimeframe === '6 Bulan' ? 180
      : 365;

    const cutoffDate = new Date(now.getTime() - timeframeDays * 24 * 60 * 60 * 1000);

    const filtered = transactions.filter((tx) => {
      const txDate = new Date(tx.transactionDate);
      return txDate >= cutoffDate;
    });

    const expenses = filtered.filter((t) => String(t.type).toUpperCase() === 'EXPENSE');
    const incomes = filtered.filter((t) => String(t.type).toUpperCase() === 'INCOME');

    const totalExpense = expenses.reduce((a, t) => a + Number(t.amount), 0);
    const totalIncome = incomes.reduce((a, t) => a + Number(t.amount), 0);
    const savingsRate = totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 1000) / 10 : 0;

    // Category breakdown
    const categoryMap: Record<string, number> = {};
    expenses.forEach((t) => {
      const cat = t.category || 'other';
      categoryMap[cat] = (categoryMap[cat] || 0) + Number(t.amount);
    });

    const categoryBreakdown = Object.entries(categoryMap)
      .map(([cat, amount]) => ({
        name: CATEGORY_LABELS[cat] || cat,
        amount,
        percentage: totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0,
        color: CATEGORY_COLORS[cat] || '#757A95',
        category: cat,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 6);

    // Day of week spending
    const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const daySpending: Record<number, number> = {};
    expenses.forEach((t) => {
      const d = new Date(t.transactionDate).getDay();
      daySpending[d] = (daySpending[d] || 0) + Number(t.amount);
    });

    // Reorder to Sen-Min
    const dayOrder = [1, 2, 3, 4, 5, 6, 0];
    const daySpendingData = dayOrder.map((d) => ({
      day: dayNames[d],
      amount: daySpending[d] || 0,
      avg: expenses.length > 0 ? Math.round(totalExpense / 7) : 0,
    }));

    // Top spending category
    const topCategory = categoryBreakdown.length > 0 ? categoryBreakdown[0] : null;

    // Active spending days
    const spendingDays = new Set(expenses.map((t) => new Date(t.transactionDate).toDateString())).size;
    const avgDaily = spendingDays > 0 ? Math.round(totalExpense / spendingDays) : 0;

    return {
      savingsRate,
      totalExpense,
      totalIncome,
      categoryBreakdown,
      daySpendingData,
      topCategory,
      avgDaily,
      totalExpenseFormatted: totalExpense,
    };
  }, [transactions, selectedTimeframe]);

  if (isLoading) {
    return <AnalyticsSkeleton />;
  }

  return (
    <PageTransition>
      <div className="space-y-8 max-w-7xl mx-auto pb-16">
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-red-50 text-red-600 border border-red-200 text-xs font-semibold">
            {errorMessage}
          </div>
        )}

        {/* Header */}
        <Header
          title="Analisis & Intelijen Keuangan"
          subtitle="Evaluasi mendalam pergerakan arus kas, porsi kategori belanja, dan rasio tabungan"
          actionButton={
            <div className="flex items-center gap-1 p-1 glass-pill rounded-2xl">
              {TIMEFRAMES.map((tf) => (
                <button
                  key={tf}
                  onClick={() => setSelectedTimeframe(tf)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    selectedTimeframe === tf
                      ? 'bg-gradient-to-r from-[#7C7CE6] to-[#8C8BE8] text-white shadow-xs'
                      : 'text-[#757A95] hover:text-[#242636]'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          }
        />

        {/* Top 3 Core Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <GlassCard variant="subtle" className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#757A95] uppercase tracking-wider">Rasio Tabungan Bersih</span>
              <Badge variant={analytics.savingsRate >= 20 ? 'mint' : 'glass'} size="sm">
                {analytics.savingsRate >= 20 ? 'Optimal' : 'Perlu Perbaikan'}
              </Badge>
            </div>
            <div className="text-3xl font-extrabold text-[#242636] mt-2">{analytics.savingsRate}%</div>
            <span className="text-xs text-[#1B7354] font-semibold mt-1 flex items-center gap-1">
              <TrendingUp size={13} />
              {formatIDR(Math.max(analytics.totalIncome - analytics.totalExpense, 0))} surplus
            </span>
          </GlassCard>

          <GlassCard variant="subtle" className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#757A95] uppercase tracking-wider">Porsi Pengeluaran Terbesar</span>
              <Badge variant="periwinkle" size="sm">
                {analytics.topCategory ? `${analytics.topCategory.percentage}%` : '0%'}
              </Badge>
            </div>
            <div className="text-3xl font-extrabold text-[#7C7CE6] mt-2">
              {analytics.topCategory ? analytics.topCategory.name : 'N/A'}
            </div>
            <span className="text-xs text-[#757A95] mt-1 block">
              {analytics.topCategory ? `${formatIDR(analytics.topCategory.amount)} terpakai` : 'Belum ada data'}
            </span>
          </GlassCard>

          <GlassCard variant="subtle" className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#757A95] uppercase tracking-wider">Rata-rata Pengeluaran/Hari</span>
              <Badge variant="glass" size="sm">Aktif</Badge>
            </div>
            <div className="text-3xl font-extrabold text-[#242636] mt-2">{formatIDR(analytics.avgDaily)}</div>
            <span className="text-xs text-[#757A95] mt-1 block">
              Dari total {formatIDR(analytics.totalExpenseFormatted)} pengeluaran
            </span>
          </GlassCard>
        </div>

        {/* Main Cashflow Trend Area Chart — real data */}
        <IncomeExpenseChart
          data={analyticsChartData}
          isLoading={isLoading}
          error={errorMessage}
          variant="analytics"
          title="Keseimbangan Pemasukan vs Pengeluaran"
          subtitle="Tren arus kas"
          defaultPeriod={selectedTimeframe as any}
          period={selectedTimeframe as any}
          onPeriodChange={(p) => setSelectedTimeframe(p as any)}
          showSummary={true}
        />

        {/* Two Column Grid: Category Donut & Day-of-Week Spending */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Category Breakdown Donut */}
          <GlassCard className="lg:col-span-6 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Badge variant="periwinkle" size="sm" icon={<PieChartIcon size={12} />}>Porsi Kategori</Badge>
                <h3 className="text-base font-bold text-[#242636] mt-1">Alokasi Pengeluaran per Pos</h3>
              </div>
              <span className="text-xs font-bold text-[#7C7CE6]">
                Total {formatIDR(analytics.totalExpenseFormatted)}
              </span>
            </div>

            {analytics.categoryBreakdown.length === 0 ? (
              <div className="h-52 flex items-center justify-center">
                <p className="text-xs text-[#757A95]">Belum ada data pengeluaran untuk analisis kategori.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center pt-2">
                <div className="h-52 relative flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics.categoryBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="amount"
                      >
                        {analytics.categoryBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '12px', fontSize: '12px' }}
                        formatter={(v: any) => [formatIDR(Number(v) || 0), '']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-[10px] text-[#757A95] uppercase font-bold">Terbesar</span>
                    <span className="text-xs font-extrabold text-[#242636]">
                      {analytics.topCategory ? `${analytics.topCategory.name.split(' ')[0]} ${analytics.topCategory.percentage}%` : 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  {analytics.categoryBreakdown.map((cat) => (
                    <div key={cat.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                        <span className="text-[#242636] font-medium">{cat.name}</span>
                      </div>
                      <span className="font-bold text-[#757A95]">{cat.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </GlassCard>

          {/* Day-of-Week Spending Bar Chart */}
          <GlassCard className="lg:col-span-6 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Badge variant="periwinkle" size="sm" icon={<Calendar size={12} />}>Ritme Mingguan</Badge>
                <h3 className="text-base font-bold text-[#242636] mt-1">Aktivitas Belanja Harian</h3>
              </div>
              <span className="text-xs font-semibold text-[#1B7354] bg-[#D0EFE5] px-2.5 py-0.5 rounded-full">
                Pola Teratur
              </span>
            </div>

            <div className="h-56 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.daySpendingData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="day" stroke="#A0A4B8" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#A0A4B8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v / 1000}rb`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '12px', fontSize: '12px' }}
                    formatter={(v: any) => [formatIDR(Number(v) || 0), 'Pengeluaran']}
                  />
                  <Bar dataKey="amount" fill="#7C7CE6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </div>
      </div>
    </PageTransition>
  );
}
