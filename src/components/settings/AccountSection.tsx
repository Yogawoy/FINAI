'use client';

import React from 'react';
import { UserCheck, LogOut } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import SettingRow from './SettingRow';

interface AccountSectionProps {
  membershipTier?: string;
  onOpenLogoutModal: () => void;
}

export default function AccountSection({
  membershipTier = 'FinAI Pro',
  onOpenLogoutModal,
}: AccountSectionProps) {
  return (
    <div className="space-y-2.5">
      <span className="text-[11px] font-bold text-[#757A95] uppercase tracking-wider block pl-1">
        Sesi Akun
      </span>

      <GlassCard className="divide-y divide-[#E8EAF2]/60">
        {/* Status Akun */}
        <SettingRow
          icon={<UserCheck size={16} className="text-[#1B7354]" />}
          title="Tingkat Langganan"
          description="Akses penuh tanpa batas ke seluruh modul analisis dan asisten FinAI"
          badge={
            <span className="px-2 py-0.5 rounded-md bg-[#EDEAFC] border border-[#E4E2FB] text-[10px] font-bold text-[#5F5ED4]">
              {membershipTier}
            </span>
          }
          action={
            <span className="text-xs font-semibold text-[#1B7354] bg-[#EBF7F2] px-2.5 py-1 rounded-lg">
              Aktif Permanen
            </span>
          }
        />

        {/* Keluar */}
        <SettingRow
          icon={<LogOut size={16} className="text-[#757A95]" />}
          title="Keluar dari Akun"
          description="Akhiri sesi masuk Anda pada perangkat ini dengan aman"
          action={
            <button
              type="button"
              onClick={onOpenLogoutModal}
              className="h-8.5 px-3.5 rounded-xl bg-white border border-[#E8EAF2] hover:border-black/[0.15] hover:bg-[#FAFBFD] text-xs font-bold text-[#D94F4F] transition-colors cursor-pointer shadow-2xs flex items-center gap-1.5"
            >
              <LogOut size={13} />
              <span>Keluar</span>
            </button>
          }
        />
      </GlassCard>
    </div>
  );
}
