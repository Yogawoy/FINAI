'use client';

import React, { useState } from 'react';
import { ShieldCheck, MoreVertical } from 'lucide-react';
import SidebarPopover from './SidebarPopover';

interface SidebarProfileProps {
  name?: string;
  tier?: string;
  initials?: string;
  onLogout?: () => void;
}

export default function SidebarProfile({
  name = 'Yoga W.',
  tier = 'FinAI Pro Tier',
  initials = 'YW',
  onLogout,
}: SidebarProfileProps) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsPopoverOpen((prev) => !prev)}
        aria-expanded={isPopoverOpen}
        aria-haspopup="menu"
        className="w-full flex items-center justify-between p-2 rounded-2xl bg-white/70 hover:bg-white border border-[#E8EAF2] hover:border-[#7C7CE6]/40 shadow-xs transition-all duration-180 group cursor-pointer text-left select-none"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Avatar initials squircle */}
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#E4E2FB] via-[#D6E4FA] to-[#D0EFE5] flex items-center justify-center font-bold text-[#5F5ED4] text-xs shadow-2xs shrink-0 group-hover:scale-102 transition-transform">
            {initials}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-[#242636] truncate leading-none">
                {name}
              </span>
              <ShieldCheck size={12} className="text-[#1B7354] shrink-0" />
            </div>
            <span className="text-[10px] font-semibold text-[#757A95] block truncate mt-0.5 leading-none">
              {tier}
            </span>
          </div>
        </div>

        <span className="w-6 h-6 rounded-lg flex items-center justify-center text-[#757A95] group-hover:text-[#242636] transition-colors shrink-0">
          <MoreVertical size={14} />
        </span>
      </button>

      <SidebarPopover
        isOpen={isPopoverOpen}
        onClose={() => setIsPopoverOpen(false)}
        onLogout={onLogout}
      />
    </div>
  );
}
