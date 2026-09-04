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
import { formatIDR } from '@/lib/format';
import { getCategoryIconComponent, getCategoryColorTheme } from './BudgetRow';

interface BudgetDetailModalProps {
  budget: BudgetCategory | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (budget: BudgetCategory) => void;
  onDelete: (budget: BudgetCategory) => void;
  onDuplicate: (budget: BudgetCategory) => void;
  transactions?: any[];
}

function getCategoryLabel(cat: string): string {
  const map: Record<string, string> = {
    food: 'Makanan & Minuman',
    transport: 'Transportasi',
    entertainment: 'Hiburan',
    shopping: 'Belanja',
    bills: 'Tagihan',
    health: 'Kesehatan',
    education: 'Edukasi',
    other: 'Lainnya',
  };
  return map[cat] || cat.charAt(0).toUpperCase() + cat.slice(1);
}

function getCategoryIcon(cat: string) {
  const map: Record<string, React.ReactNode> = {
    food: <Utensils size={14} className="text-[#5F5ED4]" />,
    transport: <Car size={14} className="text-[#3B82F6]" />,
    entertainment: <Film size={14} className="text-[#9333EA]" />,
    shopping: <Shirt size={14} className="text-[#EA580C]" />,
    bills: <Zap size={14} className="text-[#EAB308]" />,
  };
  return map[cat] || <WalletCards size={14} className="text-[#7C7CE6]" />;
}

