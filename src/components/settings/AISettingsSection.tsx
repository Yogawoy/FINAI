'use client';

import React from 'react';
import { Sparkles, ShieldAlert, CheckCircle2, Info } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import SettingRow from './SettingRow';
import SettingToggle from './SettingToggle';

interface AISettingsSectionProps {
  personalization: boolean;
  onPersonalizationChange: (val: boolean) => void;
  actionConfirmation: boolean;
  onActionConfirmationChange: (val: boolean) => void;
}

export default function AISettingsSection({
  personalization,
  onPersonalizationChange,
  actionConfirmation,
  onActionConfirmationChange,
}: AISettingsSectionProps) {
  return (
    <div className="space-y-2.5">
      <span className="text-[11px] font-bold text-[#757A95] uppercase tracking-wider block pl-1">
        FinAI Assistant & Otomasi
      </span>

      <GlassCard className="divide-y divide-[#E8EAF2]/60 space-y-0">
        {/* 1. AI Personalization */}
        <SettingRow
          icon={<Sparkles size={16} />}
          title="Personalisasi Asisten AI"
          description="Gunakan konteks data keuangan Anda untuk menghasilkan saran dan analisis yang akurat"
          action={
            <SettingToggle
              checked={personalization}
              onChange={onPersonalizationChange}
              aria-label="Toggle Personalisasi AI"
            />
          }
        />

        {/* 2. Konfirmasi Sebelum Aksi */}
        <SettingRow
          icon={<ShieldAlert size={16} />}
          title="Konfirmasi Sebelum Eksekusi Aksi"
          description="Selalu tampilkan kartu konfirmasi sebelum FinAI mencatat transaksi atau memindahkan dana"
          action={
            <SettingToggle
              checked={actionConfirmation}
              onChange={onActionConfirmationChange}
              aria-label="Toggle Konfirmasi Tindakan"
            />
          }
        />

        {/* Compact Info Panel: Data Context */}
        <div className="p-4 sm:p-5 bg-[#FAFBFD]/80">
          <div className="flex items-start gap-2.5 text-xs">
            <Info size={15} className="text-[#7C7CE6] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-[#242636] block">
                Cakupan Data yang Digunakan Asisten
              </span>
              <p className="text-[11px] text-[#757A95] leading-relaxed">
                Asisten hanya membaca parameter buku kas untuk menyusun analisis:
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                {['Transaksi', 'Dompet Kas', 'Anggaran', 'Target Impian', 'Analisis Tren'].map(
                  (item) => (
                    <span
                      key={item}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-white border border-[#E8EAF2] text-[10px] font-bold text-[#5F5ED4]"
                    >
                      <CheckCircle2 size={10} className="text-[#1B7354]" />
                      <span>{item}</span>
                    </span>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
