'use client';

import React from 'react';
import Skeleton from './Skeleton';
import SkeletonCard from './SkeletonCard';
import SkeletonIcon from './SkeletonIcon';
import SkeletonButton from './SkeletonButton';

export default function BudgetsSkeleton() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Memuat anggaran"
      className="space-y-7 max-w-7xl mx-auto pb-16"
    >
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton width={180} height={28} rounded="xl" />
          <Skeleton width={260} height={14} rounded="md" className="opacity-70" />
        </div>
        <div className="flex items-center gap-2.5">
          <Skeleton width={140} height={42} rounded="2xl" />
          <SkeletonButton size="md" width={150} />
        </div>
      </div>

      {/* 2. Budget Overview Card */}
      <div className="p-6 sm:p-7 rounded-[30px] bg-white border border-black/[0.05] shadow-2xs space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton width={120} height={12} rounded="sm" className="opacity-70" />
              <Skeleton width={110} height={20} rounded="full" />
            </div>
            <Skeleton width={260} height={38} rounded="lg" />
            <Skeleton width={320} height={12} rounded="sm" className="opacity-60" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 shrink-0">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="p-3.5 rounded-2xl bg-[#F8F9FD] border border-black/[0.04] space-y-1.5 min-w-[120px]"
              >
                <Skeleton width={70} height={10} rounded="sm" className="opacity-60" />
                <Skeleton width={100} height={16} rounded="md" />
              </div>
            ))}
          </div>
        </div>

        {/* Big Overall Progress Bar */}
        <div className="space-y-2 pt-2 border-t border-black/[0.04]">
          <div className="flex items-center justify-between">
            <Skeleton width={140} height={12} rounded="sm" className="opacity-70" />
            <Skeleton width={50} height={12} rounded="sm" className="opacity-70" />
          </div>
          <Skeleton width="100%" height={12} rounded="full" />
        </div>
      </div>

      {/* 3. FinAI Insight Banner */}
      <div className="p-4 rounded-2xl bg-[#EDEAFC]/50 border border-[#7C7CE6]/20 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <SkeletonIcon size={36} shape="rounded" />
          <div className="space-y-1.5">
            <Skeleton width={180} height={14} rounded="md" />
            <Skeleton width={280} height={10} rounded="sm" className="opacity-70" />
          </div>
        </div>
        <Skeleton width={90} height={32} rounded="xl" />
      </div>

      {/* 4. Filters & Search */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Skeleton width={240} height={40} rounded="2xl" />
        <div className="flex items-center gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} width={75} height={34} rounded="full" />
          ))}
        </div>
      </div>

      {/* 5. Budget Cards List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} padding="p-5 sm:p-6" className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <SkeletonIcon size={44} shape="rounded" />
                <div className="space-y-1.5">
                  <Skeleton width={110} height={16} rounded="md" />
                  <Skeleton width={70} height={10} rounded="sm" className="opacity-60" />
                </div>
              </div>
              <Skeleton width={80} height={22} rounded="full" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton width={85} height={14} rounded="md" />
                <Skeleton width={85} height={14} rounded="md" />
              </div>
              <Skeleton width="100%" height={8} rounded="full" />
              <div className="flex items-center justify-between">
                <Skeleton width={70} height={10} rounded="sm" className="opacity-60" />
                <Skeleton width={40} height={10} rounded="sm" className="opacity-60" />
              </div>
            </div>
          </SkeletonCard>
        ))}
      </div>
    </div>
  );
}
