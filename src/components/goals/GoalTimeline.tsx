'use client';

import React from 'react';
import { Check, Circle } from 'lucide-react';

interface GoalTimelineProps {
  percentage: number;
  hasContributions: boolean;
}

export default function GoalTimeline({
  percentage,
  hasContributions,
}: GoalTimelineProps) {
  const milestones = [
    { label: 'Target Dibuat', reached: true },
    { label: 'Setoran Awal', reached: hasContributions || percentage > 0 },
    { label: '25%', reached: percentage >= 25 },
    { label: '50%', reached: percentage >= 50 },
    { label: '75%', reached: percentage >= 75 },
    { label: '100% Tercapai', reached: percentage >= 100 },
  ];

  return (
    <div className="space-y-3">
      <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#757A95]">
        Milestone & Progres Target
      </h4>

      <div className="p-4 rounded-2xl bg-[#F8F9FD] border border-black/[0.05]">
        <div className="flex items-center justify-between relative">
          {/* Background Connecting Line */}
          <div className="absolute left-3 right-3 top-1/2 -translate-y-1/2 h-0.5 bg-[#EAE9F5] z-0" />

          {milestones.map((m, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center relative z-10 space-y-1"
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${
                  m.reached
                    ? 'bg-[#7C7CE6] text-white shadow-2xs ring-3 ring-white'
                    : 'bg-[#F4F3F9] text-[#A0A4B8] border border-black/[0.1] ring-3 ring-white'
                }`}
              >
                {m.reached ? <Check size={12} strokeWidth={3} /> : <Circle size={8} />}
              </div>
              <span
                className={`text-[9px] sm:text-[10px] font-bold text-center select-none ${
                  m.reached ? 'text-[#242636]' : 'text-[#A0A4B8]'
                }`}
              >
                {m.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
