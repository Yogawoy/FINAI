'use client';

import React from 'react';
import { CircleCheck } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { BudgetCategory } from '@/types';
import { formatIDR } from '@/data/mockData';
import { getCategoryIconComponent, getCategoryColorTheme } from './BudgetRow';

interface BudgetSuccessModalProps {
  budget: BudgetCategory | null;
  isOpen: boolean;
  onClose: () => void;
  onCreateAnother: () => void;
}

export default function BudgetSuccessModal({
  budget,
  isOpen,
  onClose,
  onCreateAnother,
}: BudgetSuccessModalProps) {
  if (!budget) return null;

  const colorTheme = getCategoryColorTheme(budget.category);
  const periodLabel =
    budget.period === 'weekly' ? 'Anggaran Mingguan' : budget.period === 'custom' ? 'Anggaran Kustom' : 'Anggaran Bulanan';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="sm"
      hideHeader
      className="p-6 sm:p-7 space-y-5"
    >
      <div className="space-y-5 text-center relative">
        {/* Top Circular Success Checkmark Badge */}
        <div className="relative pt-1">
          <div className="w-16 h-16 rounded-full bg-[#E9F7F2] border border-[#A7E3D0] text-[#1B7354] flex items-center justify-center mx-auto shadow-[0_8px_20px_rgba(27,115,84,0.18)]">
            <CircleCheck size={32} strokeWidth={2.4} />
          </div>
        </div>

        {/* Title & Subtitle */}
        <div className="space-y-1">
          <h3 className="text-xl font-bold text-[#242636] tracking-tight">
            Anggaran Berhasil Dibuat
          </h3>
          <p className="text-xs text-[#757A95] leading-relaxed max-w-xs mx-auto">
            Anggaran baru telah berhasil dibuat dan mulai aktif.
          </p>
        </div>

        {/* Budget Card Preview */}
        <div className="p-4 rounded-2xl bg-[#F8F9FD] border border-black/[0.05] space-y-2.5 text-left">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-xl ${colorTheme.bg} ${colorTheme.text} border ${colorTheme.border} flex items-center justify-center shrink-0 shadow-2xs`}
              >
                {getCategoryIconComponent(budget.category, 16)}
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-[#242636]">
                  {budget.name}
                </h4>
                <p className="text-[11px] text-[#757A95] font-medium">
                  {periodLabel}
                </p>
              </div>
            </div>

            <span className="text-xs sm:text-sm font-black text-[#242636]">
              {formatIDR(budget.limit)}
            </span>
          </div>

          {/* Progress bar (0% terpakai) */}
          <div className="space-y-1 pt-1">
            <div className="w-full h-1.5 rounded-full bg-[#EAE9F5] overflow-hidden">
              <div style={{ width: '0%' }} className="h-full rounded-full bg-[#7C7CE6]" />
            </div>
            <div className="flex items-center justify-between text-[10px] text-[#757A95] font-semibold">
              <span className="text-[#5F5ED4]">0% terpakai</span>
              <span>100%</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 space-y-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#7C7CE6] to-[#8C8BE8] text-white font-bold text-sm shadow-[0_8px_20px_rgba(124,124,230,0.35)] hover:shadow-[0_10px_25px_rgba(124,124,230,0.45)] hover:brightness-105 active:scale-[0.99] transition-all cursor-pointer"
          >
            Lihat Anggaran Saya
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onCreateAnother();
            }}
            className="w-full py-1.5 text-center text-xs font-semibold text-[#757A95] hover:text-[#242636] transition-colors cursor-pointer"
          >
            Buat Anggaran Lainnya
          </button>
        </div>
      </div>
    </Modal>
  );
}
