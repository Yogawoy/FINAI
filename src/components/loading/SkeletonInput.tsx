'use client';

import React from 'react';
import Skeleton from './Skeleton';

interface SkeletonInputProps {
  hasLabel?: boolean;
  className?: string;
  height?: number | string;
}

export default function SkeletonInput({
  hasLabel = true,
  className = '',
  height = 44,
}: SkeletonInputProps) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {hasLabel && (
        <Skeleton width="30%" height={12} rounded="sm" className="opacity-80" />
      )}
      <Skeleton width="100%" height={height} rounded="2xl" />
    </div>
  );
}
