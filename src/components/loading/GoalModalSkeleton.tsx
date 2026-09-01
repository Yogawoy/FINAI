'use client';

import React from 'react';
import Skeleton from './Skeleton';
import SkeletonIcon from './SkeletonIcon';
import SkeletonInput from './SkeletonInput';
import SkeletonButton from './SkeletonButton';

export default function GoalModalSkeleton() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Memuat modal target impian"
      className="p-6 sm:p-7 space-y-5"
    >
      {/* Modal Header */}
      <div className="flex items-start justify-between pb-2 border-b border-black/[0.04]">
        <div className="flex items-center gap-2.5">
          <SkeletonIcon size={36} shape="rounded" />
          <div className="space-y-1">
            <Skeleton width={160} height={18} rounded="md" />
            <Skeleton width={220} height={11} rounded="sm" className="opacity-70" />
          </div>
        </div>
        <SkeletonIcon size={32} shape="circle" />
      </div>

      {/* 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
        {/* Left Form (7 cols) */}
        <div className="md:col-span-7 space-y-3">
          {/* Nama Target */}
          <SkeletonInput hasLabel height={42} />

          {/* Dual Wallets */}
          <div className="grid grid-cols-2 gap-2.5">
            <SkeletonInput hasLabel height={42} />
            <SkeletonInput hasLabel height={42} />
          </div>

          {/* Kategori Pills */}
          <div className="space-y-1.5">
            <Skeleton width={80} height={11} rounded="sm" className="opacity-80" />
            <div className="grid grid-cols-4 gap-1.5">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} height={32} rounded="xl" />
              ))}
            </div>
          </div>

          {/* Target Dana & Dana Awal */}
          <div className="grid grid-cols-2 gap-2.5">
            <SkeletonInput hasLabel height={42} />
            <SkeletonInput hasLabel height={42} />
          </div>

          {/* Target Tanggal & Frekuensi */}
          <div className="grid grid-cols-2 gap-2.5">
            <SkeletonInput hasLabel height={42} />
            <SkeletonInput hasLabel height={42} />
          </div>

          {/* Warna Tema */}
          <div className="space-y-1.5">
            <Skeleton width={70} height={11} rounded="sm" className="opacity-80" />
            <div className="flex items-center gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} width={28} height={28} rounded="full" />
              ))}
            </div>
          </div>
        </div>

        {/* Right Live Preview Card (5 cols) */}
        <div className="md:col-span-5 p-4 sm:p-5 rounded-[24px] bg-white border border-black/[0.06] shadow-xs flex flex-col justify-between space-y-3">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-black/[0.04]">
              <Skeleton width={80} height={12} rounded="sm" className="opacity-70" />
              <Skeleton width={40} height={18} rounded="full" />
            </div>

            <div className="flex items-center gap-3">
              <SkeletonIcon size={44} shape="rounded" />
              <div className="space-y-1.5 min-w-0 flex-1">
                <Skeleton width="80%" height={16} rounded="md" />
                <Skeleton width="50%" height={10} rounded="sm" className="opacity-60" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Skeleton width={80} height={12} rounded="sm" />
                <Skeleton width={80} height={12} rounded="sm" />
              </div>
              <Skeleton width="100%" height={10} rounded="full" />
              <Skeleton width={110} height={10} rounded="sm" className="opacity-60" />
            </div>

            {/* Flow Placeholder */}
            <div className="p-3 rounded-2xl bg-[#F8F9FD] border border-black/[0.04] space-y-2">
              <Skeleton width={90} height={10} rounded="sm" className="opacity-60" />
              <div className="flex items-center justify-between">
                <Skeleton width={70} height={12} rounded="sm" />
                <Skeleton width={20} height={12} rounded="sm" />
                <Skeleton width={70} height={12} rounded="sm" />
              </div>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-[#F8F9FD] border border-black/[0.04] space-y-1.5">
            <Skeleton width={120} height={12} rounded="sm" />
            <Skeleton width={140} height={18} rounded="md" />
            <Skeleton width="100%" height={10} rounded="sm" className="opacity-60" />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 pt-3 border-t border-black/[0.04]">
        <SkeletonButton size="md" width="50%" />
        <SkeletonButton size="md" width="50%" />
      </div>
    </div>
  );
}
