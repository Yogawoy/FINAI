'use client';

import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import Link from 'next/link';
import ChartLegend from './ChartLegend';
import ChartPeriodSelect, { ChartPeriod } from './ChartPeriodSelect';
import FinancialTooltip from './FinancialTooltip';
import { formatIDR } from '@/lib/format';

export interface ChartDataPoint {
  label: string;
  fullDate: string;
  income: number;
  expense: number;
}

// ---------------------------------------------------------------------------
// Marketing preview data only — not used by authenticated financial pages.
// Dashboard/Analytics must pass real `data` prop aggregated from API.
// ---------------------------------------------------------------------------
export const PREVIEW_SIX_MONTHS_DATA: ChartDataPoint[] = [
  { label: 'Mar', fullDate: 'Maret 2026', income: 14000000, expense: 8200000 },
  { label: 'Apr', fullDate: 'April 2026', income: 15200000, expense: 8700000 },
  { label: 'Mei', fullDate: 'Mei 2026', income: 16240000, expense: 9850000 },
  { label: 'Jun', fullDate: 'Juni 2026', income: 14600000, expense: 7100000 },
  { label: 'Jul', fullDate: 'Juli 2026', income: 17800000, expense: 8900000 },
  { label: 'Agu', fullDate: 'Agustus 2026', income: 16900000, expense: 9100000 },
];

export const PREVIEW_THREE_MONTHS_DATA: ChartDataPoint[] = [
  { label: 'Jun', fullDate: 'Juni 2026', income: 14600000, expense: 7100000 },
  { label: 'Jul', fullDate: 'Juli 2026', income: 17800000, expense: 8900000 },
  { label: 'Agu', fullDate: 'Agustus 2026', income: 16900000, expense: 9100000 },
];

export const PREVIEW_SEVEN_DAYS_DATA: ChartDataPoint[] = [
  { label: '25 Agu', fullDate: 'Selasa, 25 Agu 2026', income: 2800000, expense: 1100000 },
  { label: '26 Agu', fullDate: 'Rabu, 26 Agu 2026', income: 1900000, expense: 950000 },
  { label: '27 Agu', fullDate: 'Kamis, 27 Agu 2026', income: 2500000, expense: 1400000 },
  { label: '28 Agu', fullDate: 'Jumat, 28 Agu 2026', income: 3100000, expense: 1200000 },
  { label: '29 Agu', fullDate: 'Sabtu, 29 Agu 2026', income: 4800000, expense: 2300000 },
  { label: '30 Agu', fullDate: 'Minggu, 30 Agu 2026', income: 3600000, expense: 1800000 },
  { label: '31 Agu', fullDate: 'Senin, 31 Agu 2026', income: 5200000, expense: 1900000 },
];

export const PREVIEW_THIRTY_DAYS_DATA: ChartDataPoint[] = [
  { label: 'Mgg 1', fullDate: 'Minggu 1 (1 - 7 Agu 2026)', income: 4100000, expense: 2150000 },
  { label: 'Mgg 2', fullDate: 'Minggu 2 (8 - 14 Agu 2026)', income: 3900000, expense: 2300000 },
  { label: 'Mgg 3', fullDate: 'Minggu 3 (15 - 21 Agu 2026)', income: 4500000, expense: 2200000 },
  { label: 'Mgg 4', fullDate: 'Minggu 4 (22 - 31 Agu 2026)', income: 4400000, expense: 2450000 },
];

