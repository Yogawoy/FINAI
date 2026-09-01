'use client';

import React from 'react';
import Skeleton from './Skeleton';
import SkeletonCard from './SkeletonCard';
import SkeletonText from './SkeletonText';
import SkeletonIcon from './SkeletonIcon';
import SkeletonButton from './SkeletonButton';
import SkeletonChart from './SkeletonChart';

export default function DashboardSkeleton() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Memuat dashboard"
      className="space-y-8 max-w-7xl mx-auto"
    >
      {/* 1. Header Greeting & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton width={260} height={28} rounded="xl" />
          <Skeleton width={180} height={14} rounded="md" className="opacity-70" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton width={180} height={42} rounded="2xl" className="hidden sm:block" />
          <SkeletonIcon size={42} shape="rounded" />
          <SkeletonButton size="md" width={140} />
        </div>
      </div>

      {/* 2. Quick Actions Grid (8 circle/rounded action buttons) */}
      <SkeletonCard padding="p-6">
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-4 items-center justify-items-center">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <SkeletonIcon size={54} shape="rounded" />
              <Skeleton width={50} height={10} rounded="sm" className="opacity-60" />
            </div>
          ))}
        </div>
      </SkeletonCard>

      {/* 3. Ringkasan Finansial (2 Summary Cards) */}
      <div className="space-y-3">
        <Skeleton width={160} height={12} rounded="sm" className="opacity-60" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SkeletonCard padding="p-6">
            <div className="flex items-center justify-between">
              <Skeleton width={120} height={14} rounded="md" />
              <SkeletonIcon size={32} shape="rounded" />
            </div>
            <div className="mt-3 space-y-2">
              <Skeleton width={100} height={32} rounded="lg" />
              <Skeleton width={90} height={12} rounded="sm" />
              <Skeleton width="100%" height={8} rounded="full" />
            </div>
          </SkeletonCard>

          <SkeletonCard padding="p-6">
            <div className="flex items-center justify-between">
              <Skeleton width={120} height={14} rounded="md" />
              <SkeletonIcon size={32} shape="rounded" />
            </div>
            <div className="mt-3 space-y-2">
              <Skeleton width={110} height={32} rounded="lg" />
              <Skeleton width={140} height={12} rounded="sm" />
              <Skeleton width="100%" height={8} rounded="full" />
            </div>
          </SkeletonCard>
        </div>
      </div>

      {/* 4. Main Grid: Left Area (8 cols) & Right Column (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Cashflow Chart & Recent Transactions */}
        <div className="lg:col-span-8 space-y-8">
          {/* Cashflow Chart Card */}
          <SkeletonCard padding="p-6" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1.5">
                <Skeleton width={180} height={18} rounded="md" />
                <Skeleton width={220} height={12} rounded="sm" className="opacity-70" />
              </div>
              <Skeleton width={120} height={32} rounded="xl" />
            </div>
            <SkeletonChart height={260} type="bar" barsCount={6} />
          </SkeletonCard>

          {/* Recent Transactions List Card */}
          <SkeletonCard padding="p-6" className="space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton width={160} height={18} rounded="md" />
              <Skeleton width={80} height={14} rounded="md" />
            </div>
            <div className="divide-y divide-black/[0.04] space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="pt-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <SkeletonIcon size={44} shape="rounded" />
                    <div className="space-y-1.5">
                      <Skeleton width={140} height={14} rounded="md" />
                      <Skeleton width={90} height={10} rounded="sm" className="opacity-70" />
                    </div>
                  </div>
                  <Skeleton width={95} height={18} rounded="md" />
                </div>
              ))}
            </div>
          </SkeletonCard>
        </div>

        {/* Right Column: Wallet Card & FinAI Insight */}
        <div className="lg:col-span-4 space-y-6">
          {/* Wallet Card Placeholder */}
          <div className="h-52 rounded-[28px] bg-white border border-black/[0.05] p-6 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <Skeleton width={80} height={16} rounded="md" />
              <Skeleton width={45} height={20} rounded="md" />
            </div>
            <div className="space-y-2">
              <Skeleton width={60} height={10} rounded="sm" className="opacity-60" />
              <Skeleton width={180} height={28} rounded="lg" />
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-black/[0.04]">
              <Skeleton width={100} height={12} rounded="sm" />
              <Skeleton width={70} height={12} rounded="sm" />
            </div>
          </div>

          {/* FinAI Smart Insight Card */}
          <SkeletonCard padding="p-6" className="space-y-4 border-[#7C7CE6]/20 bg-[#FBFBFE]">
            <div className="flex items-center gap-2">
              <SkeletonIcon size={28} shape="rounded" />
              <Skeleton width={110} height={14} rounded="md" />
            </div>
            <SkeletonText lines={3} widths={['100%', '90%', '75%']} lineHeight={11} gap="gap-2" />
            <SkeletonButton size="sm" width="100%" />
          </SkeletonCard>
        </div>
      </div>
    </div>
  );
}