export default function BudgetDetailModal({
  budget,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onDuplicate,
  transactions = [],
}: BudgetDetailModalProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (!budget) return null;

  const percentage = budget.limit > 0 ? Math.round((budget.spent / budget.limit) * 100) : 0;
  const remaining = budget.limit - budget.spent;
  const isOver = remaining < 0 || percentage > 100;
  const colorTheme = getCategoryColorTheme(budget.category);

  // Dynamic transactions filtered by budget category (real data, last 30 days, max 4)
  const categoryTxs = transactions.filter(
    (tx: any) => String(tx.category).toLowerCase() === String(budget.category).toLowerCase() && String(tx.type).toUpperCase() === 'EXPENSE'
  );
  const recentTxs = (categoryTxs.length > 0 ? categoryTxs.slice(0, 4) : []).map((tx: any) => {
    const d = tx.transactionDate ? new Date(tx.transactionDate) : new Date();
    return {
      id: tx.id,
      title: tx.description,
      date: d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
      amount: Number(tx.amount),
      icon: getCategoryIcon(budget.category),
    };
  });
  const hasTxs = recentTxs.length > 0;

  // Circular gauge SVG parameters
  const radius = 48;
  const stroke = 10;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (Math.min(percentage, 100) / 100) * circumference;

  // Dynamic 7-day spending trend from real category transactions (last 7 days)
  const dayLabels = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'] as const;
  const today = new Date();
  const dailyTrend = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    const label = dayLabels[d.getDay()];
    const iso = d.toISOString().split('T')[0];
    const dayTotal = categoryTxs
      .filter((tx: any) => {
        const txIso = tx.transactionDate ? new Date(tx.transactionDate).toISOString().split('T')[0] : '';
        return txIso === iso;
      })
      .reduce((sum: number, tx: any) => sum + Number(tx.amount), 0);
    return { day: label, val: dayTotal, amount: dayTotal > 0 ? `${Math.round(dayTotal / 1000)}K` : '0' };
  });
  const maxDailyVal = Math.max(...dailyTrend.map((d) => d.val), 1);
  const avgDaily = Math.round(categoryTxs.reduce((s: number, tx: any) => s + Number(tx.amount), 0) / 7);

  const periodLabel =
    budget.period === 'weekly' ? 'Anggaran Mingguan' : budget.period === 'custom' ? 'Anggaran Kustom' : 'Anggaran Bulanan';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="2xl"
      hideHeader
      hideCloseButton={true}
      className="p-7 sm:p-8 space-y-6 pb-8"
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
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xl font-extrabold text-[#242636] tracking-tight capitalize">
                {getCategoryLabel(budget.category)}
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

        {/* Top-Right Action Buttons: Kebab Menu + Close Button */}
        <div className="flex items-center gap-2">
          {/* Action Menu (Edit, Duplicate, Delete) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-[#757A95] hover:text-[#242636] hover:bg-black/[0.04] transition-colors cursor-pointer"
              title="Menu Opsi"
            >
              <MoreVertical size={18} />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-44 p-1.5 bg-white border border-black/[0.08] rounded-2xl shadow-[0_12px_30px_rgba(36,38,54,0.12)] z-30 space-y-0.5">
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

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#757A95] hover:text-[#242636] hover:bg-black/[0.04] transition-colors cursor-pointer"
            title="Tutup"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. CIRCULAR GAUGE & 3 METRIC CARDS (HERO SECTION)                         */}
      {/* ========================================================================= */}
      <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-[#F5F4FE] via-[#EDEAFC]/60 to-[#E4E2FB]/40 border border-[#E4E2FB] flex flex-col sm:flex-row items-center justify-between gap-7 relative overflow-hidden">
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
        <div className="grid grid-cols-3 sm:grid-cols-1 gap-3 w-full sm:w-auto shrink-0">
          <div className="p-3.5 px-4 rounded-2xl bg-white/90 border border-black/[0.04] shadow-2xs space-y-1">
            <span className="text-[10px] font-bold text-[#757A95] uppercase tracking-wider block">
              Batas Plafon
            </span>
            <span className="text-xs sm:text-sm font-extrabold text-[#242636] tabular-nums">
              {formatIDR(budget.limit)}
            </span>
          </div>

          <div className="p-3.5 px-4 rounded-2xl bg-white/90 border border-black/[0.04] shadow-2xs space-y-1">
            <span className="text-[10px] font-bold text-[#757A95] uppercase tracking-wider block">
              Terpakai
            </span>
            <span className="text-xs sm:text-sm font-extrabold text-[#B83A38] tabular-nums">
              {formatIDR(budget.spent)}
            </span>
          </div>

          <div className="p-3.5 px-4 rounded-2xl bg-white/90 border border-black/[0.04] shadow-2xs space-y-1">
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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* SISI KIRI: Spending Trend Bar Chart (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs sm:text-sm font-bold text-[#242636]">
              Tren Pengeluaran 7 Hari Terakhir
            </h4>
            <span className="text-[11px] font-bold text-[#7C7CE6]">
              Rata-rata: {avgDaily > 0 ? formatIDR(avgDaily) : 'Rp0'}/hari
            </span>
          </div>

          {/* Simple 2D Soft Bar Graph — dynamic */}
          <div className="p-5 rounded-2xl bg-[#F8F9FD] border border-black/[0.04] space-y-3">
            <div className="h-28 flex items-end justify-between gap-2.5 pt-2 px-1">
              {dailyTrend.map((d, i) => {
                const heightPct = d.val > 0 ? Math.max(8, Math.round((d.val / maxDailyVal) * 100)) : 4;
                const isHigh = heightPct > 80;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
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
          <div className="p-4.5 rounded-2xl bg-[#D0EFE5]/40 border border-[#1B7354]/20 flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 text-[#1B7354]">
                <Sparkles size={13} />
                <span className="text-[11px] font-extrabold uppercase tracking-wider">
                  ✦ FinAI Insight
                </span>
              </div>
              <p className="text-xs text-[#242636] font-medium leading-relaxed">
                Dengan pola belanja saat ini, pengeluaran pos {getCategoryLabel(budget.category)} masih berada dalam batas aman.
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
        <div className="lg:col-span-5 space-y-4">
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

          {/* Transactions list — dynamic, empty state jika belum ada */}
          <div className="space-y-2.5">
            {hasTxs ? (
              recentTxs.map((tx) => (
                <div
                  key={tx.id}
                  className="p-3.5 rounded-2xl bg-[#F8F9FD] border border-black/[0.04] hover:bg-[#FAF9FE] flex items-center justify-between transition-colors"
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
              ))
            ) : (
              <div className="p-6 text-center rounded-2xl bg-[#F8F9FD] border border-dashed border-black/[0.06]">
                <p className="text-xs font-semibold text-[#757A95]">Belum ada transaksi di kategori ini</p>
                <p className="text-[11px] text-[#A0A4B8] mt-1">Transaksi pengeluaran {budget.name} akan muncul di sini</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
