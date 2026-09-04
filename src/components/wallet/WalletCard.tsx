'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Wifi,
  Eye,
  EyeOff,
  ChevronDown,
  Check,
  Building2,
  Banknote,
  Smartphone,
  CreditCard,
  PiggyBank,
} from 'lucide-react';
import AnimatedCounter from '@/components/ui/AnimatedCounter';
import { formatIDR } from '@/lib/format';

interface WalletDropdownItem {
  id: string;
  name: string;
  type: string;
  balance: number;
  accountLast4?: string | null;
}

interface WalletCardProps {
  balance?: number;
  cardNumber?: string;
  holderName?: string;
  expiry?: string;
  className?: string;
  wallets?: WalletDropdownItem[];
}

const getWalletIcon = (type: string) => {
  switch (type?.toLowerCase()) {
    case 'bank':
      return <Building2 size={14} className="text-[#3E6FB0]" />;
    case 'cash':
      return <Banknote size={14} className="text-[#1B7354]" />;
    case 'ewallet':
      return <Smartphone size={14} className="text-[#7C7CE6]" />;
    case 'savings':
    case 'investment':
      return <PiggyBank size={14} className="text-[#6867D4]" />;
    default:
      return <CreditCard size={14} className="text-[#757A95]" />;
  }
};

export default function WalletCard({
  balance = 0,
  cardNumber = '••••  ••••  ••••  0000',
  holderName = '',
  expiry = '08/26',
  className = '',
  wallets = [],
}: WalletCardProps) {
  const [isBalanceHidden, setIsBalanceHidden] = useState(false);
  const [selectedWalletId, setSelectedWalletId] = useState<string>('all');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Compute active wallet or total
  const selectedWallet = wallets.find((w) => w.id === selectedWalletId);
  const currentBalance = selectedWallet ? selectedWallet.balance : balance;
  const currentAccountLabel = selectedWallet ? selectedWallet.name : 'Semua Dompet (Total)';
  const currentIdentifier = selectedWallet
    ? (selectedWallet.accountLast4 ? `•••• ${selectedWallet.accountLast4}` : cardNumber)
    : cardNumber;

  // Handle click outside and Escape key to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsDropdownOpen(false);
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDropdownOpen]);

  return (
    <div
      className={`relative w-full min-h-[280px] sm:min-h-[300px] md:min-h-[320px] rounded-[28px] sm:rounded-[32px] p-7 sm:p-9 flex flex-col justify-between select-none ${className}`}
    >
      {/* ===================================================================== */}
      {/* 0. INNER CLIPPED LAYER FOR BACKGROUND & WAVES (PREVENTS POPUP CLIPPING) */}
      {/* ===================================================================== */}
      <div className="absolute inset-0 rounded-[28px] sm:rounded-[32px] bg-gradient-to-br from-[#8E9AF7] via-[#7C7CE6] to-[#5F5ED4] shadow-[0_25px_60px_-12px_rgba(124,124,230,0.48),0_10px_30px_rgba(36,38,54,0.12)] border border-white/40 overflow-hidden pointer-events-none z-0">
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
      {/* 1. CARD TOP ROW: BRAND & WALLET SELECTOR DROPDOWN (OVERFLOW VISIBLE) */}
      {/* ===================================================================== */}
      <div className="flex items-center justify-between relative z-30">
        {/* Dropdown Container */}
        <div ref={dropdownRef} className="relative">
          <button
            type="button"
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            aria-expanded={isDropdownOpen}
            aria-haspopup="listbox"
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-white/25 hover:bg-white/35 active:scale-98 backdrop-blur-md border border-white/35 text-white transition-all cursor-pointer shadow-xs"
          >
            <span className="text-xs sm:text-sm font-bold tracking-wide">
              {currentAccountLabel}
            </span>
            <ChevronDown
              size={14}
              className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {/* Unclipped High Z-Index Floating Popover */}
          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.96 }}
                transition={{ duration: 0.16, ease: 'easeOut' }}
                className="absolute left-0 top-full mt-2 w-64 p-2 rounded-2xl bg-white text-[#242636] shadow-[0_20px_45px_rgba(36,38,54,0.22)] border border-black/[0.08] z-50 divide-y divide-[#E8EAF2]/60"
              >
                {/* Option 1: Total Semua Dompet */}
                <div className="pb-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedWalletId('all');
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full px-3 py-2.5 rounded-xl text-left text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                      selectedWalletId === 'all'
                        ? 'bg-[#EDEAFC] text-[#5F5ED4]'
                        : 'hover:bg-[#FAFBFD] text-[#242636]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-[#E4E2FB] text-[#7C7CE6] flex items-center justify-center shrink-0">
                        <CreditCard size={14} />
                      </div>
                      <div>
                        <span className="block leading-tight">Total Semua Dompet</span>
                        <span className="text-[10px] text-[#757A95] font-normal leading-tight">
                          {formatIDR(balance)}
                        </span>
                      </div>
                    </div>
                    {selectedWalletId === 'all' && (
                      <Check size={15} strokeWidth={2.5} className="text-[#5F5ED4] shrink-0" />
                    )}
                  </button>
                </div>

                {/* Specific Wallets List */}
                <div className="pt-1.5 space-y-1 max-h-56 overflow-y-auto no-scrollbar">
                  {wallets.map((w) => {
                    const isSelected = selectedWalletId === w.id;
                    return (
                      <button
                        key={w.id}
                        type="button"
                        onClick={() => {
                          setSelectedWalletId(w.id);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full px-3 py-2 rounded-xl text-left text-xs flex items-center justify-between transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-[#EDEAFC] text-[#5F5ED4] font-bold'
                            : 'hover:bg-[#FAFBFD] text-[#242636] font-semibold'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-[#FAFBFD] border border-[#E8EAF2] flex items-center justify-center shrink-0">
                            {getWalletIcon(w.type)}
                          </div>
                          <div className="truncate">
                            <span className="block leading-tight truncate">{w.name}</span>
                            <span className="text-[10px] text-[#757A95] font-normal leading-tight">
                              {formatIDR(w.balance)}
                            </span>
                          </div>
                        </div>
                        {isSelected && (
                          <Check size={15} strokeWidth={2.5} className="text-[#5F5ED4] shrink-0 ml-2" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Wireless & Sparkles Icons */}
        <div className="flex items-center gap-3">
          <Wifi size={22} className="text-white/90 rotate-90" />
          <div className="w-9 h-9 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 shadow-xs">
            <Sparkles size={18} />
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 2. CARD MIDDLE ROW: EMV GOLD CHIP & SALDO TERSEDIA (WITH EYE TOGGLE) */}
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
      {/* 3. CARD BOTTOM ROW: CARD NUMBER, HOLDER & EXPIRY                     */}
      {/* ===================================================================== */}
      <div className="space-y-2 relative z-10 pt-2 border-t border-white/20 text-white">
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
