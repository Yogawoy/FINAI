'use client';

import React from 'react';
import Skeleton from './Skeleton';
import SkeletonIcon from './SkeletonIcon';
import SkeletonButton from './SkeletonButton';

export default function ReceiptSkeleton() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Memuat struk transaksi"
      className="p-6 sm:p-7 space-y-5"
    >
      {/* Receipt Top Header */}
      <div className="text-center space-y-1 pb-3 border-b border-black/[0.06]">
        <Skeleton width={60} height={12} rounded="sm" className="mx-auto opacity-70" />
        <Skeleton width={150} height={10} rounded="sm" className="mx-auto opacity-50" />
      </div>

      {/* Main Icon, Title & Amount */}
      <div className="text-center space-y-3">
        <SkeletonIcon size={56} shape="circle" className="mx-auto" />
        <Skeleton width={180} height={18} rounded="md" className="mx-auto" />
        <Skeleton width={140} height={28} rounded="lg" className="mx-auto" />
      </div>

      {/* 5 Row Detail Lines */}
      <div className="space-y-3 pt-2 border-t border-black/[0.04] text-xs">
        {['Tanggal', 'Waktu', 'Dompet', 'Kategori', 'Catatan'].map((label, idx) => (
          <div key={idx} className="flex items-center justify-between">
            <Skeleton width={60} height={12} rounded="sm" className="opacity-70" />
            <Skeleton width={idx === 4 ? 120 : 90} height={12} rounded="sm" />
          </div>
        ))}
      </div>

      {/* Transaction ID */}
      <div className="pt-3 border-t border-black/[0.04] flex items-center justify-between text-xs">
        <Skeleton width={80} height={10} rounded="sm" className="opacity-60" />
        <Skeleton width={110} height={10} rounded="sm" className="opacity-60" />
      </div>

      {/* Bottom Action Buttons */}
      <div className="flex items-center gap-3 pt-3">
        <SkeletonButton size="md" width="50%" />
        <SkeletonButton size="md" width="50%" />
      </div>
    </div>
  );
}
