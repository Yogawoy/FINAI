'use client';

import React from 'react';
import Skeleton from './Skeleton';
import SkeletonIcon from './SkeletonIcon';
import SkeletonInput from './SkeletonInput';
import SkeletonButton from './SkeletonButton';

export default function WalletModalSkeleton() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Memuat modal dompet"
      className="p-6 sm:p-7 space-y-5"
    >
      {/* Modal Header */}
      <div className="flex items-start justify-between pb-2 border-b border-black/[0.04]">
        <div className="flex items-center gap-2.5">
          <SkeletonIcon size={36} shape="rounded" />
          <div className="space-y-1">
            <Skeleton width={150} height={18} rounded="md" />
            <Skeleton width={220} height={11} rounded="sm" className="opacity-70" />
          </div>
        </div>
        <SkeletonIcon size={32} shape="circle" />
      </div>

      {/* 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
        {/* Form Fields (7 cols) */}
        <div className="md:col-span-7 space-y-3.5">
          <SkeletonInput hasLabel height={42} />
          <div className="grid grid-cols-2 gap-3">
            <SkeletonInput hasLabel height={42} />
            <SkeletonInput hasLabel height={42} />
          </div>
          <SkeletonInput hasLabel height={42} />
          <div className="space-y-1.5">
            <Skeleton width={80} height={11} rounded="sm" className="opacity-80" />
            <div className="flex items-center gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} width={28} height={28} rounded="full" />
              ))}
            </div>
          </div>
        </div>

        {/* Live Preview Card (5 cols) */}
        <div className="md:col-span-5 space-y-3">
          <Skeleton width={90} height={12} rounded="sm" className="opacity-70" />
          <div className="h-44 rounded-[26px] bg-white border border-black/[0.06] p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <Skeleton width={70} height={14} rounded="md" />
              <Skeleton width={40} height={18} rounded="md" />
            </div>
            <div className="space-y-1.5">
              <Skeleton width={50} height={10} rounded="sm" className="opacity-60" />
              <Skeleton width={140} height={22} rounded="lg" />
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-black/[0.04]">
              <Skeleton width={80} height={10} rounded="sm" />
              <Skeleton width={60} height={10} rounded="sm" />
            </div>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex items-center gap-3 pt-3 border-t border-black/[0.04]">
        <SkeletonButton size="md" width="50%" />
        <SkeletonButton size="md" width="50%" />
      </div>
    </div>
  );
}
