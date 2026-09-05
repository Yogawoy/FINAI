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
import { formatIDR } from '@/lib/format';

interface AIFinancialActionCardProps {
  action: AIFinancialAction;
  onConfirm: (actionId: string) => void;
  onCancel: (actionId: string) => void;
  isConfirming?: boolean;
}

export default function AIFinancialActionCard({
  action,
  onConfirm,
  onCancel,
  isConfirming = false,
}: AIFinancialActionCardProps) {
  const isGoal = action.type === 'goal_contribution';
  const isTransfer = action.type === 'transfer';
  const isIncome = action.type === 'income';
  const isFlow = isGoal || isTransfer;
  const isPositive = isGoal || isIncome;
  const isPending = action.status === 'pending';
  const isSuccess = action.status === 'confirmed' || action.status === 'success';
  const isCancelled = action.status === 'cancelled';
  const isError = action.status === 'error';

  // 1. Error State — card tetap tampil, tidak hilang dan tidak mutasi lagi.
  if (isError) {
    return (
      <div className="p-4 rounded-2xl bg-[#FFF3F3] border border-[#F5C6C6] space-y-2 max-w-md">
        <div className="flex items-center gap-2 text-[#C0392B]">
          <AlertCircle size={18} strokeWidth={2.5} />
          <span className="text-xs font-bold uppercase tracking-wide">Gagal memproses</span>
        </div>
        <div className="flex items-center justify-between text-xs pt-2 border-t border-[#F5C6C6]/80">
          <span className="font-semibold text-[#242636]">{action.title}</span>
          <span className={`font-black tabular-nums ${isPositive ? 'text-[#1B7354]' : 'text-[#D94F4F]'}`}>
            {isPositive ? '+' : '-'} {formatIDR(action.amount)}
          </span>
        </div>
        <p className="text-[11px] text-[#922B21]">{action.errorMessage || 'Terjadi kesalahan saat menyimpan.'}</p>
        <p className="text-[11px] text-[#922B21]">Tidak ada perubahan pada saldo.</p>
      </div>
    );
  }

  // 2. Success State — card tetap tampil dengan detail, tidak hilang.
  if (isSuccess) {
    const successTitle = isGoal
      ? 'Setoran tabungan tersimpan'
      : isTransfer
      ? 'Transfer berhasil'
      : isIncome
      ? 'Pemasukan tersimpan'
      : 'Transaksi tersimpan';
    return (
      <div className="p-4 rounded-2xl bg-[#EBF7F2] border border-[#D0EFE5] space-y-2 max-w-md shadow-2xs">
        <div className="flex items-center gap-2 text-[#1B7354]">
          <CircleCheck size={18} strokeWidth={2.5} />
          <span className="text-xs font-bold uppercase tracking-wide">{successTitle}</span>
        </div>
        <div className="flex items-center justify-between text-xs pt-2 border-t border-[#D0EFE5]/80">
          <span className="font-semibold text-[#242636]">{action.title}</span>
          <span className={`font-black tabular-nums ${isPositive ? 'text-[#1B7354]' : 'text-[#D94F4F]'}`}>
            {isPositive ? '+' : '-'} {formatIDR(action.amount)}
          </span>
        </div>
        <div className="text-[11px] text-[#3E6B5E] space-y-0.5">
          {action.category && <div>{action.category}</div>}
          <div>
            {isFlow
              ? `${action.sourceWallet || ''}${action.destinationWallet ? ` → ${action.destinationWallet}` : ''}`
              : action.sourceWallet}
          </div>
          <div>{action.date}</div>
        </div>
        <p className="text-[11px] text-[#1B7354] font-semibold pt-1 border-t border-[#D0EFE5]/80">
          {isGoal
            ? 'Kontribusi berhasil disimpan.'
            : isTransfer
            ? 'Transfer berhasil.'
            : 'Transaksi berhasil disimpan.'}
        </p>
      </div>
    );
  }

  // 2. Cancelled State — tanpa mutasi API, tanpa error.
  if (isCancelled) {
    const cancelTitle = isGoal
      ? 'Setoran dibatalkan'
      : isTransfer
      ? 'Transfer dibatalkan'
      : isIncome
      ? 'Pemasukan dibatalkan'
      : 'Transaksi dibatalkan';
    return (
      <div className="p-4 rounded-2xl bg-[#FAFBFD] border border-[#E8EAF2] space-y-1.5 max-w-md">
        <div className="flex items-center gap-2 text-xs font-bold text-[#242636]">
          <X size={15} className="text-[#757A95]" />
          <span className="uppercase tracking-wide">{cancelTitle}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-[#757A95]">{action.title}</span>
          <span className="font-bold tabular-nums text-[#757A95]">
            {isPositive ? '+' : '-'} {formatIDR(action.amount)}
          </span>
        </div>
        <p className="text-[11px] text-[#757A95]">Tidak ada perubahan pada saldo.</p>
      </div>
    );
  }

  // 3. Pending Confirmation Card
  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E8EAF2] shadow-[0_6px_24px_rgba(36,38,54,0.04)] space-y-4 max-w-md">
      {/* Type Badge & Amount */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <span
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              isTransfer
                ? 'bg-[#D6E4FA] text-[#3E6FB0]'
                : isGoal
                ? 'bg-[#EDEAFC] text-[#5F5ED4]'
                : isIncome
                ? 'bg-[#EBF7F2] text-[#1B7354]'
                : 'bg-[#FEF3F2] text-[#D94F4F]'
            }`}
          >
            {isTransfer ? 'Transfer' : isGoal ? 'Setoran Tabungan' : isIncome ? 'Pemasukan' : 'Pengeluaran'}
          </span>
          <h4 className="text-sm sm:text-base font-bold text-[#242636] mt-1.5">
            {action.title}
          </h4>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-[#757A95] font-semibold block">Nominal</span>
          <span
            className={`text-base sm:text-lg font-black tabular-nums ${
              isPositive ? 'text-[#1B7354]' : 'text-[#D94F4F]'
            }`}
          >
            {isPositive ? '+' : '-'} {formatIDR(action.amount)}
          </span>
        </div>
      </div>

      {/* Details Grid */}
      <div className="space-y-2 text-xs pt-2 border-t border-[#E8EAF2]/70">
        {/* Category */}
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
            <span>{isFlow ? 'Alur Dompet' : 'Dompet Rekening'}</span>
          </div>
          {isFlow ? (
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
        Konfirmasi terlebih dahulu sebelum transaksi dicatat ke dalam sistem kas FinAI Anda.
      </p>

      {/* Action Buttons */}
      <div className="flex items-center gap-2.5 pt-1">
        <button
          type="button"
          onClick={() => onCancel(action.id)}
          disabled={isConfirming}
          className="flex-1 py-2 px-3 rounded-xl bg-white border border-[#E8EAF2] hover:bg-[#F8F9FD] text-xs font-bold text-[#757A95] hover:text-[#242636] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Batal
        </button>
        <button
          type="button"
          onClick={() => onConfirm(action.id)}
          disabled={isConfirming}
          className="flex-1 py-2 px-3 rounded-xl bg-[#7C7CE6] hover:bg-[#6A69D6] text-xs font-bold text-white shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isConfirming ? (
            <>
              <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              <span>Memproses...</span>
            </>
          ) : (
            <>
              <Check size={14} />
              <span>
                {isTransfer
                  ? 'Konfirmasi Transfer'
                  : isGoal
                  ? 'Konfirmasi Setoran'
                  : isIncome
                  ? 'Simpan Pemasukan'
                  : 'Simpan Transaksi'}
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
