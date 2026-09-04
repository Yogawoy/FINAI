'use client';

import React from 'react';
import { Trash2, AlertTriangle, X } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { GoalItem } from '@/types';
import { formatIDR } from '@/lib/format';

interface DeleteGoalDialogProps {
  goal: GoalItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelete: (goalId: string) => void;
}

export default function DeleteGoalDialog({
  goal,
  isOpen,
  onClose,
  onConfirmDelete,
}: DeleteGoalDialogProps) {
  if (!goal) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="sm"
      hideHeader
      hideCloseButton={true}
      className="p-6 sm:p-7"
    >
      <div className="space-y-5 text-center relative">
        {/* Top Warning Icon */}
        <div className="relative pt-2">
          <div className="w-16 h-16 rounded-full bg-[#FFF0EF] border border-[#FAD0CD] text-[#B83A38] flex items-center justify-center mx-auto shadow-[0_8px_25px_rgba(184,58,56,0.12)] relative">
            <Trash2 size={24} strokeWidth={2.2} />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#B83A38] text-white flex items-center justify-center border-2 border-white shadow-xs">
              <AlertTriangle size={12} />
            </div>
          </div>
        </div>

        {/* Title & Description */}
        <div className="space-y-1">
          <h3 className="text-lg sm:text-xl font-bold text-[#242636] tracking-tight">
            Hapus Target?
          </h3>
          <p className="text-xs sm:text-[13px] text-[#757A95] leading-relaxed max-w-xs mx-auto">
            Target ini akan dihapus, tetapi riwayat transaksi tetap tersimpan.
          </p>
        </div>

        {/* Goal Brief Card */}
        <div className="p-3.5 rounded-2xl bg-[#FFF8F7] border border-[#FAC2BE]/60 text-left space-y-1">
          <span className="text-xs font-bold text-[#242636] block truncate">
            {goal.title}
          </span>
          <div className="text-xs font-extrabold text-[#B83A38] tabular-nums">
            {formatIDR(goal.currentAmount)}{' '}
            <span className="text-[11px] font-medium text-[#757A95]">
              / {formatIDR(goal.targetAmount)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-2xl bg-[#F4F3F9] hover:bg-[#EAE9F2] text-[#757A95] font-bold text-xs sm:text-sm transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirmDelete(goal.id);
              onClose();
            }}
            className="flex-1 py-3 px-4 rounded-2xl bg-[#FFF0EF] hover:bg-[#FCE2E0] border border-[#FAC2BE] text-[#B83A38] font-bold text-xs sm:text-sm shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Trash2 size={15} />
            <span>Hapus Target</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}