export const PREVIEW_ONE_YEAR_DATA: ChartDataPoint[] = [
  { label: 'Sep', fullDate: 'September 2025', income: 13500000, expense: 7800000 },
  { label: 'Okt', fullDate: 'Oktober 2025', income: 14100000, expense: 8100000 },
  { label: 'Nov', fullDate: 'November 2025', income: 13800000, expense: 7900000 },
  { label: 'Des', fullDate: 'Desember 2025', income: 16500000, expense: 10500000 },
  { label: 'Jan', fullDate: 'Januari 2026', income: 14200000, expense: 8000000 },
  { label: 'Feb', fullDate: 'Februari 2026', income: 14500000, expense: 8100000 },
  { label: 'Mar', fullDate: 'Maret 2026', income: 14000000, expense: 8200000 },
  { label: 'Apr', fullDate: 'April 2026', income: 15200000, expense: 8700000 },
  { label: 'Mei', fullDate: 'Mei 2026', income: 16240000, expense: 9850000 },
  { label: 'Jun', fullDate: 'Juni 2026', income: 14600000, expense: 7100000 },
  { label: 'Jul', fullDate: 'Juli 2026', income: 17800000, expense: 8900000 },
  { label: 'Agu', fullDate: 'Agustus 2026', income: 16900000, expense: 9100000 },
];

// Deprecated aliases — for backwards compat only (landing preview).
// @deprecated Use PREVIEW_* instead. Not used by production pages.
export const SIX_MONTHS_DATA = PREVIEW_SIX_MONTHS_DATA;
export const THREE_MONTHS_DATA = PREVIEW_THREE_MONTHS_DATA;
export const SEVEN_DAYS_DATA = PREVIEW_SEVEN_DAYS_DATA;
export const THIRTY_DAYS_DATA = PREVIEW_THIRTY_DAYS_DATA;
export const ONE_YEAR_DATA = PREVIEW_ONE_YEAR_DATA;

interface IncomeExpenseChartProps {
  data?: ChartDataPoint[] | null;
  isLoading?: boolean;
  error?: string | null;
  variant?: 'dashboard' | 'analytics';
  title?: string;
  subtitle?: string;
  className?: string;
  defaultPeriod?: ChartPeriod;
  showSummary?: boolean;
  onPeriodChange?: (period: ChartPeriod) => void;
  period?: ChartPeriod;
}

