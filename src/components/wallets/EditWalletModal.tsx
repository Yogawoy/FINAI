'use client';

import React, { useState, useEffect } from 'react';
import {
  Building2,
  Wallet as WalletIcon,
  Banknote,
  CreditCard,
  PiggyBank,
  TrendingUp,
  Sparkles,
  Pencil,
  Check,
  ChevronDown,
  Info,
  X,
} from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { Wallet, WalletColorTheme, WalletType } from '@/types';
import { formatIDR } from '@/lib/format';
import { getWalletIconComponent } from './WalletCard';

interface EditWalletModalProps {
  wallet: Wallet | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateWallet: (updatedWallet: Wallet) => void;
}

const WALLET_TYPES: { id: WalletType; label: string; icon: React.ReactNode }[] = [
  { id: 'bank', label: 'Rekening Bank', icon: <Building2 size={18} /> },
  { id: 'ewallet', label: 'E-Wallet', icon: <WalletIcon size={18} /> },
  { id: 'cash', label: 'Uang Tunai', icon: <Banknote size={18} /> },
  { id: 'savings', label: 'Tabungan', icon: <PiggyBank size={18} /> },
  { id: 'investment', label: 'Investasi', icon: <TrendingUp size={18} /> },
  { id: 'other', label: 'Lainnya', icon: <Sparkles size={18} /> },
];

const WALLET_ICONS = [
  { id: 'Bank', label: 'Bank', icon: <Building2 size={18} /> },
  { id: 'Wallet', label: 'Dompet', icon: <WalletIcon size={18} /> },
  { id: 'Cash', label: 'Tunai', icon: <Banknote size={18} /> },
  { id: 'Card', label: 'Kartu', icon: <CreditCard size={18} /> },
  { id: 'Savings', label: 'Tabungan', icon: <PiggyBank size={18} /> },
  { id: 'Investment', label: 'Investasi', icon: <TrendingUp size={18} /> },
  { id: 'Other', label: 'Lainnya', icon: <Sparkles size={18} /> },
];

const COLOR_THEMES: { id: WalletColorTheme; label: string; bgClass: string }[] = [
  { id: 'periwinkle', label: 'Periwinkle', bgClass: 'bg-[#7C7CE6]' },
  { id: 'blue', label: 'Biru', bgClass: 'bg-[#3B82F6]' },
  { id: 'mint', label: 'Mint', bgClass: 'bg-[#10B981]' },
  { id: 'peach', label: 'Peach', bgClass: 'bg-[#F87171]' },
  { id: 'neutral', label: 'Netral', bgClass: 'bg-[#6B7280]' },
];

