'use client';

import React from 'react';
import Skeleton from './Skeleton';
import SkeletonCard from './SkeletonCard';
import SkeletonIcon from './SkeletonIcon';
import SkeletonButton from './SkeletonButton';
import SkeletonText from './SkeletonText';

export default function AIChatSkeleton() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Memuat asisten AI"
      className="space-y-6 max-w-4xl mx-auto pb-16"
    >
      {/* 1. Header with AI Core Status Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton width={180} height={28} rounded="xl" />
            <Skeleton width={80} height={20} rounded="full" />
          </div>
          <Skeleton width={300} height={14} rounded="md" className="opacity-70" />
        </div>
        <SkeletonIcon size={44} shape="circle" />
      </div>

      {/* 2. Main Chat Conversation Container */}
      <SkeletonCard padding="p-5 sm:p-7" className="min-h-[480px] flex flex-col justify-between space-y-6">
        {/* Chat Messages Stream */}
        <div className="space-y-6">
          {/* AI Message 1 */}
          <div className="flex items-start gap-3 max-w-[85%]">
            <SkeletonIcon size={38} shape="circle" />
            <div className="p-4 rounded-2xl bg-[#F8F9FD] border border-black/[0.04] space-y-2.5 flex-1">
              <SkeletonText lines={3} widths={['100%', '85%', '60%']} lineHeight={12} />
              <div className="flex items-center gap-2 pt-1">
                <Skeleton width={80} height={22} rounded="full" />
                <Skeleton width={90} height={22} rounded="full" />
              </div>
            </div>
          </div>

          {/* User Message 1 (Right aligned) */}
          <div className="flex items-start gap-3 max-w-[75%] ml-auto justify-end">
            <div className="p-4 rounded-2xl bg-[#EDEAFC]/60 border border-[#7C7CE6]/20 space-y-2">
              <Skeleton width={200} height={12} rounded="sm" />
              <Skeleton width={140} height={12} rounded="sm" />
            </div>
            <SkeletonIcon size={38} shape="circle" />
          </div>

          {/* AI Message 2 */}
          <div className="flex items-start gap-3 max-w-[85%]">
            <SkeletonIcon size={38} shape="circle" />
            <div className="p-4 rounded-2xl bg-[#F8F9FD] border border-black/[0.04] space-y-2.5 flex-1">
              <SkeletonText lines={4} widths={['100%', '92%', '80%', '45%']} lineHeight={12} />
            </div>
          </div>
        </div>

        {/* 3. Preset Prompts Pills */}
        <div className="space-y-2 pt-4 border-t border-black/[0.04]">
          <Skeleton width={120} height={11} rounded="sm" className="opacity-60" />
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} width={i % 2 === 0 ? 180 : 150} height={32} rounded="xl" />
            ))}
          </div>
        </div>

        {/* 4. Chat Input Box */}
        <div className="flex items-center gap-2.5 pt-2">
          <Skeleton width="100%" height={48} rounded="2xl" />
          <SkeletonIcon size={48} shape="rounded" />
        </div>
      </SkeletonCard>
    </div>
  );
}
