'use client';

import React, { useState } from 'react';
import { Download, FileSpreadsheet, FileCode, Check, CircleCheck } from 'lucide-react';
import Modal from '@/components/ui/Modal';

interface ExportDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (format: 'csv' | 'json', selectedDatasets: string[]) => void;
}

const DATASETS = [
  { id: 'transactions', label: 'Riwayat Transaksi', desc: 'Arus kas masuk & keluar' },
  { id: 'wallets', label: 'Dompet & Rekening', desc: 'Saldo kas & mutasi akun' },
  { id: 'budgets', label: 'Pos Anggaran', desc: 'Alokasi & realisasi pengeluaran' },
  { id: 'goals', label: 'Target Impian', desc: 'Progres & rencana setoran' },
];

export default function ExportDataModal({
  isOpen,
  onClose,
  onExport,
}: ExportDataModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<'csv' | 'json'>('csv');
  const [selectedDatasets, setSelectedDatasets] = useState<string[]>([
    'transactions',
    'wallets',
    'budgets',
    'goals',
  ]);

  const toggleDataset = (id: string) => {
    setSelectedDatasets((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };

  const handleExportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDatasets.length === 0) return;
    onExport(selectedFormat, selectedDatasets);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Export Data Keuangan"
      subtitle="Unduh cadangan data keuangan Anda dalam format standar"
      maxWidth="md"
    >
      <form onSubmit={handleExportSubmit} className="space-y-5 pt-2">
        {/* Dataset Selection */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-[#242636] block">
            Pilih Data yang Diexport
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {DATASETS.map((item) => {
              const isChecked = selectedDatasets.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggleDataset(item.id)}
                  className={`p-3 rounded-xl border text-left transition-all flex items-start justify-between cursor-pointer ${
                    isChecked
                      ? 'bg-[#EDEAFC]/50 border-[#7C7CE6] text-[#242636]'
                      : 'bg-white border-[#E8EAF2] text-[#757A95] hover:border-black/[0.12]'
                  }`}
                >
                  <div>
                    <span className="block text-xs font-bold">{item.label}</span>
                    <span className="block text-[10px] opacity-75 mt-0.5">{item.desc}</span>
                  </div>
                  <div
                    className={`w-4.5 h-4.5 rounded-md border flex items-center justify-center transition-colors shrink-0 mt-0.5 ${
                      isChecked
                        ? 'bg-[#7C7CE6] border-[#7C7CE6] text-white'
                        : 'border-[#CBD0E1] bg-white'
                    }`}
                  >
                    {isChecked && <Check size={11} strokeWidth={3} />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Format Selection */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-[#242636] block">
            Format Berkas
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setSelectedFormat('csv')}
              className={`p-3.5 rounded-xl border transition-all flex items-center gap-3 cursor-pointer ${
                selectedFormat === 'csv'
                  ? 'bg-[#EDEAFC]/50 border-[#7C7CE6] text-[#242636]'
                  : 'bg-white border-[#E8EAF2] text-[#757A95] hover:border-black/[0.12]'
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-[#EBF7F2] text-[#1B7354] flex items-center justify-center">
                <FileSpreadsheet size={16} />
              </div>
              <div className="text-left">
                <span className="block text-xs font-bold">CSV / Excel</span>
                <span className="block text-[10px] opacity-70">Spreadsheet</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setSelectedFormat('json')}
              className={`p-3.5 rounded-xl border transition-all flex items-center gap-3 cursor-pointer ${
                selectedFormat === 'json'
                  ? 'bg-[#EDEAFC]/50 border-[#7C7CE6] text-[#242636]'
                  : 'bg-white border-[#E8EAF2] text-[#757A95] hover:border-black/[0.12]'
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-[#EDEAFC] text-[#5F5ED4] flex items-center justify-center">
                <FileCode size={16} />
              </div>
              <div className="text-left">
                <span className="block text-xs font-bold">JSON Data</span>
                <span className="block text-[10px] opacity-70">Struktur baku</span>
              </div>
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-3 border-t border-[#E8EAF2]/80">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-10 rounded-xl bg-white border border-[#E8EAF2] hover:bg-[#FAFBFD] text-xs font-bold text-[#757A95] transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={selectedDatasets.length === 0}
            className="flex-1 h-10 rounded-xl bg-[#7C7CE6] hover:bg-[#6867D4] active:scale-98 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold text-white shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Download size={14} />
            <span>Unduh Berkas</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
