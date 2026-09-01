'use client';

import React from 'react';
import Skeleton from './Skeleton';

interface SkeletonTextProps {
  lines?: number;
  className?: string;
  lineHeight?: string | number;
  gap?: string;
  widths?: (string | number)[];
}

const DEFAULT_WIDTHS = ['100%', '85%', '65%', '92%', '45%', '78%'];

export default function SkeletonText({
  lines = 2,
  className = '',
  lineHeight = 12,
  gap = 'gap-2',
  widths,
}: SkeletonTextProps) {
  return (
    <div className={`flex flex-col ${gap} ${className}`}>
      {Array.from({ length: lines }).map((_, i) => {
        const width =
          widths && widths[i] !== undefined
            ? widths[i]
            : DEFAULT_WIDTHS[i % DEFAULT_WIDTHS.length];
        return (
          <Skeleton
            key={i}
            height={lineHeight}
            width={width}
            rounded="md"
            className="opacity-90"
          />
        );
      })}
    </div>
  );
}
