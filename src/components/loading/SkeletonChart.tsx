'use client';

import React from 'react';
import Skeleton from './Skeleton';

interface SkeletonChartProps {
  height?: number | string;
  type?: 'bar' | 'line' | 'donut';
  barsCount?: number;
  className?: string;
}

export default function SkeletonChart({
  height = 240,
  type = 'bar',
  barsCount = 7,
  className = '',
}: SkeletonChartProps) {
  const barHeights = [45, 75, 60, 90, 55, 80, 65, 40, 85, 70, 50, 95];

  if (type === 'donut') {
    return (
      <div
        className={`flex items-center justify-center p-6 ${className}`}
        style={{ height: typeof height === 'number' ? `${height}px` : height }}
      >
        <div className="relative flex items-center justify-center">
          <Skeleton width={160} height={160} rounded="full" />
          <div className="absolute w-20 h-20 bg-white rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col justify-between p-4 space-y-4 ${className}`}
      style={{ height: typeof height === 'number' ? `${height}px` : height }}
    >
      {/* Top Header / Legend Placeholders */}
      <div className="flex items-center justify-between">
        <Skeleton width={100} height={14} rounded="md" />
        <div className="flex items-center gap-2">
          <Skeleton width={40} height={10} rounded="sm" />
          <Skeleton width={40} height={10} rounded="sm" />
        </div>
      </div>

      {/* Chart Bars / Columns Area */}
      <div className="flex-1 flex items-end justify-between gap-3 px-2 pt-4 pb-2 border-b border-black/[0.04]">
        {Array.from({ length: barsCount }).map((_, i) => {
          const h = barHeights[i % barHeights.length];
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
              <Skeleton
                width="80%"
                height={`${h}%`}
                rounded="lg"
                className="opacity-80"
              />
            </div>
          );
        })}
      </div>

      {/* X-Axis Placeholders */}
      <div className="flex items-center justify-between px-2">
        {Array.from({ length: barsCount }).map((_, i) => (
          <Skeleton key={i} width={24} height={10} rounded="sm" className="opacity-60" />
        ))}
      </div>
    </div>
  );
}
