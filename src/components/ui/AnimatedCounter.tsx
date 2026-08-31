'use client';

import React, { useEffect, useState } from 'react';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  formatter?: (n: number) => string;
  className?: string;
  prefix?: string;
  suffix?: string;
}

export default function AnimatedCounter({
  value,
  duration = 800,
  formatter,
  className = '',
  prefix = '',
  suffix = '',
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState<number>(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const startValue = displayValue;
    const endValue = value;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(startValue + (endValue - startValue) * easeProgress);

      setDisplayValue(current);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    window.requestAnimationFrame(step);
  }, [value, duration]);

  const formatted = formatter
    ? formatter(displayValue)
    : displayValue.toLocaleString('id-ID');

  return (
    <span className={`tabular-numbers ${className}`}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
