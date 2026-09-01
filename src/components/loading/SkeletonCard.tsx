'use client';

import React from 'react';

interface SkeletonCardProps {
  children?: React.ReactNode;
  className?: string;
  padding?: string;
}

export default function SkeletonCard({
  children,
  className = '',
  padding = 'p-5 sm:p-6',
}: SkeletonCardProps) {
  return (
    <div
      aria-hidden="true"
      className={`rounded-[26px] bg-white border border-black/[0.05] shadow-2xs ${padding} ${className}`}
    >
      {children}
    </div>
  );
}
