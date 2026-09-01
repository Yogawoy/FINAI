'use client';

import React from 'react';

interface SettingRowProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  badge?: React.ReactNode;
  className?: string;
  isLast?: boolean;
}

export default function SettingRow({
  icon,
  title,
  description,
  action,
  badge,
  className = '',
}: SettingRowProps) {
  return (
    <div
      className={`py-4 sm:py-4.5 px-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-6 hover:bg-[#FAFBFD]/60 transition-colors ${className}`}
    >
      {/* Left: Icon & Text */}
      <div className="flex items-start gap-3 sm:gap-3.5 min-w-0">
        {icon && (
          <div className="w-8 h-8 rounded-xl bg-[#FAFBFD] border border-black/[0.04] text-[#7C7CE6] flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
            {icon}
          </div>
        )}
        <div className="space-y-0.5 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-xs sm:text-sm font-bold text-[#242636] tracking-tight">
              {title}
            </h4>
            {badge}
          </div>
          {description && (
            <p className="text-[11px] sm:text-xs text-[#757A95] leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </div>

      {/* Right: Action (Toggle, Dropdown, Button) */}
      {action && (
        <div className="shrink-0 self-end sm:self-center flex items-center justify-end">
          {action}
        </div>
      )}
    </div>
  );
}
