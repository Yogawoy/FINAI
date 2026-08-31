'use client';

import React, { useState } from 'react';
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
  AreaChart,
  Area,
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
import Header from '@/components/navigation/Header';
import GlassCard from '@/components/ui/GlassCard';
import Badge from '@/components/ui/Badge';
import {
  MOCK_CASHFLOW,
  MOCK_CATEGORY_BREAKDOWN,
  MOCK_DAY_SPENDING,
  formatIDR,
} from '@/data/mockData';

const TIMEFRAMES = ['7 Hari', '30 Hari', '6 Bulan', '1 Tahun'];

export default function AnalyticsPage() {
  const [selectedTimeframe, setSelectedTimeframe] = useState('6 Bulan');

  return (
    <div className="space-y-8">
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
            <span className="text-xs font-bold text-[#757A95] uppercase tracking-wider">
              Rasio Tabungan Bersih
            </span>
            <Badge variant="mint" size="sm">Optimal</Badge>
          </div>
          <div className="text-3xl font-extrabold text-[#242636] mt-2">
            34,2%
          </div>
          <span className="text-xs text-[#1B7354] font-semibold mt-1 flex items-center gap-1">
            <TrendingUp size={13} />
            +4,8% lebih tinggi dari bulan lalu
          </span>
        </GlassCard>

        <GlassCard variant="subtle" className="p-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#757A95] uppercase tracking-wider">
              Porsi Pengeluaran Terbesar
            </span>
            <Badge variant="periwinkle" size="sm">34%</Badge>
          </div>
          <div className="text-3xl font-extrabold text-[#7C7CE6] mt-2">
            Makanan & Minuman
          </div>
          <span className="text-xs text-[#757A95] mt-1 block">
            Rp2.150.000 terpakai dari batas Rp3.000.000
          </span>
        </GlassCard>

        <GlassCard variant="subtle" className="p-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#757A95] uppercase tracking-wider">
              Hari Belanja Paling Aktif
            </span>
            <Badge variant="glass" size="sm">Sabtu & Minggu</Badge>
          </div>
          <div className="text-3xl font-extrabold text-[#242636] mt-2">
            Akhir Pekan
          </div>
          <span className="text-xs text-[#757A95] mt-1 block">
            Rata-rata Rp420.000 / hari
          </span>
        </GlassCard>
      </div>

      {/* Main Cashflow Trend Area Chart */}
      <GlassCard className="p-6 sm:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="periwinkle" size="sm" icon={<LineChartIcon size={12} />}>
                Tren Arus Kas 6 Bulan
              </Badge>
            </div>
            <h2 className="text-xl font-extrabold text-[#242636] mt-1">
              Keseimbangan Pemasukan vs Pengeluaran
            </h2>
          </div>

          <div className="flex items-center gap-6 text-xs font-semibold">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#7C7CE6]" />
              <span className="text-[#242636]">Pemasukan</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#9EB3F7]" />
              <span className="text-[#757A95]">Pengeluaran</span>
            </div>
          </div>
        </div>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={MOCK_CASHFLOW}>
              <defs>
                <linearGradient id="colorIncAnalytics" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7C7CE6" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#7C7CE6" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorExpAnalytics" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#9EB3F7" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#9EB3F7" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" stroke="#A0A4B8" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis
                stroke="#A0A4B8"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${v / 1000000}Jt`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  borderRadius: '16px',
                  border: '1px solid rgba(255,255,255,0.8)',
                  boxShadow: '0 8px 30px rgba(48,51,74,0.08)',
                  fontSize: '12px',
                }}
                formatter={(val: any) => [formatIDR(Number(val) || 0), '']}
              />
              <Area
                type="monotone"
                dataKey="income"
                name="Pemasukan"
                stroke="#7C7CE6"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorIncAnalytics)"
              />
              <Area
                type="monotone"
                dataKey="expense"
                name="Pengeluaran"
                stroke="#9EB3F7"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorExpAnalytics)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      {/* Two Column Grid: Category Donut & Day-of-Week Spending */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Category Breakdown Donut (6 Columns) */}
        <GlassCard className="lg:col-span-6 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Badge variant="periwinkle" size="sm" icon={<PieChartIcon size={12} />}>
                Porsi Kategori
              </Badge>
              <h3 className="text-base font-bold text-[#242636] mt-1">
                Alokasi Pengeluaran per Pos
              </h3>
            </div>
            <span className="text-xs font-bold text-[#7C7CE6]">
              Total {formatIDR(6270000)}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center pt-2">
            <div className="h-52 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={MOCK_CATEGORY_BREAKDOWN}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="amount"
                  >
                    {MOCK_CATEGORY_BREAKDOWN.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '12px',
                      fontSize: '12px',
                    }}
                    formatter={(v: any) => [formatIDR(Number(v) || 0), '']}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] text-[#757A95] uppercase font-bold">Terbesar</span>
                <span className="text-xs font-extrabold text-[#242636]">Makanan 34%</span>
              </div>
            </div>

            {/* Legend list */}
            <div className="space-y-2 text-xs">
              {MOCK_CATEGORY_BREAKDOWN.map((cat) => (
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
        </GlassCard>

        {/* Day-of-Week Spending Rhythm Bar Chart (6 Columns) */}
        <GlassCard className="lg:col-span-6 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Badge variant="periwinkle" size="sm" icon={<Calendar size={12} />}>
                Ritme Mingguan
              </Badge>
              <h3 className="text-base font-bold text-[#242636] mt-1">
                Aktivitas Belanja Harian
              </h3>
            </div>
            <span className="text-xs font-semibold text-[#1B7354] bg-[#D0EFE5] px-2.5 py-0.5 rounded-full">
              Pola Teratur
            </span>
          </div>

          <div className="h-56 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MOCK_DAY_SPENDING} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="day" stroke="#A0A4B8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis
                  stroke="#A0A4B8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `${v / 1000}rb`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                  formatter={(v: any) => [formatIDR(Number(v) || 0), 'Pengeluaran']}
                />
                <Bar dataKey="amount" fill="#7C7CE6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
