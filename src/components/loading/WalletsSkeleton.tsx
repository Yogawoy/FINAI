'use client';

import React from 'react';
import Skeleton from './Skeleton';
import SkeletonCard from './SkeletonCard';
import SkeletonIcon from './SkeletonIcon';
import SkeletonButton from './SkeletonButton';

export default function WalletsSkeleton() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Memuat daftar dompet"
      className="space-y-8 max-w-7xl mx-auto"
    >
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton width={180} height={28} rounded="xl" />
          <Skeleton width={240} height={14} rounded="md" className="opacity-70" />
        </div>
        <div className="flex items-center gap-3">
          <SkeletonIcon size={42} shape="rounded" />
          <SkeletonButton size="md" width={150} />
        </div>
      </div>

      {/* 2. Total Balance Hero Card */}
      <div className="p-6 sm:p-8 rounded-[30px] bg-white border border-black/[0.05] shadow-2xs space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton width={110} height={12} rounded="sm" className="opacity-70" />
              <Skeleton width={90} height={18} rounded="full" />
            </div>
            <Skeleton width={260} height={40} rounded="lg" />
            <Skeleton width={320} height={12} rounded="sm" className="opacity-60" />
          </div>

          {/* 4 Mini Breakdown Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 shrink-0">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="p-3.5 rounded-2xl bg-[#F8F9FD] border border-black/[0.04] space-y-1.5 min-w-[110px]"
              >
                <Skeleton width={60} height={10} rounded="sm" className="opacity-60" />
                <Skeleton width={90} height={14} rounded="md" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Wallet Cards Grid (3 Cards + 1 Add Card) */}
      <div className="space-y-4">
        <Skeleton width={140} height={14} rounded="sm" className="opacity-70" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-56 rounded-[28px] bg-white border border-black/[0.05] p-6 shadow-xs flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <Skeleton width={90} height={16} rounded="md" />
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
          ))}

          {/* Add Wallet Card Placeholder */}
          <div className="h-56 rounded-[28px] border-2 border-dashed border-black/[0.08] p-6 flex flex-col items-center justify-center gap-3">
            <SkeletonIcon size={44} shape="rounded" />
            <Skeleton width={120} height={14} rounded="md" />
            <Skeleton width={160} height={10} rounded="sm" className="opacity-60" />
          </div>
        </div>
      </div>

      {/* 4. Table / List of Wallets */}
      <SkeletonCard padding="p-6" className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton width={160} height={16} rounded="md" />
          <Skeleton width={100} height={12} rounded="sm" className="opacity-60" />
        </div>
        <div className="divide-y divide-black/[0.04]">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <SkeletonIcon size={40} shape="rounded" />
                <div className="space-y-1">
                  <Skeleton width={130} height={14} rounded="md" />
                  <Skeleton width={80} height={10} rounded="sm" className="opacity-60" />
                </div>
              </div>
              <div className="text-right space-y-1">
                <Skeleton width={100} height={16} rounded="md" />
                <Skeleton width={70} height={10} rounded="sm" className="opacity-60 ml-auto" />
              </div>
            </div>
          ))}
        </div>
      </SkeletonCard>
    </div>
  );
}
