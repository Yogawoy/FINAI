'use client';

import React from 'react';
import { CircleCheck, Clock, AlertTriangle, AlertCircle } from 'lucide-react';
import { GoalStatus } from '@/types';

interface GoalStatusBadgeProps {
  status: GoalStatus;
  size?: 'sm' | 'md';
}

export default function GoalStatusBadge({
  status,
  size = 'md',
}: GoalStatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'completed':
        return {
          label: 'Tercapai',
          bg: 'bg-[#EDEAFC] text-[#5F5ED4] border-[#7C7CE6]/30',
          icon: <CircleCheck size={size === 'sm' ? 11 : 13} strokeWidth={2.5} />,
        };
      case 'needs_attention':
        return {
          label: 'Perlu Perhatian',
          bg: 'bg-[#FFF3D6] text-[#92400E] border-[#FDE68A]',
          icon: <AlertTriangle size={size === 'sm' ? 11 : 13} />,
        };
      case 'behind':
        return {
          label: 'Tertinggal',
          bg: 'bg-[#FFF0EF] text-[#B83A38] border-[#FAC2BE]',
          icon: <AlertCircle size={size === 'sm' ? 11 : 13} />,
        };
      case 'on_track':
      default:
        return {
          label: 'Sesuai Rencana',
          bg: 'bg-[#E8F8F2] text-[#1B7354] border-[#B0E5D4]',
          icon: <Clock size={size === 'sm' ? 11 : 13} />,
        };
    }
  };

  const config = getStatusConfig();
  const padClass = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-bold border ${config.bg} ${padClass} shrink-0 select-none shadow-2xs`}
    >
      {config.icon}
      <span>{config.label}</span>
    </span>
  );
}
