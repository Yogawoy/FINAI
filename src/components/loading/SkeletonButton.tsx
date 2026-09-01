'use client';

import React from 'react';
import Skeleton from './Skeleton';

interface SkeletonButtonProps {
  size?: 'sm' | 'md' | 'lg' | 'icon';
  width?: string | number;
  className?: string;
}

export default function SkeletonButton({
  size = 'md',
  width,
  className = '',
}: SkeletonButtonProps) {
  const heightMap = {
    sm: 36,
    md: 44,
    lg: 52,
    icon: 40,
  };

  const defaultWidthMap = {
    sm: width || 90,
    md: width || 130,
    lg: width || 160,
    icon: 40,
  };

  return (
    <Skeleton
      height={heightMap[size]}
      width={defaultWidthMap[size]}
      rounded={size === 'icon' ? 'full' : '2xl'}
      className={`shrink-0 ${className}`}
    />
  );
}
