'use client';

import React, { useState } from 'react';
import { Sparkles, Wifi, Eye, EyeOff, ChevronDown, Check } from 'lucide-react';
import AnimatedCounter from '@/components/ui/AnimatedCounter';
import { MOCK_WALLETS, formatIDR } from '@/data/mockData';
import { Wallet } from '@/types';

interface WalletCardProps {
  balance?: number;
  cardNumber?: string;
  holderName?: string;
  expiry?: string;
  className?: string;
}

export default function WalletCard({
  balance = 34850000,
  cardNumber = '••••  ••••  ••••  4821',
  holderName = 'Yoga W.',
  expiry = '08/26',
  className = '',
}: WalletCardProps) {
  const [isBalanceHidden, setIsBalanceHidden] = useState(false);
  const [selectedWalletId, setSelectedWalletId] = useState<string>('all');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Compute active wallet or total
  const selectedWallet: Wallet | undefined = MOCK_WALLETS.find((w) => w.id === selectedWalletId);
  const currentBalance = selectedWallet ? selectedWallet.balance : balance;
  const currentAccountLabel = selectedWallet ? selectedWallet.name : 'Semua Dompet (Total)';
  const currentIdentifier = selectedWallet
    ? selectedWallet.accountIdentifier || cardNumber
    : cardNumber;

  return (
    <div
      className={`relative w-full min-h-[280px] sm:min-h-[300px] md:min-h-[320px] rounded-[28px] sm:rounded-[32px] p-7 sm:p-9 flex flex-col justify-between overflow-hidden bg-gradient-to-br from-[#8E9AF7] via-[#7C7CE6] to-[#5F5ED4] text-white shadow-[0_25px_60px_-12px_rgba(124,124,230,0.48),0_10px_30px_rgba(36,38,54,0.12)] border border-white/40 select-none ${className}`}
    >
      {/* Abstract Smooth Wave Layers (Overlay inside card) */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-24 -right-24 w-[420px] h-[420px] rounded-full bg-white/20 blur-2xl" />
        <div className="absolute -bottom-28 -left-20 w-96 h-96 rounded-full bg-[#4E4DC7]/40 blur-xl" />
        <svg
          className="absolute inset-0 w-full h-full opacity-40"
          viewBox="0 0 600 320"
          preserveAspectRatio="none"
        >
          <path
            d="M-20,230 C120,130 260,290 400,160 C470,95 520,145 620,120 L620,340 L-20,340 Z"
            fill="rgba(255,255,255,0.18)"
          />
          <path
            d="M-20,120 C140,50 300,230 620,70"
            fill="none"
            stroke="rgba(255,255,255,0.35)"
            strokeWidth="2.5"
          />
        </svg>
      </div>

      {/* ===================================================================== */}
      {/* CARD TOP ROW: BRAND & WALLET SELECTOR DROPDOWN                        */}
      {/* ===================================================================== */}
      <div className="flex items-center justify-between relative z-20">
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 text-white transition-all cursor-pointer shadow-xs"
          >
            <span className="text-xs sm:text-sm font-bold tracking-wide">
              {currentAccountLabel}
            </span>
            <ChevronDown size={14} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute left-0 top-full mt-2 w-56 p-2 rounded-2xl bg-white text-[#242636] shadow-[0_15px_35px_rgba(36,38,54,0.15)] border border-black/[0.06] z-50 space-y-1">
              <button
                type="button"
                onClick={() => {
                  setSelectedWalletId('all');
                  setIsDropdownOpen(false);
                }}
                className={`w-full px-3 py-2 rounded-xl text-left text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                  selectedWalletId === 'all'
                    ? 'bg-[#E4E2FB] text-[#5F5ED4]'
                    : 'hover:bg-black/[0.03] text-[#242636]'
                }`}
              >
                <span>Total Semua Dompet</span>
                {selectedWalletId === 'all' && <Check size={14} />}
              </button>

              <div className="h-px bg-black/[0.05] my-1" />

              {MOCK_WALLETS.map((w) => (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => {
                    setSelectedWalletId(w.id);
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full px-3 py-2 rounded-xl text-left text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                    selectedWalletId === w.id
                      ? 'bg-[#E4E2FB] text-[#5F5ED4] font-bold'
                      : 'hover:bg-black/[0.03] text-[#242636]'
                  }`}
                >
                  <div className="truncate">
                    <span className="block">{w.name}</span>
                    <span className="text-[10px] text-[#757A95] font-normal">
                      {formatIDR(w.balance)}
                    </span>
                  </div>
                  {selectedWalletId === w.id && <Check size={14} className="shrink-0" />}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Wifi size={22} className="text-white/90 rotate-90" />
          <div className="w-9 h-9 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 shadow-xs">
            <Sparkles size={18} />
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* CARD MIDDLE ROW: EMV GOLD CHIP & SALDO TERSEDIA (WITH EYE TOGGLE)     */}
      {/* ===================================================================== */}
      <div className="flex flex-wrap items-center justify-between gap-4 relative z-10 my-4">
        {/* Large Realistic EMV Chip */}
        <div className="w-13 h-10 rounded-xl bg-gradient-to-tr from-[#E5C158] via-[#F3DE8A] to-[#D4AF37] border border-[#C5A028] shadow-[0_2px_8px_rgba(0,0,0,0.22)] flex flex-col justify-between p-1.5 relative overflow-hidden shrink-0">
          <div className="w-full h-px bg-[#B08D20]/60 my-auto" />
          <div className="absolute inset-x-3.5 inset-y-0 border-x border-[#B08D20]/50" />
          <div className="w-4 h-2.5 rounded-xs border border-[#B08D20]/60 mx-auto" />
        </div>

        {/* Large Available Balance Display + Eye Toggle Icon */}
        <div className="text-right">
          <div className="flex items-center justify-end gap-1.5 mb-1">
            <span className="text-[11px] uppercase font-bold text-white/80 tracking-wider">
              {selectedWallet ? `Saldo ${selectedWallet.name}` : 'Total Saldo Tersedia'}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsBalanceHidden(!isBalanceHidden);
              }}
              className="p-1 rounded-lg bg-white/20 hover:bg-white/35 active:scale-90 text-white transition-all cursor-pointer shadow-xs"
              title={isBalanceHidden ? 'Tampilkan Saldo' : 'Sembunyikan Saldo'}
            >
              {isBalanceHidden ? <EyeOff size={13} /> : <Eye size={13} />}
            </button>
          </div>

          <div className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.2)] tabular-nums">
            {isBalanceHidden ? (
              <span className="tracking-widest font-mono text-2xl sm:text-3xl md:text-4xl">
                Rp ••••••••
              </span>
            ) : (
              <AnimatedCounter value={currentBalance} prefix="Rp" />
            )}
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* CARD BOTTOM ROW: CARD NUMBER, HOLDER & EXPIRY                         */}
      {/* ===================================================================== */}
      <div className="space-y-2 relative z-10 pt-2 border-t border-white/20">
        <div className="flex items-center justify-between text-xs sm:text-sm font-mono tracking-widest text-white/95 drop-shadow-xs">
          <span>{currentIdentifier}</span>
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30">
            {selectedWallet ? selectedWallet.type.toUpperCase() : 'FINAI PLATINUM'}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs text-white/85">
          <span className="font-semibold tracking-wide uppercase text-[11px]">
            {holderName}
          </span>
          <span className="font-mono text-[11px] tracking-wider text-white/70">
            EXP {expiry}
          </span>
        </div>
      </div>
    </div>
  );
}
