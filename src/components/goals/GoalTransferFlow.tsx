'use client';

import React from 'react';
import { ArrowDown, AlertCircle, Sparkles, ArrowRight } from 'lucide-react';
import { Wallet } from '@/types';
import { formatIDR } from '@/data/mockData';

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
      <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-[#F8F9FD] via-white to-[#F5F4FE] border border-black/[0.06] shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
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

        {/* 2 Step Cards with SVG Arrow Flow */}
        <div className="grid grid-cols-1 sm:grid-cols-11 gap-2 items-center">
          {/* 1. Source Wallet */}
          <div className="sm:col-span-5 p-2.5 rounded-xl bg-white border border-black/[0.05] space-y-0.5">
            <span className="text-[9px] font-bold uppercase tracking-wider text-[#757A95] block">
              Dari (Sumber Dana)
            </span>
            <div className="text-xs font-bold text-[#242636] truncate">
              {sourceWallet ? sourceWallet.name : 'Pilih Sumber Dana'}
            </div>
            {sourceWallet && (
              <div className="flex items-center justify-between text-[10px] text-[#757A95]">
                <span>{sourceWallet.accountIdentifier || 'Rekening'}</span>
                {amount && amount > 0 ? (
                  <span className="font-bold text-[#B83A38] tabular-nums">
                    -{formatIDR(amount)}
                  </span>
                ) : (
                  <span className="font-semibold tabular-nums">
                    {formatIDR(sourceWallet.balance)}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* SVG Arrow Middle Connector */}
          <div className="sm:col-span-1 flex items-center justify-center py-1 sm:py-0">
            <div className="w-6 h-6 rounded-full bg-[#EDEAFC] text-[#5F5ED4] flex items-center justify-center shadow-2xs">
              <div className="hidden sm:block">
                <ArrowRight size={12} strokeWidth={2.5} />
              </div>
              <div className="sm:hidden">
                <ArrowDown size={12} strokeWidth={2.5} />
              </div>
            </div>
          </div>

          {/* 2. Destination Wallet */}
          <div className="sm:col-span-5 p-2.5 rounded-xl bg-white border border-[#7C7CE6]/25 bg-[#F5F4FE]/50 space-y-0.5">
            <span className="text-[9px] font-bold uppercase tracking-wider text-[#5F5ED4] block">
              Ke (Dompet Tujuan)
            </span>
            <div className="text-xs font-bold text-[#242636] truncate">
              {destinationWallet ? destinationWallet.name : 'Pilih Dompet Tujuan'}
            </div>
            {destinationWallet && (
              <div className="flex items-center justify-between text-[10px] text-[#757A95]">
                <span>{destinationWallet.accountIdentifier || 'Tabungan'}</span>
                {amount && amount > 0 ? (
                  <span className="font-bold text-[#1B7354] tabular-nums">
                    +{formatIDR(amount)}
                  </span>
                ) : (
                  <span className="font-semibold tabular-nums">
                    {formatIDR(destinationWallet.balance)}
                  </span>
                )}
              </div>
            )}
          </div>
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
