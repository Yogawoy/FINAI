'use client';

import React from 'react';
import { User, Pencil, ShieldCheck } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';

interface ProfileSectionProps {
  name: string;
  email: string;
  avatarUrl?: string;
  membershipStatus?: string;
  onEditProfile: () => void;
}

export default function ProfileSection({
  name,
  email,
  membershipStatus = 'FinAI Pro',
  onEditProfile,
}: ProfileSectionProps) {
  // Initials generator
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="space-y-2.5">
      <span className="text-[11px] font-bold text-[#757A95] uppercase tracking-wider block pl-1">
        Profil Pengguna
      </span>

      <GlassCard className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Avatar & User Details */}
        <div className="flex items-center gap-3.5">
          {/* Avatar Circle */}
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-[#7C7CE6] via-[#8C8BE8] to-[#D6E4FA] text-white flex items-center justify-center font-black text-base shadow-[0_4px_16px_rgba(124,124,230,0.25)] border-2 border-white shrink-0">
            {initials || <User size={22} />}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm sm:text-base font-extrabold text-[#242636]">
                {name}
              </h3>
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#EDEAFC] border border-[#E4E2FB] text-[10px] font-bold text-[#5F5ED4]">
                <ShieldCheck size={11} />
                <span>{membershipStatus}</span>
              </div>
            </div>
            <p className="text-xs text-[#757A95] font-medium">
              {email}
            </p>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={onEditProfile}
          className="h-9 px-4 rounded-xl bg-white border border-[#E8EAF2] hover:border-[#7C7CE6]/50 hover:bg-[#FAFBFD] text-xs font-bold text-[#242636] shadow-2xs hover:shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <Pencil size={13} className="text-[#7C7CE6]" />
          <span>Edit Profil</span>
        </button>
      </GlassCard>
    </div>
  );
}
