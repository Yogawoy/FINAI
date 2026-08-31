'use client';

import React, { useState, useEffect } from 'react';
import {
  Utensils,
  Car,
  ShoppingBag,
  Zap,
  Sparkles,
  Pencil,
  X,
} from 'lucide-react';
import Modal from '@/components/ui/Modal';
import DatePicker from '@/components/ui/DatePicker';
import TimePicker from '@/components/ui/TimePicker';
import WalletSelect from '@/components/ui/WalletSelect';
import SegmentedControl from '@/components/ui/SegmentedControl';
import { Transaction, TransactionCategory, TransactionType } from '@/types';
import { formatIDR } from '@/data/mockData';

interface EditTransactionModalProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateTransaction: (updatedTx: Transaction) => void;
}

const CORE_CATEGORIES: { id: TransactionCategory; label: string; icon: React.ReactNode }[] = [
  { id: 'food', label: 'Makanan', icon: <Utensils size={18} /> },
  { id: 'transport', label: 'Transportasi', icon: <Car size={18} /> },
  { id: 'shopping', label: 'Belanja', icon: <ShoppingBag size={18} /> },
  { id: 'bills', label: 'Tagihan', icon: <Zap size={18} /> },
  { id: 'other', label: 'Lainnya', icon: <Sparkles size={18} /> },
];

