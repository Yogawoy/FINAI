'use client';

import React from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle } from 'lucide-react';
import { BudgetHealthStatus } from '@/types';

interface BudgetHealthProps {
  status?: BudgetHealthStatus | 'safe' | 'warning' | 'exceeded';
  percentage?: number;
  showDescription?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function computeBudgetHealth(percentage: number): BudgetHealthStatus {
  if (percentage > 90) return 'over_budget';
  if (percentage >= 70) return 'almost_there';
  return 'on_track';
}

export default function BudgetHealth({
  status,
  percentage,
  showDescription = false,
  size = 'md',
  className = '',
}: BudgetHealthProps) {
  const resolvedStatus: BudgetHealthStatus =
    status === 'safe'
      ? 'on_track'
      : status === 'warning'
      ? 'almost_there'
      : status === 'exceeded'
      ? 'over_budget'
      : status || (percentage !== undefined ? computeBudgetHealth(percentage) : 'on_track');

  const getConfig = () => {
    switch (resolvedStatus) {
      case 'over_budget':
        return {
          label: 'Melebihi Batas',
          description: 'Pengeluaran telah melebihi batas anggaran yang ditentukan.',
          bg: 'bg-[#FFF0EF]',
          text: 'text-[#B83A38]',
          border: 'border-[#FAD0CD]',
          icon: <AlertTriangle size={size === 'sm' ? 12 : 14} className="shrink-0 text-[#B83A38]" />,
        };
      case 'almost_there':
        return {
          label: 'Mendekati Batas',
          description: 'Pengeluaran mulai mendekati batas limit yang direncanakan.',
          bg: 'bg-[#FEF3C7]',
          text: 'text-[#92400E]',
          border: 'border-[#FDE68A]',
          icon: <AlertCircle size={size === 'sm' ? 12 : 14} className="shrink-0 text-[#D97706]" />,
        };
      default:
        return {
          label: 'Terkontrol Aman',
          description: 'Pengeluaran berjalan aman sesuai dengan rencana anggaran.',
          bg: 'bg-[#D0EFE5]',
          text: 'text-[#1B7354]',
          border: 'border-[#A7E3D0]',
          icon: <CheckCircle2 size={size === 'sm' ? 12 : 14} className="shrink-0 text-[#1B7354]" />,
        };
    }
  };

  const config = getConfig();

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <div
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold tracking-tight border shadow-2xs transition-colors w-fit ${
          config.bg
        } ${config.text} ${config.border} ${
          size === 'sm' ? 'text-[11px]' : size === 'lg' ? 'text-sm px-3.5 py-1.5' : 'text-xs'
        }`}
      >
        {config.icon}
        <span>{config.label}</span>
      </div>

      {showDescription && (
        <p className="text-xs text-[#757A95] leading-relaxed mt-0.5">{config.description}</p>
      )}
    </div>
  );
}
