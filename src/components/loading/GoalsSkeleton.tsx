'use client';

import React from 'react';
import Skeleton from './Skeleton';
import SkeletonCard from './SkeletonCard';
import SkeletonIcon from './SkeletonIcon';
import SkeletonButton from './SkeletonButton';

export default function GoalsSkeleton() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Memuat target impian"
      className="space-y-8 max-w-7xl mx-auto pb-16"
    >
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton width={190} height={28} rounded="xl" />
          <Skeleton width={260} height={14} rounded="md" className="opacity-70" />
        </div>
        <div className="flex items-center gap-3">
          <SkeletonButton size="md" width={140} />
        </div>
      </div>

      {/* 2. Dream Summary Card (4 metrics) */}
      <div className="p-6 sm:p-7 rounded-[30px] bg-white border border-black/[0.05] shadow-2xs space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton width={130} height={12} rounded="sm" className="opacity-70" />
              <Skeleton width={90} height={20} rounded="full" />
            </div>
            <Skeleton width={240} height={38} rounded="lg" />
            <Skeleton width={300} height={12} rounded="sm" className="opacity-60" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="p-3.5 rounded-2xl bg-[#F8F9FD] border border-black/[0.04] space-y-1.5 min-w-[110px]"
              >
                <Skeleton width={60} height={10} rounded="sm" className="opacity-60" />
                <Skeleton width={90} height={16} rounded="md" />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2 pt-2 border-t border-black/[0.04]">
          <div className="flex items-center justify-between">
            <Skeleton width={140} height={12} rounded="sm" className="opacity-70" />
            <Skeleton width={50} height={12} rounded="sm" className="opacity-70" />
          </div>
          <Skeleton width="100%" height={10} rounded="full" />
        </div>
      </div>

      {/* 3. Featured Goal Hero Card */}
      <div className="p-6 sm:p-7 rounded-[30px] bg-white border border-black/[0.05] shadow-2xs space-y-5">
        <div className="flex items-center justify-between">
          <Skeleton width={140} height={14} rounded="sm" className="opacity-70" />
          <Skeleton width={90} height={22} rounded="full" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center gap-4">
              <SkeletonIcon size={56} shape="rounded" />
              <div className="space-y-2">
                <Skeleton width={160} height={22} rounded="md" />
                <Skeleton width={220} height={12} rounded="sm" className="opacity-60" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton width={110} height={14} rounded="md" />
                <Skeleton width={110} height={14} rounded="md" />
              </div>
              <Skeleton width="100%" height={12} rounded="full" />
            </div>
          </div>

          <div className="lg:col-span-5 space-y-3 lg:pl-6 lg:border-l border-black/[0.05]">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-[#F8F9FD] space-y-1.5">
                <Skeleton width={70} height={10} rounded="sm" className="opacity-60" />
                <Skeleton width={100} height={14} rounded="md" />
              </div>
              <div className="p-3.5 rounded-2xl bg-[#F8F9FD] space-y-1.5">
                <Skeleton width={70} height={10} rounded="sm" className="opacity-60" />
                <Skeleton width={100} height={14} rounded="md" />
              </div>
            </div>
            <div className="flex items-center gap-2.5 pt-1">
              <SkeletonButton size="md" width="70%" />
              <SkeletonButton size="md" width="30%" />
            </div>
          </div>
        </div>
      </div>

      {/* 4. Section Header & Filters */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton width={150} height={18} rounded="md" />
          <Skeleton width={80} height={22} rounded="full" />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Skeleton width={240} height={38} rounded="2xl" />
          <div className="flex items-center gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} width={75} height={32} rounded="full" />
            ))}
          </div>
        </div>
      </div>

      {/* 5. Goal Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} padding="p-5 sm:p-6" className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <SkeletonIcon size={44} shape="rounded" />
                <div className="space-y-1.5">
                  <Skeleton width={120} height={16} rounded="md" />
                  <Skeleton width={80} height={10} rounded="sm" className="opacity-60" />
                </div>
              </div>
              <Skeleton width={75} height={22} rounded="full" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton width={90} height={14} rounded="md" />
                <Skeleton width={40} height={14} rounded="md" />
              </div>
              <Skeleton width="100%" height={8} rounded="full" />
              <div className="flex items-center justify-between">
                <Skeleton width={80} height={10} rounded="sm" className="opacity-60" />
                <Skeleton width={70} height={10} rounded="sm" className="opacity-60" />
              </div>
            </div>
          </SkeletonCard>
        ))}
      </div>
    </div>
  );
}
