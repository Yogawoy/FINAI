'use client';

import React from 'react';
import { Trash2, AlertTriangle, AlertCircle } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { BudgetCategory } from '@/types';
import { formatIDR } from '@/lib/format';
import { getCategoryIconComponent, getCategoryColorTheme } from './BudgetRow';

interface DeleteBudgetDialogProps {
  budget: BudgetCategory | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelete: (budgetId: string) => void;
}

export default function DeleteBudgetDialog({
  budget,
  isOpen,
  onClose,
  onConfirmDelete,
}: DeleteBudgetDialogProps) {
  if (!budget) return null;

  const percentage = budget.limit > 0 ? Math.round((budget.spent / budget.limit) * 100) : 0;
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
      <div className="space-y-4 text-center relative">
        {/* Top Circular Warning Badge */}
        <div className="relative pt-1">
          <div className="w-16 h-16 rounded-full bg-[#FFF0EF] border border-[#FAD0CD] text-[#B83A38] flex items-center justify-center mx-auto shadow-[0_8px_20px_rgba(184,58,56,0.12)] relative">
            <Trash2 size={24} strokeWidth={2.2} />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#B83A38] text-white flex items-center justify-center border-2 border-white shadow-xs">
              <AlertTriangle size={11} />
            </div>
          </div>
        </div>

        {/* Title & Description */}
        <div className="space-y-1">
          <h3 className="text-lg sm:text-xl font-bold text-[#242636] tracking-tight">
            Hapus Anggaran?
          </h3>
          <p className="text-xs text-[#757A95] leading-relaxed max-w-xs mx-auto">
            Data anggaran ini akan dihapus secara permanen.
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

          {/* Progress bar preview */}
          <div className="space-y-1 pt-1">
            <div className="w-full h-1.5 rounded-full bg-[#EAE9F5] overflow-hidden">
              <div
                style={{ width: `${Math.min(percentage, 100)}%` }}
                className="h-full rounded-full bg-[#EF4444]"
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-[#757A95] font-semibold">
              <span className="text-[#EF4444] font-bold">{percentage}% terpakai</span>
              <span>100%</span>
            </div>
          </div>
        </div>

        {/* Notice Box */}
        <div className="p-3 rounded-xl bg-[#FFF8F0] border border-[#FDE68A] flex items-center gap-2 text-left">
          <AlertCircle size={15} className="text-[#D97706] shrink-0" />
          <p className="text-[11px] text-[#92400E] leading-relaxed">
            Catatan mutasi transaksi yang sudah ada tidak akan terhapus.
          </p>
        </div>

        {/* Action Buttons: Cancel & Delete */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-4 rounded-2xl bg-black/[0.04] hover:bg-black/[0.07] text-[#757A95] hover:text-[#242636] font-bold text-xs sm:text-sm transition-all cursor-pointer"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={() => {
              onConfirmDelete(budget.id);
              onClose();
            }}
            className="py-2.5 px-4 rounded-2xl bg-[#FCE2E0] hover:bg-[#FAD0CD] text-[#B83A38] font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 border border-[#FAC2BE] transition-all shadow-2xs active:scale-[0.98] cursor-pointer"
          >
            <Trash2 size={14} />
            <span>Hapus Anggaran</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}
