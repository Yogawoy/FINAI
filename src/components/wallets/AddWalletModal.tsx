'use client';

import React, { useState } from 'react';
import {
  Building2,
  Wallet as WalletIcon,
  Banknote,
  CreditCard,
  PiggyBank,
  TrendingUp,
  Sparkles,
  Plus,
  Check,
  ChevronDown,
  X,
} from 'lucide-react';
import Modal from '@/components/ui/Modal';
import CustomSelect from '@/components/ui/CustomSelect';
import { Wallet, WalletColorTheme, WalletType } from '@/types';
import { formatIDR } from '@/lib/format';
import WalletCard, { getWalletIconComponent } from './WalletCard';

interface AddWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddWallet: (wallet: Wallet) => void;
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

export default function AddWalletModal({
  isOpen,
  onClose,
  onAddWallet,
}: AddWalletModalProps) {
  const [name, setName] = useState('BCA');
  const [type, setType] = useState<WalletType>('bank');
  const [rawAmount, setRawAmount] = useState('12500000');
  const [currency, setCurrency] = useState('IDR (Rp)');
  const [identifier, setIdentifier] = useState('•••• 4821');
  const [selectedIcon, setSelectedIcon] = useState('Bank');
  const [selectedColor, setSelectedColor] = useState<WalletColorTheme>('periwinkle');
  const [notes, setNotes] = useState('Tabungan utama');
  const [isIconDropdownOpen, setIsIconDropdownOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const numAmount = parseFloat(rawAmount.replace(/\D/g, '')) || 0;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    setRawAmount(val);
  };

  const formattedAmountDisplay = numAmount > 0 ? formatIDR(numAmount).replace('Rp', '').trim() : '0';

  // Live real-time preview wallet card
  const expiryStr = `${String(new Date().getMonth() + 1).padStart(2, '0')}/${String((new Date().getFullYear() + 3) % 100).padStart(2, '0')}`;
  const todayStr = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  const previewWallet: Wallet = {
    id: 'preview-card',
    name: name.trim() || 'BCA',
    type: type,
    balance: numAmount,
    currency: currency.includes('IDR') ? 'IDR' : currency,
    icon: selectedIcon,
    colorTheme: selectedColor,
    accountIdentifier: identifier.trim() || '•••• •••• •••• 4821',
    holderName: 'Yoga W.',
    expiry: expiryStr,
    createdDate: todayStr,
    notes: notes,
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('Silakan masukkan nama dompet / rekening.');
      return;
    }

    const newWallet: Wallet = {
      id: `w-${Date.now()}`,
      name: name.trim(),
      type: type,
      balance: numAmount,
      currency: currency.includes('IDR') ? 'IDR' : currency,
      icon: selectedIcon,
      colorTheme: selectedColor,
      accountIdentifier: identifier.trim() || undefined,
      holderName: 'Yoga W.',
      expiry: `${String(new Date().getMonth() + 1).padStart(2, '0')}/${String((new Date().getFullYear() + 3) % 100).padStart(2, '0')}`,
      isArchived: false,
      createdDate: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
      notes: notes.trim() || undefined,
    };

    onAddWallet(newWallet);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="2xl"
      noPadding
      hideHeader={true}
      hideCloseButton={true}
      className="overflow-hidden"
    >
      <div className="flex flex-col lg:flex-row min-h-[580px]">
        {/* ========================================================================= */}
        {/* SISI KIRI: LIVE FINAI WALLET CARD PREVIEW (REAL-TIME)                      */}
        {/* ========================================================================= */}
        <div className="lg:w-5/12 bg-gradient-to-br from-[#F5F4FE] via-[#EDEAFC] to-[#E2EDFC] p-6 sm:p-7 flex flex-col justify-center items-center border-b lg:border-b-0 lg:border-r border-[#E4E2FB] relative overflow-hidden">
          <div className="w-full max-w-[320px] relative z-10">
            <WalletCard wallet={previewWallet} />
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SISI KANAN: FORM TAMBAH DOMPET                                            */}
        {/* ========================================================================= */}
        <div className="w-full lg:w-7/12 p-6 sm:p-7 space-y-4 max-h-[85vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-start justify-between pb-1">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-[#E4E2FB] text-[#7C7CE6] flex items-center justify-center">
                  <Plus size={14} strokeWidth={2.5} />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-[#242636] tracking-tight">
                  Tambah Dompet Baru
                </h3>
              </div>
              <p className="text-xs text-[#757A95] mt-0.5">
                Tambahkan sumber dana atau rekening tempat Anda menyimpan uang.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-[#757A95] hover:text-[#242636] hover:bg-black/[0.04] transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {errorMessage && (
            <div className="p-2.5 rounded-xl bg-[#FFF1F0] border border-[#FAC2BE] text-xs font-semibold text-[#B83A38]">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* 1. Wallet Type: 6 Square/Pill Icons */}
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
                  placeholder="misal: BCA"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setErrorMessage('');
                  }}
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

            {/* 3. Initial Balance & Currency */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
              <div className="sm:col-span-8 p-3 rounded-2xl bg-[#F8F9FD] border border-black/[0.06] space-y-0.5 focus-within:border-[#7C7CE6] focus-within:bg-white transition-all">
                <label className="text-[10px] font-bold text-[#757A95] uppercase tracking-wider block">
                  Saldo Awal
                </label>
                <div className="flex items-center text-lg sm:text-xl font-extrabold text-[#242636]">
                  <span className="text-[#757A95] mr-1.5 text-sm">Rp</span>
                  <input
                    type="text"
                    required
                    value={formattedAmountDisplay}
                    onChange={handleAmountChange}
                    className="w-full bg-transparent focus:outline-none tracking-tight font-extrabold text-[#242636]"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="sm:col-span-4 space-y-1">
                <CustomSelect
                  label="Mata Uang"
                  value={currency}
                  onChange={setCurrency}
                  options={[
                    { value: 'IDR (Rp)', label: 'IDR (Rp)' },
                    { value: 'USD ($)', label: 'USD ($)' },
                    { value: 'EUR (€)', label: 'EUR (€)' },
                    { value: 'SGD ($)', label: 'SGD ($)' },
                  ]}
                />
              </div>
            </div>

            {/* 4. Account Number & Wallet Color Theme */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
              <div className="sm:col-span-7 space-y-1">
                <label className="text-[11px] font-bold text-[#757A95] uppercase tracking-wider block">
                  Nomor Rekening / ID <span className="font-normal lowercase text-[#757A95]/80">(opsional)</span>
                </label>
                <input
                  type="text"
                  placeholder="•••• 4821"
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

            {/* 5. Notes */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[#757A95] uppercase tracking-wider block">
                Catatan <span className="font-normal lowercase text-[#757A95]/80">(opsional)</span>
              </label>
              <input
                type="text"
                placeholder="misal: Tabungan utama atau pos belanja"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#F8F9FD] border border-black/[0.06] rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#7C7CE6]/40 focus:bg-white text-[#242636]"
              />
            </div>

            {/* 6. Bottom Action Buttons: Cancel & + Create Wallet */}
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
                className="py-2.5 px-6 rounded-2xl bg-gradient-to-r from-[#7C7CE6] to-[#8C8BE8] text-white font-bold text-xs sm:text-sm shadow-[0_8px_20px_rgba(124,124,230,0.35)] hover:brightness-105 active:scale-[0.99] transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Plus size={15} strokeWidth={2.5} />
                <span>Buat Dompet</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Modal>
  );
}
