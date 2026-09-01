'use client';

import React from 'react';
import Link from 'next/link';
import { LucideIcon } from 'lucide-react';

interface SidebarItemProps {
  label: string;
  href: string;
  icon: LucideIcon;
  isActive: boolean;
  isNested?: boolean;
  hasActivityDot?: boolean;
  onClick?: () => void;
}

export default function SidebarItem({
  label,
  href,
  icon: Icon,
  isActive,
  isNested = false,
  hasActivityDot = false,
  onClick,
}: SidebarItemProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={isActive ? 'page' : undefined}
      className={`group relative flex items-center justify-between h-11 px-3.5 rounded-[14px] text-xs font-semibold transition-colors duration-180 select-none ${
        isNested ? 'ml-3 sm:ml-3.5' : ''
      } ${
        isActive
          ? 'bg-[#7C7CE6] text-white shadow-[0_4px_14px_rgba(124,124,230,0.32)] border border-[#6867D4]/30'
          : 'text-[#757A95] hover:text-[#242636] hover:bg-[#F0EFFC]'
      }`}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <Icon
          size={18}
          strokeWidth={2}
          className={`shrink-0 transition-colors duration-180 ${
            isActive ? 'text-white' : 'text-[#757A95] group-hover:text-[#242636]'
          }`}
        />
        <span className="truncate">{label}</span>
      </div>

      {/* Subtle indicator dot (for AI Assistant or notifications) */}
      {hasActivityDot && (
        <span
          className={`w-2 h-2 rounded-full shrink-0 transition-colors ${
            isActive
              ? 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]'
              : 'bg-[#7C7CE6] shadow-[0_0_6px_rgba(124,124,230,0.6)] animate-pulse'
          }`}
          aria-hidden="true"
        />
      )}
    </Link>
  );
}
