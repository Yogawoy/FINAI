'use client';

import React from 'react';
import { Wallet, CreditCard, Banknote, PiggyBank } from 'lucide-react';
import { formatIDR } from '@/lib/format';

interface WalletItem {
  name: string;
  balance: number;
  type?: string;
}

interface WalletCardProps {
  wallets: WalletItem[];
  totalBalance: number;
}

function walletIcon(type?: string) {
  const t = (type || '').toUpperCase();
  if (t === 'BANK') return <Banknote size={14} className="text-[#3B82F6]" />;
  if (t === 'CASH') return <Wallet size={14} className="text-[#10B981]" />;
  if (t === 'E_WALLET') return <CreditCard size={14} className="text-[#7C7CE6]" />;
  return <PiggyBank size={14} className="text-[#5F5ED4]" />;
}

export default function WalletSummaryCard({ wallets, totalBalance }: WalletCardProps) {
  if (wallets.length === 0) {
    return (
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E8EAF2] shadow-[0_6px_24px_rgba(36,38,54,0.04)] max-w-md">
        <span className="px-2.5 py-0.5 rounded-full bg-[#EDEAFC] text-[#5F5ED4] text-[10px] font-bold uppercase tracking-wider">
          Dompet
        </span>
        <p className="text-xs text-[#757A95] mt-3">Belum ada dompet. Buat dompet di halaman Dompet.</p>
      </div>
    );
  }

  if (wallets.length === 1) {
    const w = wallets[0];
    return (
      <div className="w-full sm:w-[420px] max-w-md p-5 rounded-2xl bg-white border border-[#E8EAF2] shadow-[0_6px_24px_rgba(36,38,54,0.04)] space-y-4">
        <div className="flex items-center justify-between">
          <span className="px-2.5 py-0.5 rounded-full bg-[#EDEAFC] text-[#5F5ED4] text-[10px] font-bold uppercase tracking-wider">
            Dompet
          </span>
          <span className="text-[11px] text-[#757A95] flex items-center gap-1">
            {walletIcon(w.type)} {w.type || 'WALLET'}
          </span>
        </div>
        <div>
          <h4 className="text-sm font-bold text-[#242636]">{w.name}</h4>
          <div className="text-lg font-black text-[#242636] tabular-nums mt-1">{formatIDR(w.balance)}</div>
          <span className="text-[11px] text-[#757A95]">Saldo</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E8EAF2] shadow-[0_6px_24px_rgba(36,38,54,0.04)] space-y-4 max-w-md">
      <div className="flex items-center justify-between">
        <span className="px-2.5 py-0.5 rounded-full bg-[#EDEAFC] text-[#5F5ED4] text-[10px] font-bold uppercase tracking-wider">
          Dompet Saya
        </span>
        <span className="text-[11px] font-semibold text-[#757A95]">{wallets.length} Dompet</span>
      </div>

      <div className="p-3 rounded-xl bg-[#F8F9FD] border border-[#E8EAF2]/60 flex items-center justify-between">
        <span className="text-xs font-semibold text-[#757A95]">Total Saldo</span>
        <span className="text-sm font-black text-[#242636] tabular-nums">{formatIDR(totalBalance)}</span>
      </div>

      <div className="space-y-2">
        {wallets.map((w) => (
          <div key={w.name} className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-[#E8EAF2]/60">
            <span className="flex items-center gap-2 text-xs font-semibold text-[#242636]">
              {walletIcon(w.type)} {w.name}
            </span>
            <span className="text-xs font-bold text-[#242636] tabular-nums">{formatIDR(w.balance)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
