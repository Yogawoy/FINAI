'use client';

import React from 'react';
import {
  Skeleton,
  SkeletonCard,
  SkeletonIcon,
} from '@/components/loading';

export default function SettingsSkeleton() {
  return (
    <div className="space-y-7 max-w-[1150px] mx-auto pb-12 animate-pulse">
      {/* 1. Header Skeleton */}
      <div className="flex items-center gap-3 pb-2 border-b border-[#E8EAF2]/80">
        <SkeletonIcon size={40} shape="rounded" />
        <div className="space-y-1.5">
          <Skeleton width={140} height={22} rounded="lg" />
          <Skeleton width={260} height={12} rounded="md" className="opacity-70" />
        </div>
      </div>

      {/* 2. Profile Section Skeleton */}
      <div className="space-y-2.5">
        <Skeleton width={110} height={12} rounded="md" />
        <SkeletonCard padding="p-5" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <SkeletonIcon size={52} shape="rounded" />
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton width={130} height={16} rounded="md" />
                <Skeleton width={70} height={18} rounded="full" />
              </div>
              <Skeleton width={180} height={12} rounded="sm" className="opacity-70" />
            </div>
          </div>
          <Skeleton width={110} height={36} rounded="xl" />
        </SkeletonCard>
      </div>

      {/* 3. Preferences Section Skeleton */}
      <div className="space-y-2.5">
        <Skeleton width={130} height={12} rounded="md" />
        <SkeletonCard padding="p-0" className="divide-y divide-[#E8EAF2]/60">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="py-4 px-6 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <SkeletonIcon size={32} shape="rounded" />
                <div className="space-y-1.5">
                  <Skeleton width={160} height={14} rounded="md" />
                  <Skeleton width={220} height={11} rounded="sm" className="opacity-60" />
                </div>
              </div>
              <Skeleton width={160} height={36} rounded="xl" />
            </div>
          ))}
        </SkeletonCard>
      </div>

      {/* 4. Notification Section Skeleton */}
      <div className="space-y-2.5">
        <Skeleton width={140} height={12} rounded="md" />
        <SkeletonCard padding="p-0" className="divide-y divide-[#E8EAF2]/60">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="py-4 px-6 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <SkeletonIcon size={32} shape="rounded" />
                <div className="space-y-1.5">
                  <Skeleton width={180} height={14} rounded="md" />
                  <Skeleton width={260} height={11} rounded="sm" className="opacity-60" />
                </div>
              </div>
              <Skeleton width={44} height={24} rounded="full" />
            </div>
          ))}
        </SkeletonCard>
      </div>

      {/* 5. Security & Data Skeleton */}
      <div className="space-y-2.5">
        <Skeleton width={120} height={12} rounded="md" />
        <SkeletonCard padding="p-0" className="divide-y divide-[#E8EAF2]/60">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="py-4 px-6 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <SkeletonIcon size={32} shape="rounded" />
                <div className="space-y-1.5">
                  <Skeleton width={150} height={14} rounded="md" />
                  <Skeleton width={240} height={11} rounded="sm" className="opacity-60" />
                </div>
              </div>
              <Skeleton width={110} height={32} rounded="xl" />
            </div>
          ))}
        </SkeletonCard>
      </div>
    </div>
  );
}