export default function EditTransactionModal({
  transaction,
  isOpen,
  onClose,
  onUpdateTransaction,
}: EditTransactionModalProps) {
  const [type, setType] = useState<TransactionType>('expense');
  const [rawAmount, setRawAmount] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<TransactionCategory>('food');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<string>('Cash');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (transaction) {
      setType(transaction.type);
      setRawAmount(transaction.amount.toString());
      setTitle(transaction.title);
      setCategory(transaction.category);
      setDate(transaction.date);
      setTime(transaction.time);
      const pm =
        transaction.paymentMethod === 'Bank' || transaction.account?.includes('BCA')
          ? 'BCA'
          : transaction.paymentMethod === 'E-Wallet' || transaction.account?.includes('GoPay')
          ? 'GoPay'
          : 'Cash';
      setPaymentMethod(pm);
      setNote(transaction.note || '');
    }
  }, [transaction]);

  if (!transaction) return null;

  const numAmount = parseFloat(rawAmount.replace(/\D/g, '')) || 0;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    setRawAmount(val);
  };

  const formattedAmountDisplay = numAmount > 0 ? formatIDR(numAmount).replace('Rp', '').trim() : '0';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || numAmount <= 0) return;

    const updatedTx: Transaction = {
      ...transaction,
      title: title.trim(),
      category: category,
      type: type,
      amount: numAmount,
      date: date,
      time: time,
      account: paymentMethod === 'BCA' ? 'BCA Prioritas' : paymentMethod === 'GoPay' ? 'GoPay' : paymentMethod === 'Savings' ? 'Pos Tabungan' : 'Uang Tunai',
      paymentMethod: (paymentMethod === 'BCA' ? 'Bank' : paymentMethod === 'GoPay' ? 'E-Wallet' : 'Cash') as any,
      note: note.trim() || undefined,
    };

    onUpdateTransaction(updatedTx);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="xl"
      noPadding
      hideHeader={true}
      hideCloseButton={true}
      className="overflow-hidden"
    >
      <div className="flex flex-col md:flex-row min-h-[520px]">
        {/* ========================================================================= */}
        {/* SISI KIRI: ILUSTRASI 2D NOTEBOOK & PENSIL LEMBUT                           */}
        {/* ========================================================================= */}
        <div className="hidden md:flex md:w-5/12 bg-gradient-to-br from-[#F5F4FE] via-[#EDEAFC] to-[#E3E0FA] p-8 flex-col justify-between items-center relative overflow-hidden border-r border-[#E4E2FB]/70">
          <div className="w-full text-left relative z-10">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#7C7CE6]">
              Perbarui Catatan
            </span>
            <h4 className="text-base font-bold text-[#242636] mt-0.5">
              Edit Transaksi Kas
            </h4>
          </div>

          {/* 2D SVG / CSS Notebook & Pen Illustration */}
          <div className="relative my-auto flex items-center justify-center scale-105">
            {/* Soft background glow */}
            <div className="absolute w-36 h-36 rounded-full bg-[#7C7CE6]/20 blur-2xl pointer-events-none" />

            {/* Notebook Container */}
            <div className="relative w-36 h-44 rounded-3xl bg-white p-4 shadow-[0_15px_35px_rgba(124,124,230,0.2)] border border-[#E4E2FB] flex flex-col justify-between transform -rotate-3">
              <div className="flex items-center justify-between border-b border-black/[0.05] pb-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-[#FCE2E0]" />
                  <div className="w-2 h-2 rounded-full bg-[#FEF3C7]" />
                  <div className="w-2 h-2 rounded-full bg-[#D0EFE5]" />
                </div>
                <Sparkles size={12} className="text-[#7C7CE6]" />
              </div>
              <div className="space-y-2 py-2">
                <div className="w-16 h-1.5 rounded-full bg-[#E4E2FB]" />
                <div className="w-20 h-1.5 rounded-full bg-black/[0.06]" />
                <div className="w-12 h-1.5 rounded-full bg-black/[0.06]" />
                <div className="w-14 h-1.5 rounded-full bg-[#D0EFE5]" />
              </div>
              <div className="pt-2 border-t border-black/[0.05] flex justify-end">
                <div className="w-6 h-6 rounded-lg bg-[#EDEAFC] text-[#7C7CE6] flex items-center justify-center">
                  <Pencil size={11} />
                </div>
              </div>
            </div>
          </div>

          <div className="w-full text-center text-xs text-[#757A95] relative z-10">
            Perubahan data transaksi akan langsung diselaraskan ke laporan.
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SISI KANAN: FORM EDIT TRANSAKSI                                          */}
        {/* ========================================================================= */}
        <div className="w-full md:w-7/12 p-6 sm:p-8 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between pb-1">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-[#E4E2FB] text-[#7C7CE6] flex items-center justify-center">
                  <Pencil size={13} />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-[#242636] tracking-tight">
                  Edit Transaksi
                </h3>
              </div>
              <p className="text-xs text-[#757A95] mt-0.5">
                Perbarui detail transaksi.
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

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 1. Type Toggle Custom Segmented Control */}
            <SegmentedControl
              value={type}
              onChange={(val) => setType(val as TransactionType)}
              options={[
                { value: 'expense', label: 'Pengeluaran' },
                { value: 'income', label: 'Pemasukan' },
              ]}
            />

            {/* 2. Amount */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-[#F8F9FD] border border-black/[0.06] space-y-1 focus-within:border-[#7C7CE6] focus-within:bg-white transition-all">
              <label className="text-[11px] font-bold text-[#757A95] uppercase tracking-wider block">
                Nominal
              </label>
              <div className="flex items-center text-xl sm:text-2xl font-extrabold text-[#242636]">
                <span className="text-[#757A95] mr-2">Rp</span>
                <input
                  type="text"
                  required
                  value={formattedAmountDisplay}
                  onChange={handleAmountChange}
                  className="w-full bg-transparent focus:outline-none tracking-tight font-extrabold text-[#242636]"
                />
              </div>
            </div>

            {/* 3. Category Grid */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[#757A95] uppercase tracking-wider block">
                Kategori
              </label>
              <div className="grid grid-cols-5 gap-2">
                {CORE_CATEGORIES.map((cat) => {
                  const isSelected = category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#E4E2FB]/80 border-[#7C7CE6] text-[#5F5ED4] shadow-xs scale-102 font-bold'
                          : 'bg-white border-black/[0.06] text-[#757A95] hover:bg-black/[0.02] hover:text-[#242636]'
                      }`}
                    >
                      <div className="mb-1">{cat.icon}</div>
                      <span className="text-[11px]">{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Description */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[#757A95] uppercase tracking-wider block">
                Deskripsi / Keterangan
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#F8F9FD] border border-black/[0.06] rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#7C7CE6]/40 focus:bg-white text-[#242636]"
              />
            </div>

            {/* 5. Custom Date & Time Pickers */}
            <div className="grid grid-cols-2 gap-3">
              <DatePicker
                label="Tanggal"
                value={date}
                onChange={setDate}
              />

              <TimePicker
                label="Waktu"
                value={time}
                onChange={setTime}
              />
            </div>

            {/* 6. Custom Wallet Selector & Note */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
              <WalletSelect
                label="Dompet / Sumber Dana"
                value={paymentMethod}
                onChange={setPaymentMethod}
              />

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#757A95] uppercase tracking-wider block">
                  Catatan <span className="font-normal lowercase text-[#757A95]/80">(opsional)</span>
                </label>
                <input
                  type="text"
                  placeholder="Tambah catatan..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F8F9FD] border border-black/[0.06] rounded-xl text-xs sm:text-sm text-[#242636] focus:outline-none focus:ring-2 focus:ring-[#7C7CE6]/40 focus:bg-white"
                />
              </div>
            </div>

            {/* 7. Action Buttons */}
            <div className="pt-2 space-y-2">
              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#7C7CE6] to-[#8C8BE8] text-white font-bold text-sm shadow-[0_8px_20px_rgba(124,124,230,0.35)] hover:shadow-[0_10px_25px_rgba(124,124,230,0.45)] hover:brightness-105 active:scale-[0.99] transition-all cursor-pointer"
              >
                Simpan Perubahan
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full py-1.5 text-center text-xs font-semibold text-[#757A95] hover:text-[#242636] transition-colors cursor-pointer"
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      </div>
    </Modal>
  );
}
