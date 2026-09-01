'use client';

import React from 'react';
import Skeleton from './Skeleton';

interface SkeletonIconProps {
  size?: number | string;
  shape?: 'circle' | 'rounded' | 'square';
  className?: string;
}

export default function SkeletonIcon({
  size = 40,
  shape = 'rounded',
  className = '',
}: SkeletonIconProps) {
  const roundedType =
    shape === 'circle' ? 'full' : shape === 'square' ? 'md' : '2xl';

  return (
    <Skeleton
      width={size}
      height={size}
      rounded={roundedType}
      className={`shrink-0 ${className}`}
    />
  );
}