export default function EditWalletModal({
  wallet,
  isOpen,
  onClose,
  onUpdateWallet,
}: EditWalletModalProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<WalletType>('bank');
  const [currency, setCurrency] = useState('IDR (Rp)');
  const [identifier, setIdentifier] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('Bank');
  const [selectedColor, setSelectedColor] = useState<WalletColorTheme>('periwinkle');
  const [notes, setNotes] = useState('');
  const [isIconDropdownOpen, setIsIconDropdownOpen] = useState(false);

  useEffect(() => {
    if (wallet) {
      setName(wallet.name);
      setType(wallet.type);
      setCurrency(wallet.currency === 'IDR' ? 'IDR (Rp)' : wallet.currency);
      setIdentifier(wallet.accountIdentifier || '');
      setSelectedIcon(wallet.icon || 'Bank');
      setSelectedColor(wallet.colorTheme || 'periwinkle');
      setNotes(wallet.notes || '');
    }
  }, [wallet]);

  if (!wallet) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const updated: Wallet = {
      ...wallet,
      name: name.trim(),
      type: type,
      currency: currency.includes('IDR') ? 'IDR' : currency,
      icon: selectedIcon,
      colorTheme: selectedColor,
      accountIdentifier: identifier.trim() || undefined,
      notes: notes.trim() || undefined,
    };

    onUpdateWallet(updated);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="lg"
      hideHeader
      hideCloseButton={true}
      className="p-6 sm:p-8 overflow-hidden"
    >
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between pb-1 border-b border-black/[0.04]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#EDEAFC] text-[#5F5ED4] flex items-center justify-center">
              <Pencil size={16} />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-[#242636] tracking-tight">
                Edit Dompet
              </h3>
              <p className="text-xs text-[#757A95] mt-0.5">
                Perbarui data dan preferensi akun dompet Anda.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#757A95] hover:text-[#242636] hover:bg-black/[0.04] transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 1. Wallet Type Selector */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-[#757A95] uppercase tracking-wider block">
              Tipe Dompet
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
              {WALLET_TYPES.map((wt) => {
                const isSelected = type === wt.id;
                return (
                  <button
                    key={wt.id}
                    type="button"
                    onClick={() => {
                      setType(wt.id);
                      if (wt.id === 'bank') setSelectedIcon('Bank');
                      else if (wt.id === 'cash') setSelectedIcon('Cash');
                      else if (wt.id === 'ewallet') setSelectedIcon('Wallet');
                      else if (wt.id === 'savings') setSelectedIcon('Savings');
                      else if (wt.id === 'investment') setSelectedIcon('Investment');
                      else setSelectedIcon('Other');
                    }}
                    className={`flex flex-col items-center justify-center p-2 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#E4E2FB] border-[#7C7CE6] text-[#5F5ED4] shadow-xs scale-102 font-bold'
                        : 'bg-[#F8F9FD] border-black/[0.05] text-[#757A95] hover:bg-black/[0.03] hover:text-[#242636]'
                    }`}
                  >
                    <div className="mb-1">{wt.icon}</div>
                    <span className="text-[10px] leading-tight text-center truncate w-full">
                      {wt.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Wallet Name & Icon Picker */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
            <div className="sm:col-span-8 space-y-1">
              <label className="text-[11px] font-bold text-[#757A95] uppercase tracking-wider block">
                Nama Dompet / Rekening
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#F8F9FD] border border-black/[0.06] rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#7C7CE6]/40 focus:bg-white text-[#242636]"
              />
            </div>

            <div className="sm:col-span-4 space-y-1 relative">
              <label className="text-[11px] font-bold text-[#757A95] uppercase tracking-wider block">
                Ikon
              </label>
              <button
                type="button"
                onClick={() => setIsIconDropdownOpen(!isIconDropdownOpen)}
                className="w-full px-3 py-2.5 bg-[#F8F9FD] border border-black/[0.06] rounded-xl text-xs sm:text-sm flex items-center justify-between text-[#242636] hover:bg-white transition-all cursor-pointer"
              >
                <div className="flex items-center gap-1.5 text-[#7C7CE6]">
                  {getWalletIconComponent(selectedIcon, 16)}
                </div>
                <ChevronDown size={14} className="text-[#757A95]" />
              </button>

              {isIconDropdownOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-40 p-1.5 bg-white border border-black/[0.08] rounded-2xl shadow-[0_12px_30px_rgba(36,38,54,0.12)] z-30 grid grid-cols-4 gap-1">
                  {WALLET_ICONS.map((ico) => (
                    <button
                      key={ico.id}
                      type="button"
                      onClick={() => {
                        setSelectedIcon(ico.id);
                        setIsIconDropdownOpen(false);
                      }}
                      className={`p-2 rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
                        selectedIcon === ico.id
                          ? 'bg-[#7C7CE6] text-white'
                          : 'hover:bg-black/[0.04] text-[#757A95]'
                      }`}
                      title={ico.label}
                    >
                      {ico.icon}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 3. Account Number / Identifier & Color Theme */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
            <div className="sm:col-span-7 space-y-1">
              <label className="text-[11px] font-bold text-[#757A95] uppercase tracking-wider block">
                Nomor Rekening / ID <span className="font-normal lowercase text-[#757A95]/80">(opsional)</span>
              </label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#F8F9FD] border border-black/[0.06] rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#7C7CE6]/40 focus:bg-white text-[#242636]"
              />
            </div>

            <div className="sm:col-span-5 space-y-1">
              <label className="text-[11px] font-bold text-[#757A95] uppercase tracking-wider block">
                Warna Kartu
              </label>
              <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                {COLOR_THEMES.map((theme) => {
                  const isSelected = selectedColor === theme.id;
                  return (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => setSelectedColor(theme.id)}
                      className={`w-7 h-7 rounded-full ${theme.bgClass} flex items-center justify-center transition-all cursor-pointer border-2 ${
                        isSelected ? 'border-black/30 scale-115 shadow-xs' : 'border-white/80 opacity-80 hover:opacity-100'
                      }`}
                      title={theme.label}
                    >
                      {isSelected && <Check size={13} className="text-white" strokeWidth={3} />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 4. Notes */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-[#757A95] uppercase tracking-wider block">
              Catatan <span className="font-normal lowercase text-[#757A95]/80">(opsional)</span>
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 bg-[#F8F9FD] border border-black/[0.06] rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#7C7CE6]/40 focus:bg-white text-[#242636]"
            />
          </div>

          {/* Balance info callout */}
          <div className="p-3 rounded-2xl bg-[#EDEAFC]/60 border border-[#7C7CE6]/20 flex items-center gap-2.5 text-xs text-[#5F5ED4]">
            <Info size={16} className="shrink-0" />
            <p className="text-[11px] leading-relaxed">
              Saldo aktif saat ini adalah <strong>{formatIDR(wallet.balance)}</strong>. Untuk menyesuaikan saldo kas riil, lakukan penambahan transaksi kas baru.
            </p>
          </div>

          {/* 5. Bottom Action Buttons: Cancel & Save Changes */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-5 rounded-2xl bg-black/[0.03] hover:bg-black/[0.06] text-[#757A95] hover:text-[#242636] font-bold text-xs sm:text-sm transition-all cursor-pointer"
            >
              Batal
            </button>

            <button
              type="submit"
              className="py-2.5 px-6 rounded-2xl bg-gradient-to-r from-[#7C7CE6] to-[#8C8BE8] text-white font-bold text-xs sm:text-sm shadow-[0_8px_20px_rgba(124,124,230,0.35)] hover:brightness-105 active:scale-[0.99] transition-all cursor-pointer"
            >
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
