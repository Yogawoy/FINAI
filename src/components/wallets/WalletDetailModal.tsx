'use client';

import React from 'react';
import {
  Pencil,
  Archive,
  X,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  Check,
} from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { Wallet, Transaction, WalletColorTheme } from '@/types';
import WalletCard, { getWalletIconComponent, formatWalletTypeLabel } from './WalletCard';

interface WalletDetailModalProps {
  wallet: Wallet | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (wallet: Wallet) => void;
  onArchive: (wallet: Wallet) => void;
  transactions?: Transaction[];
}

const COLOR_THEMES: { id: WalletColorTheme; label: string; bgClass: string }[] = [
  { id: 'periwinkle', label: 'Periwinkle', bgClass: 'bg-[#7C7CE6]' },
  { id: 'blue', label: 'Biru', bgClass: 'bg-[#3B82F6]' },
  { id: 'mint', label: 'Mint', bgClass: 'bg-[#10B981]' },
  { id: 'peach', label: 'Peach', bgClass: 'bg-[#F87171]' },
  { id: 'neutral', label: 'Netral', bgClass: 'bg-[#6B7280]' },
];

export default function WalletDetailModal({
  wallet,
  isOpen,
  onClose,
  onEdit,
  onArchive,
}: WalletDetailModalProps) {
  if (!wallet) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="xl"
      hideHeader
      hideCloseButton={true}
      className="p-6 sm:p-8"
    >
      <div className="space-y-5 max-h-[85vh] overflow-y-auto">
        {/* ========================================================================= */}
        {/* 1. TOP HEADER ROW: ICON + TITLE + DEFAULT BADGE + SINGLE CLOSE BUTTON     */}
        {/* ========================================================================= */}
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#E4E2FB] text-[#7C7CE6] flex items-center justify-center shadow-xs">
              {getWalletIconComponent(wallet.icon || 'Bank', 20)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-extrabold text-[#242636] tracking-tight">
                  {wallet.name}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E4E2FB] text-[#5F5ED4] border border-[#7C7CE6]/20">
                  Utama
                </span>
              </div>
              <span className="text-xs text-[#757A95]">
                {formatWalletTypeLabel(wallet.type)}
              </span>
            </div>
          </div>

          {/* Single Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#757A95] hover:text-[#242636] hover:bg-black/[0.04] transition-colors cursor-pointer"
            title="Tutup"
          >
            <X size={18} />
          </button>
        </div>

        {/* ========================================================================= */}
        {/* 2. CARD PREVIEW (KIRI) & METADATA TABLE (KANAN)                           */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
          {/* Sisi Kiri: FinAI Wallet Card */}
          <div className="lg:col-span-6">
            <WalletCard wallet={wallet} />
          </div>

          {/* Sisi Kanan: Information List */}
          <div className="lg:col-span-6 p-4 rounded-2xl bg-[#F8F9FD] border border-black/[0.05] divide-y divide-black/[0.04] text-xs space-y-2">
            <div className="flex items-center justify-between pb-1 pt-0.5">
              <span className="text-[#757A95]">Nomor Rekening / ID</span>
              <span className="font-mono font-bold text-[#242636]">
                {wallet.accountIdentifier || '•••• 4821'}
              </span>
            </div>

            <div className="flex items-center justify-between py-1.5">
              <span className="text-[#757A95]">Mata Uang</span>
              <span className="font-bold text-[#242636]">
                {wallet.currency ? `${wallet.currency} (Rp)` : 'IDR (Rp)'}
              </span>
            </div>

            <div className="flex items-center justify-between py-1.5">
              <span className="text-[#757A95]">Dibuat</span>
              <span className="font-bold text-[#242636]">
                {wallet.createdDate || '15 Jul 2026'}
              </span>
            </div>

            <div className="flex items-center justify-between py-1.5">
              <span className="text-[#757A95]">Catatan</span>
              <span className="font-medium text-[#242636]">
                {wallet.notes || 'Tabungan utama'}
              </span>
            </div>

            <div className="flex items-center justify-between pt-1.5">
              <span className="text-[#757A95]">Warna Kartu</span>
              <div className="flex items-center gap-1.5">
                {COLOR_THEMES.map((c) => {
                  const isActive = (wallet.colorTheme || 'periwinkle') === c.id;
                  return (
                    <div
                      key={c.id}
                      className={`w-5 h-5 rounded-full ${c.bgClass} flex items-center justify-center ${
                        isActive ? 'ring-2 ring-black/20 scale-110' : 'opacity-70'
                      }`}
                    >
                      {isActive && <Check size={10} className="text-white" strokeWidth={3} />}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. THIS MONTH SUMMARY                                                     */}
        {/* ========================================================================= */}
        <div className="space-y-2">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#757A95]">
            Ringkasan Bulan Ini
          </span>
          <div className="grid grid-cols-3 gap-2.5">
            {/* Income */}
            <div className="p-3 rounded-2xl bg-[#EAF8F3] border border-[#B0E5D4] text-left">
              <span className="text-[10px] font-bold text-[#1B7354] flex items-center gap-1">
                <ArrowDownLeft size={13} /> Pemasukan
              </span>
              <div className="text-xs sm:text-sm font-extrabold text-[#1B7354] mt-0.5 tabular-nums">
                +Rp8.500.000
              </div>
            </div>

            {/* Expenses */}
            <div className="p-3 rounded-2xl bg-[#FFF1F0] border border-[#F7C0BC] text-left">
              <span className="text-[10px] font-bold text-[#B83A38] flex items-center gap-1">
                <ArrowUpRight size={13} /> Pengeluaran
              </span>
              <div className="text-xs sm:text-sm font-extrabold text-[#B83A38] mt-0.5 tabular-nums">
                -Rp2.400.000
              </div>
            </div>

            {/* Net */}
            <div className="p-3 rounded-2xl bg-[#F3F2FF] border border-[#CAC4F8] text-left">
              <span className="text-[10px] font-bold text-[#5F5ED4] flex items-center gap-1">
                <TrendingUp size={13} /> Arus Bersih
              </span>
              <div className="text-xs sm:text-sm font-extrabold text-[#4F4DBF] mt-0.5 tabular-nums">
                +Rp6.100.000
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 4. RECENT TRANSACTIONS                                                    */}
        {/* ========================================================================= */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#757A95]">
              Transaksi Terkini
            </span>
            <span className="text-[11px] font-bold text-[#7C7CE6] hover:underline cursor-pointer">
              Lihat Semua
            </span>
          </div>

          <div className="p-2.5 rounded-2xl bg-[#F8F9FD] border border-black/[0.05] divide-y divide-black/[0.04]">
            {/* Tx 1: Monthly Salary */}
            <div className="py-2 px-1.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-[#EAF8F3] text-[#1B7354] border border-[#B0E5D4] flex items-center justify-center shrink-0">
                  <ArrowDownLeft size={14} />
                </div>
                <div className="min-w-0">
                  <h5 className="text-xs font-bold text-[#242636] truncate">
                    Gaji Bulanan
                  </h5>
                  <span className="text-[10px] text-[#757A95]">
                    Pemasukan · 1 Agt 2026
                  </span>
                </div>
              </div>
              <div className="text-xs font-extrabold text-[#1B7354] tabular-nums shrink-0 ml-2">
                +Rp8.500.000
              </div>
            </div>

            {/* Tx 2: Groceries */}
            <div className="py-2 px-1.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-[#FFF1F0] text-[#B83A38] border border-[#F7C0BC] flex items-center justify-center shrink-0">
                  <ArrowUpRight size={14} />
                </div>
                <div className="min-w-0">
                  <h5 className="text-xs font-bold text-[#242636] truncate">
                    Belanja Supermarket
                  </h5>
                  <span className="text-[10px] text-[#757A95]">
                    Pengeluaran · 2 Agt 2026
                  </span>
                </div>
              </div>
              <div className="text-xs font-extrabold text-[#B83A38] tabular-nums shrink-0 ml-2">
                -Rp450.000
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 5. BOTTOM ACTION BUTTONS: EDIT WALLET & ARCHIVE WALLET                     */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            onClick={() => {
              onClose();
              onEdit(wallet);
            }}
            className="py-3 px-4 rounded-2xl bg-[#E4E2FB] hover:bg-[#D9D6F7] text-[#5F5ED4] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 border border-[#7C7CE6]/20 transition-all shadow-xs active:scale-[0.98] cursor-pointer"
          >
            <Pencil size={14} />
            <span>Edit Dompet</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onArchive(wallet);
            }}
            className="py-3 px-4 rounded-2xl bg-white hover:bg-[#FFF1F0] text-[#757A95] hover:text-[#B83A38] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 border border-black/[0.08] hover:border-[#F7C0BC] transition-all shadow-xs active:scale-[0.98] cursor-pointer"
          >
            <Archive size={14} />
            <span>Arsipkan Dompet</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}