export default function IncomeExpenseChart({
  data: dataProp,
  isLoading = false,
  error = null,
  variant = 'dashboard',
  title = 'Keseimbangan Pemasukan vs Pengeluaran',
  subtitle = 'Tren arus kas 6 bulan terakhir',
  className = '',
  defaultPeriod = '6 Bulan',
  showSummary = false,
  onPeriodChange,
  period: periodProp,
}: IncomeExpenseChartProps) {
  const [internalPeriod, setInternalPeriod] = useState<ChartPeriod>(defaultPeriod);
  const controlled = periodProp !== undefined;
  const period = controlled ? periodProp! : internalPeriod;

  const handlePeriodChange = (p: ChartPeriod) => {
    if (!controlled) setInternalPeriod(p);
    onPeriodChange?.(p);
  };

  // Data source: if parent provides `data`, use it (real). Otherwise use preview (landing only).
  const isPreviewMode = dataProp === undefined;
  const data: ChartDataPoint[] = useMemo(() => {
    if (dataProp !== undefined) {
      return dataProp ?? [];
    }
    // Preview mode — landing marketing only
    switch (period) {
      case '7 Hari':
        return PREVIEW_SEVEN_DAYS_DATA;
      case '30 Hari':
        return PREVIEW_THIRTY_DAYS_DATA;
      case '3 Bulan':
        return PREVIEW_THREE_MONTHS_DATA;
      case '1 Tahun':
        return PREVIEW_ONE_YEAR_DATA;
      case '6 Bulan':
      default:
        return PREVIEW_SIX_MONTHS_DATA;
    }
  }, [dataProp, period]);

  const hasData = data.length > 0 && data.some((d) => d.income !== 0 || d.expense !== 0);

  // Compute summary averages from real data prop
  const { avgIncome, avgExpense, avgDiff } = useMemo(() => {
    if (!data.length) return { avgIncome: 0, avgExpense: 0, avgDiff: 0 };
    const totalInc = data.reduce((acc, curr) => acc + curr.income, 0);
    const totalExp = data.reduce((acc, curr) => acc + curr.expense, 0);
    const avgInc = Math.round(totalInc / data.length);
    const avgExp = Math.round(totalExp / data.length);
    return {
      avgIncome: avgInc,
      avgExpense: avgExp,
      avgDiff: avgInc - avgExp,
    };
  }, [data]);

  // Max value from real data only — no hardcoded fallback
  const maxY = useMemo(() => {
    if (!hasData) return 0;
    const maxVal = Math.max(...data.map((d) => Math.max(d.income, d.expense)));
    if (maxVal === 0) return 0;
    return Math.ceil(maxVal / 5000000) * 5000000;
  }, [data, hasData]);

  const yAxisTicks = useMemo(() => {
    if (maxY === 0) return [0];
    const ticks: number[] = [];
    const step = maxY / 4;
    for (let i = 0; i <= maxY; i += step) {
      ticks.push(i);
    }
    return ticks;
  }, [maxY]);

  const heightClass = variant === 'analytics' ? 'h-[320px] sm:h-[350px]' : 'h-[280px] sm:h-[310px]';

  return (
    <div
      className={`p-6 sm:p-7 rounded-[24px] bg-white border border-[#E8EAF2]/80 shadow-[0_4px_24px_rgba(36,38,54,0.03)] space-y-4 ${className}`}
      aria-label={title}
    >
      {/* ========================================================================= */}
      {/* 1. HEADER & CONTROLS                                                      */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Title & Subtitle Badge */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <h3 className="text-base sm:text-lg font-extrabold text-[#242636] tracking-tight">
            {title}
          </h3>
          <span className="px-2.5 py-0.5 rounded-full bg-[#F4F5FA] border border-[#E8EAF2]/60 text-[11px] font-semibold text-[#757A95]">
            {period === '6 Bulan' ? '6 Bulan Terakhir' : period}
          </span>
        </div>

        {/* Legend & Custom Period Select */}
        <div className="flex items-center gap-4 sm:gap-5 self-end sm:self-auto">
          <ChartLegend />
          <ChartPeriodSelect
            value={period}
            onChange={handlePeriodChange}
            options={
              variant === 'analytics'
                ? ['7 Hari', '30 Hari', '3 Bulan', '6 Bulan', '1 Tahun']
                : ['6 Bulan']
            }
          />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. STATES & RECHARTS CANVAS                                               */}
      {/* ========================================================================= */}
      {isLoading ? (
        <div className={`w-full ${heightClass} rounded-2xl bg-[#F8F9FD] border border-black/[0.03] animate-pulse flex items-center justify-center`}>
          <div className="text-center space-y-2">
            <div className="w-8 h-8 rounded-full bg-[#E4E2FB] animate-pulse mx-auto" />
            <p className="text-xs text-[#757A95] font-medium">Memuat data arus kas...</p>
          </div>
        </div>
      ) : error ? (
        <div className={`w-full ${heightClass} rounded-2xl bg-[#FEF3F2] border border-[#FCE2E0] flex items-center justify-center`}>
          <div className="text-center space-y-1.5 px-4">
            <p className="text-xs font-bold text-[#D94F4F]">Gagal memuat data chart</p>
            <p className="text-xs text-[#757A95]">{error}</p>
          </div>
        </div>
      ) : !hasData ? (
        <div className={`w-full ${heightClass} rounded-2xl bg-[#F8F9FD] border border-black/[0.03] flex items-center justify-center`}>
          <div className="text-center space-y-2 px-4">
            <p className="text-sm font-bold text-[#242636]">Belum ada data arus kas</p>
            <p className="text-xs text-[#757A95] max-w-sm mx-auto">Catat transaksi pertama untuk melihat tren pemasukan dan pengeluaran Anda di sini.</p>
            <Link href="/app/transactions" className="inline-flex items-center gap-1.5 mt-1 text-xs font-bold text-[#7C7CE6] hover:text-[#6A69D6] transition-colors">
              Catat transaksi pertama
            </Link>
          </div>
        </div>
      ) : (
        <div className={`w-full pt-2 ${heightClass}`}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 12, right: 12, left: -10, bottom: 4 }}
            >
              <defs>
                <linearGradient id="finaiIncomeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7C7CE6" stopOpacity={0.14} />
                  <stop offset="90%" stopColor="#7C7CE6" stopOpacity={0.01} />
                  <stop offset="100%" stopColor="#7C7CE6" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="finaiExpenseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7FA6FF" stopOpacity={0.14} />
                  <stop offset="90%" stopColor="#7FA6FF" stopOpacity={0.01} />
                  <stop offset="100%" stopColor="#7FA6FF" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="4 4"
                stroke="#E8EAF2"
                vertical={false}
                horizontal={true}
              />

              <XAxis
                dataKey="label"
                stroke="#8A8FA8"
                fontSize={12}
                fontWeight={500}
                tickLine={false}
                axisLine={false}
                dy={10}
              />

              <YAxis
                domain={[0, maxY]}
                ticks={yAxisTicks}
                stroke="#8A8FA8"
                fontSize={12}
                fontWeight={500}
                tickLine={false}
                axisLine={false}
                dx={-4}
                tickFormatter={(v: number) => {
                  if (v === 0) return '0Jt';
                  return `${Math.round(v / 1000000)}Jt`;
                }}
              />

              <Tooltip
                content={<FinancialTooltip />}
                cursor={{
                  stroke: '#7C7CE6',
                  strokeWidth: 1.5,
                  strokeDasharray: '3 3',
                  strokeOpacity: 0.35,
                }}
              />

              <Area
                type="monotone"
                dataKey="income"
                name="Pemasukan"
                stroke="#7C7CE6"
                strokeWidth={2.8}
                fillOpacity={1}
                fill="url(#finaiIncomeGrad)"
                animationDuration={850}
                animationEasing="ease-out"
                dot={{
                  r: 4,
                  stroke: '#7C7CE6',
                  strokeWidth: 2,
                  fill: '#FFFFFF',
                }}
                activeDot={{
                  r: 6,
                  stroke: '#7C7CE6',
                  strokeWidth: 3,
                  fill: '#FFFFFF',
                }}
              />

              <Area
                type="monotone"
                dataKey="expense"
                name="Pengeluaran"
                stroke="#7FA6FF"
                strokeWidth={2.8}
                fillOpacity={1}
                fill="url(#finaiExpenseGrad)"
                animationDuration={850}
                animationEasing="ease-out"
                dot={{
                  r: 4,
                  stroke: '#7FA6FF',
                  strokeWidth: 2,
                  fill: '#FFFFFF',
                }}
                activeDot={{
                  r: 6,
                  stroke: '#7FA6FF',
                  strokeWidth: 3,
                  fill: '#FFFFFF',
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. OPTIONAL SUMMARY (FOR ANALYTICS PAGE)                                  */}
      {/* ========================================================================= */}
      {(showSummary || variant === 'analytics') && hasData && (
        <div className="pt-3 border-t border-[#E8EAF2]/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-6 flex-wrap">
            <span className="text-[#757A95]">
              Rata-rata pemasukan:{' '}
              <strong className="text-[#242636] font-bold tabular-nums">
                {formatIDR(avgIncome)}
              </strong>
            </span>
            <span className="text-[#757A95]">
              Rata-rata pengeluaran:{' '}
              <strong className="text-[#242636] font-bold tabular-nums">
                {formatIDR(avgExpense)}
              </strong>
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[#757A95]">Rata-rata selisih:</span>
            <span
              className={`font-black tabular-nums ${
                avgDiff >= 0 ? 'text-[#45B99A]' : 'text-[#E47777]'
              }`}
            >
              {avgDiff >= 0 ? '+' : '-'} {formatIDR(Math.abs(avgDiff))}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
