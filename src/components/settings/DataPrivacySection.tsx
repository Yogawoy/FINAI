'use client';

import React, { useRef } from 'react';
import { Download, Upload, Trash2 } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import SettingRow from './SettingRow';

interface DataPrivacySectionProps {
  onOpenExportModal: () => void;
  onOpenDeleteModal: () => void;
  onImportSuccess: (fileName: string) => void;
}

export default function DataPrivacySection({
  onOpenExportModal,
  onOpenDeleteModal,
  onImportSuccess,
}: DataPrivacySectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Simulate reading file
    const reader = new FileReader();
    reader.onload = () => {
      onImportSuccess(file.name);
    };
    reader.readAsText(file);

    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-2.5">
      <span className="text-[11px] font-bold text-[#757A95] uppercase tracking-wider block pl-1">
        Cadangan Data & Privasi
      </span>

      <GlassCard className="divide-y divide-[#E8EAF2]/60">
        {/* 1. Export Data */}
        <SettingRow
          icon={<Download size={16} />}
          title="Export Cadangan Data"
          description="Unduh seluruh data transaksi, dompet, anggaran, dan target dalam format CSV atau JSON"
          action={
            <button
              type="button"
              onClick={onOpenExportModal}
              className="h-8.5 px-3.5 rounded-xl bg-white border border-[#E8EAF2] hover:border-[#7C7CE6]/50 hover:bg-[#FAFBFD] text-xs font-bold text-[#242636] transition-all cursor-pointer shadow-2xs flex items-center gap-1.5"
            >
              <Download size={13} className="text-[#7C7CE6]" />
              <span>Export Data</span>
            </button>
          }
        />

        {/* 2. Import & Pulihkan Data */}
        <SettingRow
          icon={<Upload size={16} className="text-[#5F5ED4]" />}
          title="Impor & Pulihkan Data"
          description="Pulihkan catatan keuangan dari berkas cadangan JSON yang telah diexport sebelumnya"
          action={
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,.csv"
                onChange={handleFileSelected}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="h-8.5 px-3.5 rounded-xl bg-white border border-[#E8EAF2] hover:border-[#7C7CE6]/50 hover:bg-[#FAFBFD] text-xs font-bold text-[#242636] transition-all cursor-pointer shadow-2xs flex items-center gap-1.5"
              >
                <Upload size={13} className="text-[#5F5ED4]" />
                <span>Pilih Berkas</span>
              </button>
            </div>
          }
        />

        {/* 3. Hapus Data Keuangan */}
        <SettingRow
          icon={<Trash2 size={16} className="text-[#D94F4F]" />}
          title="Hapus Data Keuangan"
          description="Bersihkan riwayat transaksi, alokasi anggaran, dan target impian secara permanen"
          action={
            <button
              type="button"
              onClick={onOpenDeleteModal}
              className="h-8.5 px-3.5 rounded-xl bg-[#FEF3F2] border border-[#FCE2E0] hover:bg-[#FEE4E2] text-xs font-bold text-[#D94F4F] transition-colors cursor-pointer shadow-2xs flex items-center gap-1.5"
            >
              <Trash2 size={13} />
              <span>Hapus Data</span>
            </button>
          }
        />
      </GlassCard>
    </div>
  );
}
