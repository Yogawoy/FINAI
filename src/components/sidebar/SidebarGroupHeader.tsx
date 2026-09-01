'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';

interface SidebarGroupHeaderProps {
  title: string;
  isCollapsible?: boolean;
  isOpen?: boolean;
  controlsId?: string;
  onToggle?: () => void;
}

export default function SidebarGroupHeader({
  title,
  isCollapsible = true,
  isOpen = true,
  controlsId,
  onToggle,
}: SidebarGroupHeaderProps) {
  if (!isCollapsible) {
    return (
      <div className="px-3.5 py-1.5 select-none">
        <span className="text-[10px] sm:text-[11px] font-bold text-[#9296AD] uppercase tracking-[0.08em] block">
          {title}
        </span>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={isOpen}
      aria-controls={controlsId}
      className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-xl text-left transition-colors duration-180 hover:bg-[#F0EFFC] group cursor-pointer select-none"
    >
      <span className="text-[10px] sm:text-[11px] font-bold text-[#9296AD] group-hover:text-[#242636] uppercase tracking-[0.08em] transition-colors">
        {title}
      </span>

      <span
        className={`w-5 h-5 rounded-lg flex items-center justify-center text-[#9296AD] group-hover:text-[#242636] transition-transform duration-180 ease-out ${
          isOpen ? 'rotate-0 text-[#7C7CE6]' : '-rotate-90'
        }`}
      >
        <ChevronDown size={14} strokeWidth={2.5} />
      </span>
    </button>
  );
}
