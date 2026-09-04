'use client';

import React from 'react';
import { ArrowDown, AlertCircle, Sparkles } from 'lucide-react';
import { Wallet } from '@/types';
import { formatIDR } from '@/lib/format';

interface GoalTransferFlowProps {
  sourceWallet?: Wallet | null;
  destinationWallet?: Wallet | null;
  amount?: number;
  mode?: 'create' | 'contribution' | 'detail';
}

export default function GoalTransferFlow({
  sourceWallet,
  destinationWallet,
  amount,
  mode = 'create',
}: GoalTransferFlowProps) {
  const isSameWallet =
    sourceWallet && destinationWallet && sourceWallet.id === destinationWallet.id;

  return (
    <div className="space-y-2">
      {/* Visual Transfer Box */}
      <div className="p-3 rounded-2xl bg-white/90 border border-black/[0.06] shadow-2xs space-y-2">
        <div className="flex items-center justify-between pb-1 border-b border-black/[0.04]">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#757A95] flex items-center gap-1">
            <Sparkles size={11} className="text-[#7C7CE6]" />
            Alur Pendanaan Tabungan
          </span>
          {amount && amount > 0 && (
            <span className="text-xs font-black text-[#5F5ED4] tabular-nums">
              {formatIDR(amount)}
            </span>
          )}
        </div>

        {/* 1. Source Wallet Row */}
        <div className="flex items-center justify-between p-2 rounded-xl bg-[#F8F9FD] border border-black/[0.04]">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-lg bg-white text-[#757A95] flex items-center justify-center text-[9px] font-extrabold shrink-0 border border-black/[0.05]">
              DARI
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-[#242636] truncate">
                {sourceWallet ? sourceWallet.name : 'Pilih Sumber Dana'}
              </div>
              <div className="text-[10px] text-[#757A95] truncate">
                {sourceWallet?.accountIdentifier || 'Rekening Operasional'}
              </div>
            </div>
          </div>
          {amount && amount > 0 ? (
            <span className="text-xs font-black text-[#B83A38] tabular-nums shrink-0 ml-2">
              -{formatIDR(amount)}
            </span>
          ) : (
            <span className="text-xs font-bold text-[#757A95] tabular-nums shrink-0 ml-2">
              {sourceWallet ? formatIDR(sourceWallet.balance) : '-'}
            </span>
          )}
        </div>

        {/* Middle Connector Arrow */}
        <div className="flex items-center justify-center -my-0.5">
          <div className="flex items-center gap-1 text-[10px] font-bold text-[#5F5ED4] bg-[#EDEAFC] px-2.5 py-0.5 rounded-full shadow-2xs">
            <ArrowDown size={11} strokeWidth={2.5} />
            <span>Setor Tabungan</span>
          </div>
        </div>

        {/* 2. Destination Wallet Row */}
        <div className="flex items-center justify-between p-2 rounded-xl bg-[#FAF9FE] border border-[#7C7CE6]/25">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-lg bg-[#5F5ED4] text-white flex items-center justify-center text-[9px] font-extrabold shrink-0">
              KE
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-[#242636] truncate">
                {destinationWallet ? destinationWallet.name : 'Pilih Dompet Tujuan'}
              </div>
              <div className="text-[10px] text-[#757A95] truncate">
                {destinationWallet?.accountIdentifier || 'Pos Tabungan Impian'}
              </div>
            </div>
          </div>
          {amount && amount > 0 ? (
            <span className="text-xs font-black text-[#1B7354] tabular-nums shrink-0 ml-2">
              +{formatIDR(amount)}
            </span>
          ) : (
            <span className="text-xs font-bold text-[#757A95] tabular-nums shrink-0 ml-2">
              {destinationWallet ? formatIDR(destinationWallet.balance) : '-'}
            </span>
          )}
        </div>
      </div>

      {/* Validation Alert if same wallet is selected */}
      {isSameWallet && (
        <div className="p-2.5 rounded-xl bg-[#FFF0EF] border border-[#FAC2BE] flex items-center gap-2 text-xs font-bold text-[#B83A38]">
          <AlertCircle size={14} className="shrink-0" />
          <span>Dompet sumber dan tujuan harus berbeda.</span>
        </div>
      )}
    </div>
  );
}
