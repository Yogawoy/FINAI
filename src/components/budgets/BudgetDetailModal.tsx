'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  TrendingDown,
  TrendingUp,
  Pencil,
  Trash2,
  Copy,
  MoreVertical,
  ArrowUpRight,
  Utensils,
  Coffee,
  ShoppingBag,
  Car,
  Fuel,
  Train,
  Film,
  Dices,
  Shirt,
  Sparkle,
  Zap,
  Globe,
  Music,
  WalletCards,
  X,
} from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { BudgetCategory } from '@/types';
import { formatIDR } from '@/data/mockData';
import { getCategoryIconComponent, getCategoryColorTheme } from './BudgetRow';

interface BudgetDetailModalProps {
  budget: BudgetCategory | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (budget: BudgetCategory) => void;
  onDelete: (budget: BudgetCategory) => void;
  onDuplicate: (budget: BudgetCategory) => void;
}

// 7-day spending distribution (mock)
const DAILY_TREND_DATA = [
  { day: 'Sen', amount: '80K', val: 80000 },
  { day: 'Sel', amount: '120K', val: 120000 },
  { day: 'Rab', amount: '60K', val: 60000 },
  { day: 'Kam', amount: '150K', val: 150000 },
  { day: 'Jum', amount: '90K', val: 90000 },
  { day: 'Sab', amount: '130K', val: 130000 },
  { day: 'Min', amount: '70K', val: 70000 },
];

const CATEGORY_RECENT_TXS: Record<string, { id: string; title: string; date: string; amount: number; icon: React.ReactNode }[]> = {
  food: [
    { id: 'tx-1', title: 'Ayam Geprek Sambal Korek', date: '31 Agt 2026', amount: 28000, icon: <Utensils size={14} className="text-[#5F5ED4]" /> },
    { id: 'tx-2', title: 'Kopi Susu & Pastry', date: '30 Agt 2026', amount: 22000, icon: <Coffee size={14} className="text-[#5F5ED4]" /> },
    { id: 'tx-3', title: 'Belanja Supermarket', date: '29 Agt 2026', amount: 150000, icon: <ShoppingBag size={14} className="text-[#5F5ED4]" /> },
    { id: 'tx-4', title: 'Bakso Urat & Es Teh', date: '28 Agt 2026', amount: 35000, icon: <Utensils size={14} className="text-[#5F5ED4]" /> },
  ],
  transport: [
    { id: 'tx-t1', title: 'GoRide ke Kantor', date: '31 Agt 2026', amount: 24000, icon: <Car size={14} className="text-[#3B82F6]" /> },
    { id: 'tx-t2', title: 'Bensin Pertamax', date: '29 Agt 2026', amount: 100000, icon: <Fuel size={14} className="text-[#3B82F6]" /> },
    { id: 'tx-t3', title: 'KRL Commuter Line', date: '28 Agt 2026', amount: 12000, icon: <Train size={14} className="text-[#3B82F6]" /> },
  ],
  entertainment: [
    { id: 'tx-e1', title: 'Tiket Bioskop XXI', date: '30 Agt 2026', amount: 110000, icon: <Film size={14} className="text-[#9333EA]" /> },
    { id: 'tx-e2', title: 'Board Game Pass', date: '28 Agt 2026', amount: 75000, icon: <Dices size={14} className="text-[#9333EA]" /> },
  ],
  shopping: [
    { id: 'tx-s1', title: 'Kemeja Katun Kasual', date: '29 Agt 2026', amount: 299000, icon: <Shirt size={14} className="text-[#EA580C]" /> },
    { id: 'tx-s2', title: 'Perawatan Kulit Guardian', date: '26 Agt 2026', amount: 121000, icon: <Sparkle size={14} className="text-[#EA580C]" /> },
  ],
  bills: [
    { id: 'tx-b1', title: 'Listrik PLN Pascabayar', date: '20 Agt 2026', amount: 450000, icon: <Zap size={14} className="text-[#EAB308]" /> },
    { id: 'tx-b2', title: 'Internet Biznet Fiber', date: '18 Agt 2026', amount: 380000, icon: <Globe size={14} className="text-[#EAB308]" /> },
    { id: 'tx-b3', title: 'Spotify Family Bulanan', date: '15 Agt 2026', amount: 60000, icon: <Music size={14} className="text-[#EAB308]" /> },
  ],
};

