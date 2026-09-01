'use client';

import React from 'react';
import {
  Receipt,
  Wallet,
  Calendar,
  Tag,
  CircleCheck,
  X,
  Check,
  ArrowRight,
  Target,
  AlertCircle,
} from 'lucide-react';
import { AIFinancialAction } from '@/types';
import { formatIDR } from '@/data/mockData';

interface AIFinancialActionCardProps {
  action: AIFinancialAction;
  onConfirm: (actionId: string) => void;
  onCancel: (actionId: string) => void;
}

export default function AIFinancialActionCard({
  action,
  onConfirm,
  onCancel,
}: AIFinancialActionCardProps) {
  const isGoal = action.type === 'goal_contribution';
  const isPending = action.status === 'pending';
  const isSuccess = action.status === 'confirmed' || action.status === 'success';
  const isCancelled = action.status === 'cancelled';

  // 1. Success State
  if (isSuccess) {
    return (
      <div className="p-4 rounded-2xl bg-[#EBF7F2] border border-[#D0EFE5] space-y-2 max-w-md shadow-2xs">
        <div className="flex items-center gap-2 text-[#1B7354]">
          <CircleCheck size={18} strokeWidth={2.5} />
          <span className="text-xs font-bold">
            {isGoal ? 'Setoran tabungan berhasil dicatat.' : 'Transaksi berhasil dicatat.'}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs pt-1 border-t border-[#D0EFE5]/80">
          <span className="font-semibold text-[#242636]">{action.title}</span>
          <span className={`font-black tabular-nums ${isGoal ? 'text-[#1B7354]' : 'text-[#D94F4F]'}`}>
            {isGoal ? '+' : '-'} {formatIDR(action.amount)}
          </span>
        </div>
      </div>
    );
  }

  // 2. Cancelled State
  if (isCancelled) {
    return (
      <div className="p-3 rounded-2xl bg-[#FAFBFD] border border-[#E8EAF2] text-xs font-medium text-[#757A95] flex items-center gap-2 max-w-md">
        <X size={15} />
        <span>Tindakan dibatalkan oleh pengguna.</span>
      </div>
    );
  }

  // 3. Pending Confirmation Card
  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E8EAF2] shadow-[0_6px_24px_rgba(36,38,54,0.04)] space-y-4 max-w-md">
      {/* Type Badge & Amount */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="px-2.5 py-0.5 rounded-full bg-[#EDEAFC] text-[#5F5ED4] text-[10px] font-bold uppercase tracking-wider">
            {isGoal ? 'Setoran Tabungan' : 'Pengeluaran'}
          </span>
          <h4 className="text-sm sm:text-base font-bold text-[#242636] mt-1.5">
            {action.title}
          </h4>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-[#757A95] font-semibold block">Nominal</span>
          <span className={`text-base sm:text-lg font-black tabular-nums ${isGoal ? 'text-[#1B7354]' : 'text-[#D94F4F]'}`}>
            {isGoal ? '+' : '-'} {formatIDR(action.amount)}
          </span>
        </div>
      </div>

      {/* Details Grid */}
      <div className="space-y-2 text-xs pt-2 border-t border-[#E8EAF2]/70">
        {/* Category if expense */}
        {action.category && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#757A95]">
              <Tag size={13} />
              <span>Kategori</span>
            </div>
            <span className="font-semibold text-[#242636]">{action.category}</span>
          </div>
        )}

        {/* Wallets */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#757A95]">
            <Wallet size={13} />
            <span>{isGoal ? 'Alur Dompet' : 'Dompet'}</span>
          </div>
          {isGoal ? (
            <div className="flex items-center gap-1.5 font-semibold text-[#242636]">
              <span>{action.sourceWallet || 'BCA'}</span>
              <ArrowRight size={12} className="text-[#757A95]" />
              <span>{action.destinationWallet || 'Tabungan'}</span>
            </div>
          ) : (
            <span className="font-semibold text-[#242636]">{action.sourceWallet || 'BCA •••• 4821'}</span>
          )}
        </div>

        {/* Date */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#757A95]">
            <Calendar size={13} />
            <span>Tanggal</span>
          </div>
          <span className="font-semibold text-[#242636]">{action.date}</span>
        </div>
      </div>

      {/* Safety Confirmation Notice */}
      <p className="text-[11px] text-[#757A95] leading-relaxed bg-[#F8F9FD] p-2.5 rounded-xl border border-black/[0.03]">
        Konfirmasi terlebih dahulu sebelum transaksi disimpan ke dalam buku kas Anda.
      </p>

      {/* Action Buttons */}
      <div className="flex items-center gap-2.5 pt-1">
        <button
          type="button"
          onClick={() => onCancel(action.id)}
          className="flex-1 py-2 px-3 rounded-xl bg-white border border-[#E8EAF2] hover:bg-[#F8F9FD] text-xs font-bold text-[#757A95] hover:text-[#242636] transition-colors cursor-pointer"
        >
          Batal
        </button>
        <button
          type="button"
          onClick={() => onConfirm(action.id)}
          className="flex-1 py-2 px-3 rounded-xl bg-[#7C7CE6] hover:bg-[#6A69D6] text-xs font-bold text-white shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
        >
          <Check size={14} />
          <span>{isGoal ? 'Konfirmasi Setoran' : 'Simpan Transaksi'}</span>
        </button>
      </div>
    </div>
  );
}
