'use client';

import React from 'react';
import { ArrowRight, ArrowDown, Calendar, Wallet, Target, Check, X } from 'lucide-react';
import { formatIDR } from '@/lib/format';

interface GoalContributionCardProps {
  goalName: string;
  amount: number;
  sourceWalletName: string;
  currentAmount: number;
  targetAmount: number;
  date: string;
  onConfirm: () => void;
  onCancel: () => void;
  isConfirming?: boolean;
  status?: 'pending' | 'success' | 'cancelled';
}

export default function GoalContributionCard({
  goalName,
  amount,
  sourceWalletName,
  currentAmount,
  targetAmount,
  date,
  onConfirm,
  onCancel,
  isConfirming = false,
  status = 'pending',
}: GoalContributionCardProps) {
  const pctBefore = targetAmount > 0 ? Math.round((currentAmount / targetAmount) * 100) : 0;
  const pctAfter = targetAmount > 0 ? Math.round(((currentAmount + amount) / targetAmount) * 100) : 0;
  const isCompletedAfter = currentAmount + amount >= targetAmount;

  if (status === 'success') {
    return (
      <div className="p-4 rounded-2xl bg-[#EBF7F2] border border-[#D0EFE5] space-y-2 max-w-md">
        <div className="flex items-center gap-2 text-[#1B7354] text-xs font-bold">
          <Check size={16} /> Setoran tabungan berhasil dicatat.
        </div>
        <div className="flex items-center justify-between text-xs pt-1 border-t border-[#D0EFE5]/80">
          <span className="font-semibold text-[#242636]">{goalName}</span>
          <span className="font-black tabular-nums text-[#1B7354]">+ {formatIDR(amount)}</span>
        </div>
      </div>
    );
  }
  if (status === 'cancelled') {
    return (
      <div className="p-3 rounded-2xl bg-[#FAFBFD] border border-[#E8EAF2] text-xs font-medium text-[#757A95] flex items-center gap-2 max-w-md">
        <X size={15} /> Tindakan dibatalkan.
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E8EAF2] shadow-[0_6px_24px_rgba(36,38,54,0.04)] space-y-4 max-w-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="px-2.5 py-0.5 rounded-full bg-[#EDEAFC] text-[#5F5ED4] text-[10px] font-bold uppercase tracking-wider">
            Tabungan Goal
          </span>
          <h4 className="text-sm sm:text-base font-bold text-[#242636] mt-1.5">{goalName}</h4>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-[#757A95] font-semibold block">Nominal</span>
          <span className="text-sm font-black text-[#1B7354] tabular-nums">{formatIDR(amount)}</span>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-3 py-1">
        <div className="p-3 rounded-xl bg-[#FAFBFD] border border-[#E8EAF2]/60 text-center space-y-1">
          <span className="flex items-center justify-center gap-1 text-[10px] font-bold text-[#757A95] uppercase">
            <Wallet size={12} /> Dari
          </span>
          <span className="text-xs font-bold text-[#242636]">{sourceWalletName}</span>
          <span className="text-xs font-black text-[#D94F4F] tabular-nums">- {formatIDR(amount)}</span>
        </div>
        <div className="flex flex-col items-center">
          <ArrowRight size={16} className="text-[#7C7CE6] hidden sm:block" />
          <ArrowDown size={16} className="text-[#7C7CE6] sm:hidden" />
        </div>
        <div className="p-3 rounded-xl bg-[#EDEAFC]/30 border border-[#E4E2FB]/60 text-center space-y-1">
          <span className="flex items-center justify-center gap-1 text-[10px] font-bold text-[#5F5ED4] uppercase">
            <Target size={12} /> Ke
          </span>
          <span className="text-xs font-bold text-[#242636]">{goalName}</span>
          <span className="text-xs font-black text-[#1B7354] tabular-nums">+ {formatIDR(amount)}</span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-[11px] font-semibold">
          <span className="text-[#757A95]">Progress Goal</span>
          <span className={isCompletedAfter ? 'text-[#1B7354]' : 'text-[#5F5ED4]'}>
            {pctBefore}% → {Math.min(pctAfter, 100)}%
          </span>
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#757A95]">Saat ini</span>
            <span className="font-bold text-[#242636] tabular-nums">
              {formatIDR(currentAmount)} / {formatIDR(targetAmount)}
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-[#F0EFFC] overflow-hidden p-0.5">
            <div className="h-full rounded-full bg-[#D6E4FA] transition-all" style={{ width: `${Math.min(pctBefore, 100)}%` }} />
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#1B7354] font-semibold">Setelah</span>
            <span className="font-bold text-[#1B7354] tabular-nums">
              {formatIDR(Math.min(currentAmount + amount, targetAmount))} / {formatIDR(targetAmount)}
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-[#F0EFFC] overflow-hidden p-0.5">
            <div
              className={`h-full rounded-full transition-all ${isCompletedAfter ? 'bg-[#1B7354]' : 'bg-[#7C7CE6]'}`}
              style={{ width: `${Math.min(pctAfter, 100)}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs pt-2 border-t border-[#E8EAF2]/70">
        <span className="flex items-center gap-1.5 text-[#757A95]">
          <Calendar size={12} /> Tanggal
        </span>
        <span className="font-semibold text-[#242636]">{date}</span>
      </div>

      <div className="flex items-center gap-2.5 pt-1">
        <button
          type="button"
          onClick={onCancel}
          disabled={isConfirming}
          className="flex-1 py-2 px-3 rounded-xl bg-white border border-[#E8EAF2] hover:bg-[#F8F9FD] text-xs font-bold text-[#757A95] hover:text-[#242636] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Batal
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={isConfirming}
          className="flex-1 py-2 px-3 rounded-xl bg-[#7C7CE6] hover:bg-[#6A69D6] text-xs font-bold text-white shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isConfirming ? (
            <>
              <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Memproses...
            </>
          ) : (
            <>
              <Check size={14} /> Konfirmasi Menabung
            </>
          )}
        </button>
      </div>
    </div>
  );
}
