'use client';

import React, { useState, useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Wifi,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  Layers,
} from 'lucide-react';
import AnimatedCounter from '@/components/ui/AnimatedCounter';
import { formatIDR } from '@/lib/format';
import {
  getWalletTheme,
  getWalletIcon,
  formatEmbossedCardNumber,
} from '@/lib/walletTheme';
import {
  CardMaterialLayers,
  EmvGoldChip,
  CardNetworkEmblem,
} from './PhysicalCardSurface';

export interface WalletDropdownItem {
  id: string;
  name: string;
  type: string;
  balance: number;
  accountLast4?: string | null;
  institution?: string | null;
  color?: string | null;
}

interface WalletCardProps {
  balance?: number;
  cardNumber?: string;
  holderName?: string;
  expiry?: string;
  className?: string;
  wallets?: WalletDropdownItem[];
}

const STACK_LAYERS = [
  { y: 0, scale: 1, zIndex: 40, opacity: 1 },
  { y: -13, scale: 0.95, zIndex: 30, opacity: 1 },
  { y: -26, scale: 0.9, zIndex: 20, opacity: 1 },
  { y: -39, scale: 0.85, zIndex: 10, opacity: 1 },
] as const;

export default function WalletCard({
  balance = 0,
  cardNumber = '•••• •••• •••• 4821',
  holderName = 'PENGGUNA',
  expiry = '11/29',
  className = '',
  wallets = [],
}: WalletCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const [isBalanceHidden, setIsBalanceHidden] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const hasWallets = wallets.length > 0;

  const displayWallets: WalletDropdownItem[] = useMemo(() => {
    if (hasWallets) return wallets;
    return [
      {
        id: 'default-finai-card',
        name: 'Dompet FinAI',
        type: 'BANK',
        balance,
        accountLast4: cardNumber.replace(/\D/g, '').slice(-4) || '0000',
      },
    ];
  }, [hasWallets, wallets, balance, cardNumber]);

  const safeActiveIndex = activeIndex % displayWallets.length;
  const activeWallet = displayWallets[safeActiveIndex];
  const activeTheme = getWalletTheme(activeWallet);

  const totalWalletsBalance = useMemo(() => {
    if (!hasWallets) return balance;
    return wallets.reduce((sum, w) => sum + w.balance, 0);
  }, [hasWallets, wallets, balance]);

  const getWalletSharePercent = (walletBalance: number) => {
    if (totalWalletsBalance <= 0) return 0;
    const raw = (walletBalance / totalWalletsBalance) * 100;
    return Math.max(0, Math.min(100, Math.round(raw * 10) / 10));
  };

  const handlePrev = () => {
    if (displayWallets.length <= 1) return;
    setActiveIndex((prev) => (prev - 1 + displayWallets.length) % displayWallets.length);
  };

  const handleNext = () => {
    if (displayWallets.length <= 1) return;
    setActiveIndex((prev) => (prev + 1) % displayWallets.length);
  };

  const springTransition = prefersReducedMotion
    ? { duration: 0.12 }
    : { type: 'spring' as const, stiffness: 300, damping: 28, mass: 0.85 };

  return (
    <div className={`grid grid-cols-1 xl:grid-cols-12 gap-5 items-stretch w-full ${className}`}>
      {/* ===================================================================== */}
      {/* KOLOM KIRI: WADAH SHOWCASE TUMPUKAN KARTU REKENING                    */}
      {/* ===================================================================== */}
      <div className="xl:col-span-6 bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-[0_8px_24px_-6px_rgba(15,23,42,0.06)] flex flex-col justify-between">
        <div className="mx-auto w-full max-w-[420px] flex flex-col justify-between h-full">
          {/* Wrapper Tumpukan dengan Ruang Atas untuk Lapisan Belakang */}
          <div className="relative pt-11 pb-3 overflow-visible">
            <div className="relative h-[215px] sm:h-[225px] w-full">
              {/* Bayangan Ambien Berdimensi Mengikuti Warna Kartu Aktif */}
              <div
                aria-hidden="true"
                className={`absolute -bottom-2 inset-x-8 h-7 rounded-full blur-2xl opacity-35 pointer-events-none transition-colors duration-300 ${activeTheme.glow}`}
              />

              {displayWallets.map((wallet, idx) => {
                const offset =
                  (idx - safeActiveIndex + displayWallets.length) % displayWallets.length;
                const isVisibleInStack = offset < 4;
                const isActive = offset === 0;
                const theme = getWalletTheme(wallet);
                const layer = isVisibleInStack
                  ? STACK_LAYERS[offset]
                  : { y: -48, scale: 0.8, zIndex: 0, opacity: 0 };

                return (
                  <motion.div
                    key={wallet.id}
                    initial={false}
                    animate={{
                      y: layer.y,
                      scale: layer.scale,
                      zIndex: layer.zIndex,
                      opacity: layer.opacity,
                    }}
                    whileHover={
                      !isActive && isVisibleInStack && !prefersReducedMotion
                        ? { y: layer.y - 4 }
                        : undefined
                    }
                    transition={springTransition}
                    onClick={() => {
                      if (!isActive && isVisibleInStack) {
                        setActiveIndex(idx);
                      }
                    }}
                    style={{ originX: 0.5, originY: 0 }}
                    className={`group absolute inset-0 h-[215px] sm:h-[225px] rounded-2xl p-5 text-white overflow-hidden select-none bg-gradient-to-br ${theme.gradient} ${
                      isActive
                        ? 'border border-white/25 ring-1 ring-inset ring-white/15 shadow-[0_18px_36px_-10px_rgba(15,23,42,0.28)]'
                        : isVisibleInStack
                          ? 'ring-2 ring-white/95 cursor-pointer shadow-[0_8px_20px_-6px_rgba(15,23,42,0.18)]'
                          : 'pointer-events-none'
                    }`}
                    aria-hidden={!isActive}
                  >
                    <CardMaterialLayers enableHoverSweep={isActive && !prefersReducedMotion} />

                    {/* Isi Kartu (Hanya Tampil pada Kartu Aktif agar Kartu Belakang Bersih Tanpa Teks Terpotong) */}
                    <div
                      className={`relative z-10 h-full flex flex-col justify-between transition-opacity duration-200 ${
                        isActive ? 'opacity-100' : 'opacity-0 pointer-events-none'
                      }`}
                    >
                      {/* Top Row: Nama Dompet & Sublabel Mikro (Kiri) + Emblem Jaringan Minimalis (Kanan) */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <span className="text-sm sm:text-[15px] font-bold tracking-wide text-white truncate block leading-tight drop-shadow-[0_1px_1px_rgba(0,0,0,0.18)]">
                            {wallet.name}
                          </span>
                          <span className="text-[9px] tracking-[0.22em] uppercase text-white/70 font-semibold block mt-0.5 leading-none">
                            {theme.subLabel}
                          </span>
                        </div>

                        <CardNetworkEmblem />
                      </div>

                      {/* Middle Row: Chip EMV Logam + Contactless (Kiri) & Saldo Tersedia (Kanan) */}
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 shrink-0">
                          <EmvGoldChip idSuffix={`dash-${wallet.id}`} />
                          <Wifi
                            size={17}
                            className="text-white/80 rotate-90 drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)]"
                            aria-hidden="true"
                          />
                        </div>

                        <div className="text-right min-w-0">
                          <div className="flex items-center justify-end gap-1.5 mb-0.5">
                            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.16em] text-white/75">
                              SALDO TERSEDIA
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setIsBalanceHidden((prev) => !prev);
                              }}
                              className="p-1 rounded-md bg-white/18 hover:bg-white/30 active:scale-95 text-white transition-all cursor-pointer"
                              aria-label={
                                isBalanceHidden ? 'Tampilkan Saldo' : 'Sembunyikan Saldo'
                              }
                              title={
                                isBalanceHidden ? 'Tampilkan Saldo' : 'Sembunyikan Saldo'
                              }
                            >
                              {isBalanceHidden ? <EyeOff size={12} /> : <Eye size={12} />}
                            </button>
                          </div>

                          <div className="text-2xl sm:text-[28px] font-bold tracking-tight text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.22)] tabular-nums truncate leading-tight">
                            {isBalanceHidden ? (
                              <span className="tracking-widest font-mono text-xl sm:text-2xl">
                                Rp ••••••••
                              </span>
                            ) : (
                              <AnimatedCounter value={wallet.balance} prefix="Rp " />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Bottom Block: Nomor Kartu Embossed + Card Holder & Valid Thru */}
                      <div className="space-y-2">
                        <div className="font-mono text-[14px] sm:text-[15px] tracking-[0.22em] text-white/95 drop-shadow-[0_1.5px_1px_rgba(0,0,0,0.38)] truncate">
                          {formatEmbossedCardNumber(wallet.accountLast4 || cardNumber)}
                        </div>

                        <div className="flex items-end justify-between gap-3">
                          <div className="min-w-0">
                            <span className="text-[8px] tracking-[0.18em] text-white/60 uppercase block leading-none mb-1">
                              CARD HOLDER
                            </span>
                            <span className="text-xs font-semibold tracking-[0.14em] uppercase text-white/95 truncate block leading-none drop-shadow-[0_1px_1px_rgba(0,0,0,0.25)]">
                              {holderName || 'PENGGUNA FINAI'}
                            </span>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-[8px] tracking-[0.18em] text-white/60 uppercase block leading-none mb-1">
                              VALID THRU
                            </span>
                            <span className="font-mono text-xs tracking-widest text-white/90 leading-none block drop-shadow-[0_1px_1px_rgba(0,0,0,0.25)]">
                              {expiry || '11/29'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Baris Kontrol Mini di Bawah Tumpukan */}
          <div className="flex items-center justify-end pt-2">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handlePrev}
                disabled={displayWallets.length <= 1}
                aria-label="Kartu sebelumnya"
                className="w-7 h-7 rounded-full border border-slate-200 bg-white hover:bg-slate-50 active:scale-95 text-slate-600 flex items-center justify-center transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                type="button"
                onClick={handleNext}
                disabled={displayWallets.length <= 1}
                aria-label="Kartu berikutnya"
                className="w-7 h-7 rounded-full border border-slate-200 bg-white hover:bg-slate-50 active:scale-95 text-slate-600 flex items-center justify-center transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* KOLOM KANAN: RINGKASAN TOTAL SALDO, ALOKASI & DAFTAR SEMUA DOMPET     */}
      {/* ===================================================================== */}
      <div className="xl:col-span-6 p-6 flex flex-col justify-between gap-5 h-full rounded-3xl border border-slate-200/80 bg-white shadow-[0_8px_24px_-6px_rgba(15,23,42,0.06)]">
        {/* Bagian Atas: Header Total Saldo & Segmented Allocation Bar */}
        <div>
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1 min-w-0">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                TOTAL SEMUA DOMPET
              </span>
              <div className="text-2xl sm:text-[26px] font-bold tracking-tight tabular-nums text-slate-900">
                {isBalanceHidden ? (
                  <span className="tracking-widest font-mono text-xl sm:text-2xl">
                    Rp ••••••••
                  </span>
                ) : (
                  <AnimatedCounter value={totalWalletsBalance} prefix="Rp " />
                )}
              </div>
            </div>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-semibold shrink-0">
              <Layers size={13} />
              <span>{wallets.length} Dompet</span>
            </span>
          </div>

          {/* Segmented Allocation Bar */}
          <div
            className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden flex gap-0.5 mt-3"
            role="img"
            aria-label="Distribusi saldo antar dompet"
          >
            {hasWallets && totalWalletsBalance > 0 ? (
              wallets.map((w) => {
                const pct = getWalletSharePercent(w.balance);
                if (pct <= 0) return null;
                const theme = getWalletTheme(w);
                return (
                  <div
                    key={w.id}
                    title={`${w.name}: ${pct}%`}
                    style={{ width: `${pct}%` }}
                    className={`h-full bg-gradient-to-r ${theme.gradient} first:rounded-l-full last:rounded-r-full transition-all duration-300`}
                  />
                );
              })
            ) : (
              <div className="h-full w-full bg-slate-200/70 rounded-full" />
            )}
          </div>
        </div>

        {/* Bagian Bawah: Daftar Interaktif Semua Dompet (Sinkron 2 Arah dengan Kartu Kiri) */}
        <div className="space-y-2 max-h-[175px] overflow-y-auto no-scrollbar">
          {hasWallets ? (
            wallets.map((w, idx) => {
              const isSelected = idx === safeActiveIndex;
              const theme = getWalletTheme(w);
              const pct = getWalletSharePercent(w.balance);

              return (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => setActiveIndex(idx)}
                  className={`w-full flex items-center justify-between px-3.5 py-2 rounded-2xl border transition-all duration-200 cursor-pointer text-left ${
                    isSelected
                      ? 'bg-indigo-50/75 border-indigo-200 shadow-xs'
                      : 'bg-slate-50/60 border-slate-100 hover:bg-slate-50 hover:border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`h-9 w-9 rounded-xl bg-white border border-slate-100 shadow-2xs flex items-center justify-center shrink-0 ${theme.accentText}`}
                    >
                      {getWalletIcon(w, 16)}
                    </div>
                    <div className="min-w-0">
                      <span
                        className={`text-sm truncate block ${
                          isSelected
                            ? 'text-indigo-950 font-semibold'
                            : 'text-slate-800 font-medium'
                        }`}
                      >
                        {w.name}
                      </span>
                      <span className="text-[11px] text-slate-500 block truncate">
                        {theme.typeLabel}
                        {w.institution ? ` • ${w.institution}` : ''}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0 ml-3">
                    <span className="font-semibold text-sm tabular-nums text-slate-900 block">
                      {isBalanceHidden ? 'Rp ••••••' : formatIDR(w.balance)}
                    </span>
                    <span className="text-[11px] font-medium text-indigo-600 tabular-nums block">
                      {pct}%
                    </span>
                  </div>
                </button>
              );
            })
          ) : (
            <div className="px-3.5 py-4 rounded-2xl bg-slate-50/60 border border-slate-100 text-xs text-slate-500 text-center">
              Belum ada dompet yang terhubung.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
