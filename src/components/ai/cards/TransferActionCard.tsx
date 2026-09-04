'use client';

import React from 'react';
import { ArrowRight, ArrowDown, Calendar, Wallet, Check, X } from 'lucide-react';
import { formatIDR } from '@/lib/format';

interface TransferActionCardProps {
  amount: number;
  sourceWalletName: string;
  destinationWalletName: string;
  date: string;
  onConfirm: () => void;
  onCancel: () => void;
  isConfirming?: boolean;
  status?: 'pending' | 'success' | 'cancelled';
}

export default function TransferActionCard({
  amount,
  sourceWalletName,
  destinationWalletName,
  date,
  onConfirm,
  onCancel,
  isConfirming = false,
  status = 'pending',
}: TransferActionCardProps) {
  if (status === 'success') {
    return (
      <div className="p-4 rounded-2xl bg-[#EBF7F2] border border-[#D0EFE5] space-y-2 max-w-md">
        <div className="flex items-center gap-2 text-[#1B7354] text-xs font-bold">
          <Check size={16} /> Transfer berhasil dicatat.
        </div>
        <div className="flex items-center justify-between text-xs pt-1 border-t border-[#D0EFE5]/80">
          <span className="font-semibold text-[#242636]">
            {sourceWalletName} → {destinationWalletName}
          </span>
          <span className="font-black tabular-nums text-[#242636]">{formatIDR(amount)}</span>
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
      <div className="flex items-center justify-between">
        <span className="px-2.5 py-0.5 rounded-full bg-[#D6E4FA] text-[#3E6FB0] text-[10px] font-bold uppercase tracking-wider">
          Transfer
        </span>
        <span className="text-sm font-black text-[#242636] tabular-nums">{formatIDR(amount)}</span>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-3 py-2">
        <div className="p-3 rounded-xl bg-[#FAFBFD] border border-[#E8EAF2]/60 text-center space-y-1">
          <span className="flex items-center justify-center gap-1 text-[10px] font-bold text-[#757A95] uppercase">
            <Wallet size={12} /> {sourceWalletName}
          </span>
          <span className="text-xs font-black text-[#D94F4F] tabular-nums">- {formatIDR(amount)}</span>
        </div>
        <div className="flex flex-col items-center">
          <ArrowRight size={16} className="text-[#7C7CE6] hidden sm:block" />
          <ArrowDown size={16} className="text-[#7C7CE6] sm:hidden" />
        </div>
        <div className="p-3 rounded-xl bg-[#EBF7F2] border border-[#D0EFE5]/60 text-center space-y-1">
          <span className="flex items-center justify-center gap-1 text-[10px] font-bold text-[#1B7354] uppercase">
            <Wallet size={12} /> {destinationWalletName}
          </span>
          <span className="text-xs font-black text-[#1B7354] tabular-nums">+ {formatIDR(amount)}</span>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs pt-2 border-t border-[#E8EAF2]/70">
        <span className="flex items-center gap-1.5 text-[#757A95]">
          <Calendar size={12} /> Tanggal
        </span>
        <span className="font-semibold text-[#242636]">{date}</span>
      </div>

      <p className="text-[11px] text-[#757A95] leading-relaxed bg-[#F8F9FD] p-2.5 rounded-xl border border-black/[0.03]">
        Dana akan dipindahkan antar wallet. Transfer bukan pengeluaran.
      </p>

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
              <Check size={14} /> Konfirmasi Transfer
            </>
          )}
        </button>
      </div>
    </div>
  );
}
