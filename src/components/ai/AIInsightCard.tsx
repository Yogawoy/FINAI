'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, PieChart, Target, LineChart } from 'lucide-react';
import { AIInsightData } from '@/types';

interface AIInsightCardProps {
  insight: AIInsightData;
}

export default function AIInsightCard({ insight }: AIInsightCardProps) {
  const getIcon = () => {
    switch (insight.type) {
      case 'budget':
        return <PieChart size={15} className="text-[#5F5ED4]" />;
      case 'goal':
        return <Target size={15} className="text-[#1B7354]" />;
      case 'analytics':
      default:
        return <LineChart size={15} className="text-[#7C7CE6]" />;
    }
  };

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E8EAF2] shadow-[0_6px_24px_rgba(36,38,54,0.03)] space-y-3.5 max-w-md">
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-[#EDEAFC] flex items-center justify-center shrink-0">
          {getIcon()}
        </div>
        <div>
          <h4 className="text-xs sm:text-sm font-bold text-[#242636]">
            {insight.title}
          </h4>
          {insight.subtitle && (
            <p className="text-[11px] text-[#757A95]">{insight.subtitle}</p>
          )}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#E8EAF2]/70 text-xs">
        {insight.metrics.map((m, idx) => (
          <div key={idx} className="p-2.5 rounded-xl bg-[#FAFBFD] border border-black/[0.03]">
            <span className="block text-[10px] text-[#757A95] font-medium">{m.label}</span>
            <span className={`block font-bold tabular-nums mt-0.5 ${m.color || 'text-[#242636]'}`}>
              {m.value}
            </span>
          </div>
        ))}
      </div>

      {/* Action Link to Full Page */}
      {insight.actionHref && insight.actionLabel && (
        <div className="pt-1">
          <Link
            href={insight.actionHref}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#7C7CE6] hover:text-[#5F5ED4] transition-colors group"
          >
            <span>{insight.actionLabel}</span>
            <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      )}
    </div>
  );
}
