'use client';

import React from 'react';
import Skeleton from './Skeleton';
import SkeletonCard from './SkeletonCard';
import SkeletonIcon from './SkeletonIcon';
import SkeletonChart from './SkeletonChart';

export default function AnalyticsSkeleton() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Memuat analisis keuangan"
      className="space-y-8 max-w-7xl mx-auto pb-16"
    >
      {/* 1. Header with Timeframe Pills */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton width={260} height={28} rounded="xl" />
          <Skeleton width={320} height={14} rounded="md" className="opacity-70" />
        </div>
        <div className="flex items-center gap-1.5 p-1 bg-white border border-black/[0.05] rounded-2xl">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} width={65} height={30} rounded="xl" />
          ))}
        </div>
      </div>

      {/* 2. Top 3 Core Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonCard key={i} padding="p-6" className="space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton width={130} height={12} rounded="sm" className="opacity-70" />
              <Skeleton width={55} height={20} rounded="full" />
            </div>
            <Skeleton width={120} height={32} rounded="lg" />
            <Skeleton width={180} height={12} rounded="sm" className="opacity-60" />
          </SkeletonCard>
        ))}
      </div>

      {/* 3. Main Cashflow Trend Chart */}
      <SkeletonCard padding="p-6 sm:p-8" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <Skeleton width={140} height={20} rounded="full" />
            <Skeleton width={280} height={22} rounded="md" />
          </div>
          <div className="flex items-center gap-4">
            <Skeleton width={80} height={14} rounded="md" />
            <Skeleton width={80} height={14} rounded="md" />
          </div>
        </div>
        <SkeletonChart height={280} type="bar" barsCount={6} />
      </SkeletonCard>

      {/* 4. Two Column Grid: Category Breakdown (6 cols) & Daily Spending (6 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Donut Category Breakdown (6 cols) */}
        <SkeletonCard padding="p-6" className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton width={160} height={18} rounded="md" />
            <Skeleton width={70} height={20} rounded="full" />
          </div>
          <SkeletonChart height={240} type="donut" />
        </SkeletonCard>

        {/* Daily Spending Trend (6 cols) */}
        <SkeletonCard padding="p-6" className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton width={180} height={18} rounded="md" />
            <Skeleton width={80} height={12} rounded="sm" className="opacity-60" />
          </div>
          <SkeletonChart height={240} type="bar" barsCount={7} />
        </SkeletonCard>
      </div>
    </div>
  );
}