export default function BudgetDetailModal({
  budget,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onDuplicate,
}: BudgetDetailModalProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (!budget) return null;

  const percentage = budget.limit > 0 ? Math.round((budget.spent / budget.limit) * 100) : 0;
  const remaining = budget.limit - budget.spent;
  const isOver = remaining < 0 || percentage > 100;
  const colorTheme = getCategoryColorTheme(budget.category);

  // Fallback transaction list
  const recentTxs = CATEGORY_RECENT_TXS[budget.category] || [
    { id: 'tx-def-1', title: `Pembayaran ${budget.name}`, date: '31 Agt 2026', amount: 45000, icon: <WalletCards size={14} className="text-[#7C7CE6]" /> },
    { id: 'tx-def-2', title: `Belanja ${budget.name}`, date: '29 Agt 2026', amount: 120000, icon: <ShoppingBag size={14} className="text-[#7C7CE6]" /> },
  ];

  // Circular gauge SVG parameters
  const radius = 48;
  const stroke = 10;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (Math.min(percentage, 100) / 100) * circumference;

  const maxDailyVal = Math.max(...DAILY_TREND_DATA.map((d) => d.val));

  const periodLabel =
    budget.period === 'weekly' ? 'Anggaran Mingguan' : budget.period === 'custom' ? 'Anggaran Kustom' : 'Anggaran Bulanan';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="2xl"
      hideHeader
      className="p-6 sm:p-8 space-y-6"
    >
      {/* ========================================================================= */}
      {/* 1. TOP HEADER ROW: CATEGORY + PERIOD + ACTIONS MENU                        */}
      {/* ========================================================================= */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-2xl ${colorTheme.bg} ${colorTheme.text} border ${colorTheme.border} flex items-center justify-center shrink-0 shadow-xs`}
          >
            {getCategoryIconComponent(budget.category, 22)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-extrabold text-[#242636] tracking-tight">
                {budget.name}
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E4E2FB] text-[#5F5ED4] border border-[#7C7CE6]/20">
                {periodLabel}
              </span>
            </div>
            <p className="text-xs text-[#757A95] mt-0.5">
              Target batas pengeluaran: {formatIDR(budget.limit)}
            </p>
          </div>
        </div>

        {/* Action Menu (Edit, Duplicate, Delete) */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#757A95] hover:text-[#242636] hover:bg-black/[0.04] transition-colors cursor-pointer"
          >
            <MoreVertical size={18} />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 top-full mt-1 w-44 p-1.5 bg-white border border-black/[0.08] rounded-2xl shadow-[0_12px_30px_rgba(36,38,54,0.12)] z-30 space-y-0.5">
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  onEdit(budget);
                }}
                className="w-full px-3 py-2 rounded-xl text-left text-xs font-semibold text-[#242636] hover:bg-[#F8F9FD] flex items-center gap-2 cursor-pointer"
              >
                <Pencil size={13} className="text-[#7C7CE6]" />
                <span>Edit Anggaran</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  onDuplicate(budget);
                }}
                className="w-full px-3 py-2 rounded-xl text-left text-xs font-semibold text-[#242636] hover:bg-[#F8F9FD] flex items-center gap-2 cursor-pointer"
              >
                <Copy size={13} className="text-[#10B981]" />
                <span>Duplikasi Anggaran</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  onDelete(budget);
                }}
                className="w-full px-3 py-2 rounded-xl text-left text-xs font-semibold text-[#B83A38] hover:bg-[#FFF1F0] flex items-center gap-2 cursor-pointer"
              >
                <Trash2 size={13} />
                <span>Hapus Anggaran</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. CIRCULAR GAUGE & 3 METRIC CARDS (HERO SECTION)                         */}
      {/* ========================================================================= */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-[#F5F4FE] via-[#EDEAFC]/60 to-[#E4E2FB]/40 border border-[#E4E2FB] flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
        {/* Left: Circular Gauge Ring */}
        <div className="flex items-center gap-5">
          <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
            <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
              <circle
                stroke="#DDD9F8"
                fill="transparent"
                strokeWidth={stroke}
                r={normalizedRadius}
                cx={radius}
                cy={radius}
              />
              <circle
                stroke={isOver ? '#EF4444' : percentage > 85 ? '#F59E0B' : '#7C7CE6'}
                fill="transparent"
                strokeWidth={stroke}
                strokeDasharray={circumference + ' ' + circumference}
                style={{ strokeDashoffset }}
                strokeLinecap="round"
                r={normalizedRadius}
                cx={radius}
                cy={radius}
                className="transition-all duration-700 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span
                className={`text-xl font-black tabular-nums tracking-tight ${
                  isOver ? 'text-[#B83A38]' : 'text-[#242636]'
                }`}
              >
                {percentage}%
              </span>
              <span className="text-[10px] uppercase font-bold text-[#757A95] tracking-wider">
                Terpakai
              </span>
            </div>
          </div>

          <div className="space-y-1 text-left">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#7C7CE6]">
              Status Anggaran
            </span>
            <h4 className="text-base font-extrabold text-[#242636]">
              {isOver
                ? 'Melebihi Batas'
                : percentage > 85
                ? 'Mendekati Batas'
                : 'Terkontrol Aman'}
            </h4>
            <p className="text-xs text-[#757A95] max-w-[200px]">
              {isOver
                ? `Terlampaui ${formatIDR(Math.abs(remaining))}`
                : `Sisa kuota aman ${formatIDR(remaining)}`}
            </p>
          </div>
        </div>

        {/* Right: 3 Metric Badges */}
        <div className="grid grid-cols-3 sm:grid-cols-1 gap-2 w-full sm:w-auto shrink-0">
          <div className="p-2.5 px-4 rounded-2xl bg-white/90 border border-black/[0.04] shadow-2xs space-y-0.5">
            <span className="text-[10px] font-bold text-[#757A95] uppercase tracking-wider block">
              Batas Plafon
            </span>
            <span className="text-xs sm:text-sm font-extrabold text-[#242636] tabular-nums">
              {formatIDR(budget.limit)}
            </span>
          </div>

          <div className="p-2.5 px-4 rounded-2xl bg-white/90 border border-black/[0.04] shadow-2xs space-y-0.5">
            <span className="text-[10px] font-bold text-[#757A95] uppercase tracking-wider block">
              Terpakai
            </span>
            <span className="text-xs sm:text-sm font-extrabold text-[#B83A38] tabular-nums">
              {formatIDR(budget.spent)}
            </span>
          </div>

          <div className="p-2.5 px-4 rounded-2xl bg-white/90 border border-black/[0.04] shadow-2xs space-y-0.5">
            <span className="text-[10px] font-bold text-[#757A95] uppercase tracking-wider block">
              Sisa Kuota
            </span>
            <span
              className={`text-xs sm:text-sm font-extrabold tabular-nums ${
                isOver ? 'text-[#B83A38]' : 'text-[#1B7354]'
              }`}
            >
              {remaining < 0 ? `-${formatIDR(Math.abs(remaining))}` : formatIDR(remaining)}
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. 2-COLUMN BOTTOM: SPENDING TREND (LEFT) & RECENT TRANSACTIONS (RIGHT)   */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* SISI KIRI: Spending Trend Bar Chart (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs sm:text-sm font-bold text-[#242636]">
              Tren Pengeluaran 7 Hari Terakhir
            </h4>
            <span className="text-[11px] font-bold text-[#7C7CE6]">
              Rata-rata: Rp98rb/hari
            </span>
          </div>

          {/* Simple 2D Soft Bar Graph */}
          <div className="p-4 rounded-2xl bg-[#F8F9FD] border border-black/[0.04] space-y-3">
            <div className="h-28 flex items-end justify-between gap-2 pt-2 px-1">
              {DAILY_TREND_DATA.map((d, i) => {
                const heightPct = Math.round((d.val / maxDailyVal) * 100);
                const isHigh = heightPct > 80;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                    <span className="text-[9px] font-bold text-[#757A95] opacity-0 group-hover:opacity-100 transition-opacity">
                      {d.amount}
                    </span>
                    <div
                      style={{ height: `${heightPct}%` }}
                      className={`w-full max-w-[24px] rounded-t-lg transition-all duration-300 ${
                        isHigh
                          ? 'bg-[#7C7CE6] shadow-[0_4px_12px_rgba(124,124,230,0.3)]'
                          : 'bg-[#E4E2FB] hover:bg-[#D6D3F5]'
                      }`}
                    />
                    <span className="text-[10px] font-bold text-[#757A95]">{d.day}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* FinAI Smart Insight Card */}
          <div className="p-3.5 rounded-2xl bg-[#D0EFE5]/40 border border-[#1B7354]/20 flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 text-[#1B7354]">
                <Sparkles size={13} />
                <span className="text-[11px] font-extrabold uppercase tracking-wider">
                  ✦ FinAI Insight
                </span>
              </div>
              <p className="text-xs text-[#242636] font-medium leading-relaxed">
                Dengan pola belanja saat ini, pengeluaran pos {budget.name} masih berada dalam batas aman.
              </p>
            </div>

            {/* Decorative mini trendline graphic */}
            <div className="shrink-0 text-[#1B7354] opacity-80">
              <svg width="48" height="24" viewBox="0 0 48 24" fill="none" className="stroke-current">
                <path
                  d="M2 18 L14 12 L26 15 L38 6 L46 8"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="46" cy="8" r="3" fill="#1B7354" />
              </svg>
            </div>
          </div>
        </div>

        {/* SISI KANAN: Recent Transactions (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs sm:text-sm font-bold text-[#242636]">
              Transaksi Terbaru
            </h4>
            <Link
              href="/app/transactions"
              onClick={onClose}
              className="text-xs font-bold text-[#5F5ED4] hover:text-[#4B49C8] flex items-center gap-0.5 transition-colors"
            >
              <span>Lihat Semua</span>
              <ArrowUpRight size={13} />
            </Link>
          </div>

          {/* Transactions list items with SVG icons */}
          <div className="space-y-2">
            {recentTxs.map((tx) => (
              <div
                key={tx.id}
                className="p-3 rounded-2xl bg-[#F8F9FD] border border-black/[0.04] hover:bg-[#FAF9FE] flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-2xs border border-black/[0.04]">
                    {tx.icon}
                  </div>
                  <div className="min-w-0">
                    <h5 className="text-xs font-bold text-[#242636] truncate">
                      {tx.title}
                    </h5>
                    <p className="text-[10px] text-[#757A95]">{tx.date}</p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs sm:text-sm font-black text-[#B83A38]">
                    -{formatIDR(tx.amount)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}
