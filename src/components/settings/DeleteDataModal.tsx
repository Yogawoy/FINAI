'use client';

import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import Modal from '@/components/ui/Modal';

interface DeleteDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelete: () => void;
}

export default function DeleteDataModal({
  isOpen,
  onClose,
  onConfirmDelete,
}: DeleteDataModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Hapus Data Keuangan?"
      maxWidth="md"
    >
      <div className="space-y-4 pt-1">
        {/* Warning Alert Banner */}
        <div className="p-4 rounded-2xl bg-[#FEF3F2] border border-[#FCE2E0] flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#FCE2E0] text-[#D94F4F] flex items-center justify-center shrink-0 mt-0.5">
            <AlertTriangle size={17} />
          </div>
          <div className="space-y-1 text-xs">
            <h4 className="font-bold text-[#D94F4F]">
              Tindakan Permanen
            </h4>
            <p className="text-[#757A95] leading-relaxed">
              Semua transaksi, anggaran, dan target impian akan dihapus dari akun FinAI Anda. Tindakan ini tidak dapat dibatalkan.
            </p>
          </div>
        </div>

        <p className="text-xs text-[#757A95] px-1 leading-relaxed">
          Sebelum melanjutkan, pastikan Anda telah mengekspor cadangan data keuangan jika masih membutuhkannya di masa mendatang.
        </p>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-3 border-t border-[#E8EAF2]/80">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-10 rounded-xl bg-white border border-[#E8EAF2] hover:bg-[#FAFBFD] text-xs font-bold text-[#757A95] hover:text-[#242636] transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirmDelete();
              onClose();
            }}
            className="flex-1 h-10 rounded-xl bg-[#D94F4F] hover:bg-[#C23B3B] active:scale-98 text-xs font-bold text-white shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Trash2 size={14} />
            <span>Hapus Data</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}
