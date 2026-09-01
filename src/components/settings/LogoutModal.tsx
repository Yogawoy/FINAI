'use client';

import React from 'react';
import { LogOut } from 'lucide-react';
import Modal from '@/components/ui/Modal';

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmLogout: () => void;
}

export default function LogoutModal({
  isOpen,
  onClose,
  onConfirmLogout,
}: LogoutModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Keluar dari FinAI?"
      maxWidth="md"
    >
      <div className="space-y-4 pt-1">
        <div className="p-4 rounded-2xl bg-[#FAFBFD] border border-[#E8EAF2] flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#EDEAFC] text-[#7C7CE6] flex items-center justify-center shrink-0">
            <LogOut size={18} />
          </div>
          <div className="space-y-0.5 text-xs">
            <h4 className="font-bold text-[#242636]">Konfirmasi Keluar Akun</h4>
            <p className="text-[#757A95] leading-relaxed">
              Apakah kamu yakin ingin keluar dari sesi akun ini? Data kamu tetap tersimpan aman.
            </p>
          </div>
        </div>

        {/* Buttons */}
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
              onConfirmLogout();
              onClose();
            }}
            className="flex-1 h-10 rounded-xl bg-[#242636] hover:bg-[#151620] active:scale-98 text-xs font-bold text-white shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <LogOut size={14} />
            <span>Keluar</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}
