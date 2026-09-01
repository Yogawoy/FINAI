'use client';

import React from 'react';
import Skeleton from './Skeleton';
import SkeletonCard from './SkeletonCard';
import SkeletonIcon from './SkeletonIcon';
import SkeletonButton from './SkeletonButton';

export default function TransactionsSkeleton() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Memuat riwayat transaksi"
      className="space-y-8 max-w-7xl mx-auto"
    >
      {/* 1. Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton width={220} height={28} rounded="xl" />
          <Skeleton width={180} height={14} rounded="md" className="opacity-70" />
        </div>
        <div className="flex items-center gap-3">
          <SkeletonButton size="md" width={160} />
        </div>
      </div>

      {/* 2. Summary: 4 Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} padding="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <Skeleton width={80} height={12} rounded="sm" className="opacity-70" />
              <SkeletonIcon size={24} shape="rounded" />
            </div>
            <div className="mt-2 space-y-1">
              <Skeleton width={120} height={24} rounded="lg" />
              <Skeleton width={70} height={10} rounded="sm" className="opacity-60" />
            </div>
          </SkeletonCard>
        ))}
      </div>

      {/* 3. Filters & Search Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-white border border-black/[0.05] shadow-2xs">
        <div className="flex-1 min-w-[200px]">
          <Skeleton width="100%" height={38} rounded="xl" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton width={80} height={36} rounded="xl" />
          <Skeleton width={80} height={36} rounded="xl" />
          <Skeleton width={110} height={36} rounded="xl" />
        </div>
      </div>

      {/* 4. AI Banner Placeholder */}
      <div className="p-4 rounded-2xl bg-[#EDEAFC]/50 border border-[#7C7CE6]/20 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <SkeletonIcon size={36} shape="rounded" />
          <div className="space-y-1.5">
            <Skeleton width={200} height={14} rounded="md" />
            <Skeleton width={280} height={10} rounded="sm" className="opacity-70" />
          </div>
        </div>
        <Skeleton width={90} height={32} rounded="xl" />
      </div>

      {/* 5. Transaction List (10 rows) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <Skeleton width={130} height={12} rounded="sm" className="opacity-70" />
          <Skeleton width={180} height={12} rounded="sm" className="opacity-60" />
        </div>

        <div className="rounded-[26px] bg-white border border-black/[0.05] divide-y divide-black/[0.04] shadow-2xs overflow-hidden">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="p-4 sm:px-6 sm:py-4 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <SkeletonIcon size={42} shape="circle" />
                <div className="space-y-1.5 min-w-0">
                  <Skeleton
                    width={i % 2 === 0 ? 160 : 130}
                    height={14}
                    rounded="md"
                  />
                  <div className="flex items-center gap-2">
                    <Skeleton width={70} height={10} rounded="sm" className="opacity-60" />
                    <Skeleton width={4} height={4} rounded="full" className="opacity-40" />
                    <Skeleton width={50} height={10} rounded="sm" className="opacity-60" />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <Skeleton
                  width={60}
                  height={22}
                  rounded="full"
                  className="hidden sm:block opacity-60"
                />
                <Skeleton
                  width={i % 2 === 0 ? 110 : 90}
                  height={18}
                  rounded="lg"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
