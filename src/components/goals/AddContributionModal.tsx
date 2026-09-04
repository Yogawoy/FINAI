'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wallet as WalletIcon,
  X,
  Target,
  ChevronDown,
  ArrowDown,
  ArrowLeftRight,
  Calendar as CalendarIcon,
  FileText,
  ShieldCheck,
  Check,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { GoalItem, GoalContribution, Wallet } from '@/types';
import { formatIDR } from '@/lib/format';

interface AddContributionModalProps {
  goal: GoalItem | null;
  isOpen: boolean;
  onClose: () => void;
  onAddContribution: (goalId: string, contribution: GoalContribution) => void;
  wallets?: Wallet[];
}

const MONTH_NAMES_ID = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

const DAY_NAMES_ID = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

export default function AddContributionModal({
  goal,
  isOpen,
  onClose,
  onAddContribution,
  wallets = [],
}: AddContributionModalProps) {
  const getTodayISO = () => new Date().toISOString().split('T')[0];
  const [amountRaw, setAmountRaw] = useState('500000');
  const [sourceWalletId, setSourceWalletId] = useState('w-1');
  const [destinationWalletId, setDestinationWalletId] = useState('w-5');
  const [date, setDate] = useState(getTodayISO());
  const [note, setNote] = useState('');

  React.useEffect(() => {
    if (isOpen) setDate(getTodayISO());
  }, [isOpen]);

  // Custom Dropdowns & Popovers
  const [isSourceOpen, setIsSourceOpen] = useState(false);
  const [isDestOpen, setIsDestOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const sourceRef = useRef<HTMLDivElement>(null);
  const destRef = useRef<HTMLDivElement>(null);
  const dateRef = useRef<HTMLDivElement>(null);

  // Sync with goal defaults on open
  useEffect(() => {
    if (goal) {
      setSourceWalletId(goal.sourceWalletId || 'w-1');
      setDestinationWalletId(goal.destinationWalletId || 'w-5');
      setAmountRaw('500000');
      setDate('2026-09-01');
      setNote('Setoran bulan September');
    }
  }, [goal, isOpen]);

  // Click outside to close custom popovers
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (sourceRef.current && !sourceRef.current.contains(e.target as Node)) {
        setIsSourceOpen(false);
      }
      if (destRef.current && !destRef.current.contains(e.target as Node)) {
        setIsDestOpen(false);
      }
      if (dateRef.current && !dateRef.current.contains(e.target as Node)) {
        setIsDatePickerOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const amount = parseFloat(amountRaw.replace(/\D/g, '')) || 0;
  const remaining = goal ? Math.max(goal.targetAmount - goal.currentAmount, 0) : 0;

  const sourceWallet = useMemo(
    () => wallets.find((w) => w.id === sourceWalletId) || wallets[0],
    [wallets, sourceWalletId]
  );
  const destinationWallet = useMemo(
    () => wallets.find((w) => w.id === destinationWalletId) || wallets[wallets.length - 1],
    [wallets, destinationWalletId]
  );

  const isSameWallet = sourceWalletId === destinationWalletId;
  const isInsufficient = sourceWallet ? sourceWallet.balance < amount : false;

  // Formatted date display (e.g. 1 September 2026)
  const displayFormattedDate = useMemo(() => {
    if (!date) return '1 September 2026';
    const parts = date.split('-').map(Number);
    if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
      const day = parts[2];
      const monthName = MONTH_NAMES_ID[parts[1] - 1] || '';
      const year = parts[0];
      return `${day} ${monthName} ${year}`;
    }
    return date;
  }, [date]);

  // Calendar navigation state
  const parsedDate = useMemo(() => {
    if (!date) return new Date(2026, 8, 1);
    const parts = date.split('-').map(Number);
    if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
      return new Date(parts[0], parts[1] - 1, parts[2]);
    }
    return new Date(2026, 8, 1);
  }, [date]);

  const [viewYear, setViewYear] = useState(parsedDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(parsedDate.getMonth());

  useEffect(() => {
    if (isDatePickerOpen) {
      setViewYear(parsedDate.getFullYear());
      setViewMonth(parsedDate.getMonth());
    }
  }, [isDatePickerOpen, parsedDate]);

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();
    const normalizedFirstDay = (firstDayIndex + 6) % 7;
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const days: { day: number; currentMonth: boolean; dateStr: string }[] = [];

    for (let i = normalizedFirstDay - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const m = viewMonth === 0 ? 12 : viewMonth;
      const y = viewMonth === 0 ? viewYear - 1 : viewYear;
      days.push({
        day: d,
        currentMonth: false,
        dateStr: `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
      });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      days.push({
        day: d,
        currentMonth: true,
        dateStr: `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
      });
    }

    const totalCells = Math.ceil(days.length / 7) * 7;
    const remainingCells = totalCells - days.length;
    for (let d = 1; d <= remainingCells; d++) {
      const m = viewMonth === 11 ? 1 : viewMonth + 2;
      const y = viewMonth === 11 ? viewYear + 1 : viewYear;
      days.push({
        day: d,
        currentMonth: false,
        dateStr: `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
      });
    }

    return days;
  }, [viewYear, viewMonth]);

  if (!goal) return null;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, '');
    if (!rawVal) {
      setAmountRaw('0');
      return;
    }
    const num = parseInt(rawVal, 10);
    setAmountRaw(new Intl.NumberFormat('id-ID').format(num));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0 || isSameWallet || isInsufficient) return;

    const newContrib: GoalContribution = {
      id: `c-${Date.now()}`,
      amount,
      date,
      sourceWalletId,
      sourceWalletName: sourceWallet ? sourceWallet.name : 'BCA',
      destinationWalletId,
      destinationWalletName: destinationWallet ? destinationWallet.name : 'Tabungan Kuliah',
      note: note.trim() || `Setoran ${goal.title}`,
    };

    onAddContribution(goal.id, newContrib);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="5xl"
      hideHeader
      hideCloseButton
      className="p-6 sm:p-8 md:p-9 rounded-[32px]"
    >
      <div className="space-y-6">
        {/* ========================================================================= */}
        {/* 1. HEADER                                                                 */}
        {/* ========================================================================= */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#EDEAFC] text-[#5F5ED4] flex items-center justify-center shadow-xs shrink-0">
              <WalletIcon size={22} strokeWidth={2.2} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[#242636] tracking-tight">
                Tambah Tabungan
              </h2>
              <p className="text-xs sm:text-sm font-semibold text-[#757A95] mt-0.5">
                {goal.title}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup modal"
            className="w-9 h-9 rounded-full flex items-center justify-center text-[#757A95] hover:text-[#242636] hover:bg-black/[0.04] transition-colors cursor-pointer"
          >
            <X size={19} />
          </button>
        </div>

        {/* ========================================================================= */}
        {/* 2. MAIN HORIZONTAL 2-COLUMN GRID (50% LEFT / 50% RIGHT)                  */}
        {/* ========================================================================= */}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 sm:gap-8 items-start">
            {/* ===================================================================== */}
            {/* LEFT PANEL: FORM INPUTS                                               */}
            {/* ===================================================================== */}
            <div className="lg:col-span-6 space-y-4">
              {/* Sisa Target Bar */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-[#FAFBFD] border border-black/[0.05] shadow-2xs flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#EDEAFC] text-[#5F5ED4] flex items-center justify-center shrink-0">
                    <Target size={18} />
                  </div>
                  <span className="text-xs font-semibold text-[#757A95]">
                    Sisa target yang perlu dicapai
                  </span>
                </div>
                <span className="text-sm sm:text-base font-extrabold text-[#5F5ED4] tabular-nums">
                  {formatIDR(remaining)}
                </span>
              </div>

              {/* Nominal Tabungan Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#757A95] block">
                  Nominal Tabungan
                </label>
                <div className="h-16 px-4 rounded-2xl bg-white border border-black/[0.08] focus-within:border-[#7C7CE6] focus-within:ring-2 focus-within:ring-[#7C7CE6]/20 flex items-center transition-all shadow-xs">
                  <span className="text-lg font-bold text-[#757A95] mr-2.5 select-none">
                    Rp
                  </span>
                  <input
                    type="text"
                    required
                    value={amountRaw}
                    onChange={handleAmountChange}
                    placeholder="500.000"
                    className="w-full bg-transparent text-2xl sm:text-3xl font-black text-[#242636] placeholder-[#C0C3D2] tabular-nums tracking-tight focus:outline-none"
                  />
                </div>
                {isInsufficient && (
                  <p className="text-[11px] font-semibold text-[#DC2626] flex items-center gap-1 mt-1">
                    <AlertCircle size={13} />
                    Saldo dompet sumber ({formatIDR(sourceWallet.balance)}) tidak mencukupi.
                  </p>
                )}
              </div>

              {/* Dual Wallets: Dari (Sumber) & Ke (Tujuan) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Dari Dompet (Sumber) */}
                <div ref={sourceRef} className="relative space-y-1.5">
                  <label className="text-xs font-bold text-[#757A95] block">
                    Dari Dompet (Sumber)
                  </label>

                  <button
                    type="button"
                    onClick={() => {
                      setIsSourceOpen(!isSourceOpen);
                      setIsDestOpen(false);
                    }}
                    className={`w-full h-14 px-3.5 rounded-2xl bg-white border transition-all flex items-center justify-between text-left cursor-pointer shadow-2xs ${
                      isSourceOpen
                        ? 'border-[#7C7CE6] ring-2 ring-[#7C7CE6]/20'
                        : 'border-black/[0.08] hover:border-black/[0.15]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-[#EDEAFC] text-[#5F5ED4] flex items-center justify-center shrink-0">
                        <WalletIcon size={16} />
                      </div>
                      <div className="min-w-0">
                        <span className="block text-xs sm:text-sm font-bold text-[#242636] truncate">
                          {sourceWallet?.name || 'BCA'}
                        </span>
                        <span className="block text-[11px] text-[#757A95] font-medium truncate">
                          {sourceWallet?.accountIdentifier || '•••• 4821'}
                        </span>
                      </div>
                    </div>
                    <ChevronDown
                      size={15}
                      className={`text-[#757A95] transition-transform duration-200 shrink-0 ${
                        isSourceOpen ? 'rotate-180 text-[#7C7CE6]' : ''
                      }`}
                    />
                  </button>

                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {isSourceOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.98 }}
                        transition={{ duration: 0.15 }}
                        className="absolute left-0 top-full mt-1.5 w-full bg-white rounded-2xl border border-black/[0.08] shadow-[0_12px_36px_rgba(36,38,54,0.12)] p-1.5 z-40 space-y-1 max-h-56 overflow-y-auto custom-scrollbar"
                      >
                        {wallets.map((w) => {
                          const isSelected = w.id === sourceWalletId;
                          return (
                            <button
                              key={w.id}
                              type="button"
                              onClick={() => {
                                setSourceWalletId(w.id);
                                setIsSourceOpen(false);
                              }}
                              className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between transition-colors cursor-pointer ${
                                isSelected
                                  ? 'bg-[#EDEAFC] text-[#5F5ED4]'
                                  : 'hover:bg-[#F8F9FD] text-[#242636]'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-7 h-7 rounded-lg bg-black/[0.04] flex items-center justify-center text-[#757A95] shrink-0">
                                  <WalletIcon size={14} />
                                </div>
                                <div className="min-w-0">
                                  <span className="block text-xs font-bold truncate">
                                    {w.name}
                                  </span>
                                  <span className="block text-[10px] text-[#757A95] tabular-nums truncate">
                                    {formatIDR(w.balance)}
                                  </span>
                                </div>
                              </div>
                              {isSelected && <Check size={14} className="text-[#5F5ED4] shrink-0" />}
                            </button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Ke Dompet (Tujuan) */}
                <div ref={destRef} className="relative space-y-1.5">
                  <label className="text-xs font-bold text-[#757A95] block">
                    Ke Dompet (Tujuan)
                  </label>

                  <button
                    type="button"
                    onClick={() => {
                      setIsDestOpen(!isDestOpen);
                      setIsSourceOpen(false);
                    }}
                    className={`w-full h-14 px-3.5 rounded-2xl bg-white border transition-all flex items-center justify-between text-left cursor-pointer shadow-2xs ${
                      isDestOpen
                        ? 'border-[#7C7CE6] ring-2 ring-[#7C7CE6]/20'
                        : 'border-black/[0.08] hover:border-black/[0.15]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-[#EDEAFC] text-[#5F5ED4] flex items-center justify-center shrink-0">
                        <WalletIcon size={16} />
                      </div>
                      <div className="min-w-0">
                        <span className="block text-xs sm:text-sm font-bold text-[#242636] truncate">
                          {destinationWallet?.name || 'Tabungan Kuliah'}
                        </span>
                        <span className="block text-[11px] text-[#757A95] font-medium truncate">
                          Tujuan Tabungan
                        </span>
                      </div>
                    </div>
                    <ChevronDown
                      size={15}
                      className={`text-[#757A95] transition-transform duration-200 shrink-0 ${
                        isDestOpen ? 'rotate-180 text-[#7C7CE6]' : ''
                      }`}
                    />
                  </button>

                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {isDestOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.98 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-1.5 w-full bg-white rounded-2xl border border-black/[0.08] shadow-[0_12px_36px_rgba(36,38,54,0.12)] p-1.5 z-40 space-y-1 max-h-56 overflow-y-auto custom-scrollbar"
                      >
                        {wallets.map((w) => {
                          const isSelected = w.id === destinationWalletId;
                          return (
                            <button
                              key={w.id}
                              type="button"
                              onClick={() => {
                                setDestinationWalletId(w.id);
                                setIsDestOpen(false);
                              }}
                              className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between transition-colors cursor-pointer ${
                                isSelected
                                  ? 'bg-[#EDEAFC] text-[#5F5ED4]'
                                  : 'hover:bg-[#F8F9FD] text-[#242636]'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-7 h-7 rounded-lg bg-black/[0.04] flex items-center justify-center text-[#757A95] shrink-0">
                                  <WalletIcon size={14} />
                                </div>
                                <div className="min-w-0">
                                  <span className="block text-xs font-bold truncate">
                                    {w.name}
                                  </span>
                                  <span className="block text-[10px] text-[#757A95] tabular-nums truncate">
                                    {formatIDR(w.balance)}
                                  </span>
                                </div>
                              </div>
                              {isSelected && <Check size={14} className="text-[#5F5ED4] shrink-0" />}
                            </button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {isSameWallet && (
                <p className="text-[11px] font-semibold text-[#DC2626] flex items-center gap-1">
                  <AlertCircle size={13} />
                  Dompet sumber dan tujuan harus berbeda.
                </p>
              )}

              {/* Tanggal Setoran */}
              <div ref={dateRef} className="relative space-y-1.5">
                <label className="text-xs font-bold text-[#757A95] block">
                  Tanggal Setoran
                </label>

                <button
                  type="button"
                  onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                  className={`w-full h-13 px-4 rounded-2xl bg-white border transition-all flex items-center justify-between text-left cursor-pointer shadow-2xs ${
                    isDatePickerOpen
                      ? 'border-[#7C7CE6] ring-2 ring-[#7C7CE6]/20'
                      : 'border-black/[0.08] hover:border-black/[0.15]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <CalendarIcon size={16} className="text-[#7C7CE6]" />
                    <span className="text-xs sm:text-sm font-bold text-[#242636]">
                      {displayFormattedDate}
                    </span>
                  </div>
                  <ChevronDown
                    size={15}
                    className={`text-[#757A95] transition-transform duration-200 ${
                      isDatePickerOpen ? 'rotate-180 text-[#7C7CE6]' : ''
                    }`}
                  />
                </button>

                {/* Calendar Popover */}
                <AnimatePresence>
                  {isDatePickerOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                      className="absolute left-0 top-full mt-1.5 p-4 bg-white rounded-2xl border border-black/[0.08] shadow-[0_14px_40px_rgba(36,38,54,0.15)] z-40 w-[290px] sm:w-[300px] space-y-3"
                    >
                      {/* Calendar Month Navigation */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#242636]">
                          {MONTH_NAMES_ID[viewMonth]} {viewYear}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={handlePrevMonth}
                            className="w-7 h-7 rounded-lg hover:bg-black/[0.04] flex items-center justify-center text-[#757A95] cursor-pointer"
                          >
                            <ChevronLeft size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={handleNextMonth}
                            className="w-7 h-7 rounded-lg hover:bg-black/[0.04] flex items-center justify-center text-[#757A95] cursor-pointer"
                          >
                            <ChevronRight size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Day Name Headers */}
                      <div className="grid grid-cols-7 gap-1 text-center">
                        {DAY_NAMES_ID.map((d) => (
                          <span key={d} className="text-[10px] font-bold text-[#A0A4B8]">
                            {d}
                          </span>
                        ))}
                      </div>

                      {/* Days Grid */}
                      <div className="grid grid-cols-7 gap-1">
                        {calendarDays.map((item, idx) => {
                          const isSelected = item.dateStr === date;
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                setDate(item.dateStr);
                                setIsDatePickerOpen(false);
                              }}
                              className={`h-7 rounded-lg text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-[#5F5ED4] text-white font-bold shadow-xs'
                                  : item.currentMonth
                                  ? 'text-[#242636] hover:bg-[#EDEAFC] hover:text-[#5F5ED4]'
                                  : 'text-[#D0D2DE] hover:bg-black/[0.02]'
                              }`}
                            >
                              {item.day}
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Catatan (Opsional) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#757A95] block">
                  Catatan (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Setoran bulan September"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full h-13 px-4 rounded-2xl bg-[#F8F9FD] border border-black/[0.06] text-xs sm:text-sm text-[#242636] placeholder-[#A0A4B8] focus:bg-white focus:outline-none focus:border-[#7C7CE6] focus:ring-2 focus:ring-[#7C7CE6]/20 transition-all"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="h-13 flex-1 rounded-2xl bg-white border border-black/[0.08] hover:bg-[#F8F9FD] text-[#242636] font-bold text-xs sm:text-sm transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSameWallet || amount <= 0 || isInsufficient}
                  className="h-13 flex-1 rounded-2xl bg-[#5F5ED4] hover:bg-[#4E4DC0] text-white font-extrabold text-xs sm:text-sm shadow-[0_8px_20px_rgba(95,94,212,0.3)] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Simpan Tabungan
                </button>
              </div>
            </div>

            {/* ===================================================================== */}
            {/* RIGHT PANEL: FUNDING FLOW & SUMMARY                                   */}
            {/* ===================================================================== */}
            <div className="lg:col-span-6 space-y-4">
              <span className="text-sm font-bold text-[#242636] block">
                Alur Pendanaan Tabungan
              </span>

              <div className="p-5 sm:p-6 rounded-[28px] bg-[#FAFBFD] border border-black/[0.04] space-y-4">
                {/* 1. Source Wallet Box (Soft Coral / Red) */}
                <div className="p-4 rounded-2xl bg-[#FEF3F2] border border-[#FCE2E0] flex items-center justify-between shadow-2xs">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-[#FCE2E0] text-[#D94F4F] flex items-center justify-center shrink-0">
                      <WalletIcon size={20} />
                    </div>
                    <div>
                      <span className="block text-sm font-bold text-[#242636]">
                        {sourceWallet?.name || 'BCA'}
                      </span>
                      <span className="block text-xs text-[#757A95] font-medium">
                        {sourceWallet?.accountIdentifier || '•••• 4821'}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-base sm:text-lg font-black text-[#D94F4F] tabular-nums">
                      - {formatIDR(amount)}
                    </span>
                  </div>
                </div>

                {/* Transfer Arrow Connector */}
                <div className="relative flex items-center justify-center my-0.5">
                  <div className="w-8 h-8 rounded-full bg-[#EDEAFC] text-[#5F5ED4] flex items-center justify-center shadow-xs relative z-10">
                    <ArrowDown size={16} strokeWidth={2.5} />
                  </div>
                </div>

                {/* 2. Destination Wallet Box (Soft Mint / Green) */}
                <div className="p-4 rounded-2xl bg-[#EBF7F2] border border-[#D0EFE5] flex items-center justify-between shadow-2xs">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-[#D0EFE5] text-[#1B7354] flex items-center justify-center shrink-0">
                      <WalletIcon size={20} />
                    </div>
                    <div>
                      <span className="block text-sm font-bold text-[#242636]">
                        {destinationWallet?.name || 'Tabungan Kuliah'}
                      </span>
                      <span className="block text-xs text-[#1B7354] font-medium">
                        Tujuan Tabungan
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-base sm:text-lg font-black text-[#1B7354] tabular-nums">
                      + {formatIDR(amount)}
                    </span>
                  </div>
                </div>

                {/* 3. Summary Detail Rows */}
                <div className="pt-3 border-t border-black/[0.04] space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 text-[#757A95]">
                      <div className="w-7 h-7 rounded-lg bg-[#EDEAFC] text-[#5F5ED4] flex items-center justify-center shrink-0">
                        <ArrowLeftRight size={13} />
                      </div>
                      <span className="font-semibold">Jumlah Setoran</span>
                    </div>
                    <span className="font-black text-[#242636] tabular-nums text-xs sm:text-sm">
                      {formatIDR(amount)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 text-[#757A95]">
                      <div className="w-7 h-7 rounded-lg bg-[#EDEAFC] text-[#5F5ED4] flex items-center justify-center shrink-0">
                        <CalendarIcon size={13} />
                      </div>
                      <span className="font-semibold">Tanggal</span>
                    </div>
                    <span className="font-bold text-[#242636]">
                      {displayFormattedDate}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 text-[#757A95]">
                      <div className="w-7 h-7 rounded-lg bg-[#EDEAFC] text-[#5F5ED4] flex items-center justify-center shrink-0">
                        <FileText size={13} />
                      </div>
                      <span className="font-semibold">Catatan</span>
                    </div>
                    <span className="font-semibold text-[#242636] truncate max-w-[200px]">
                      {note.trim() || 'Setoran bulan September'}
                    </span>
                  </div>
                </div>

                {/* 4. Security Banner */}
                <div className="p-3 rounded-xl bg-[#F0F2FB] border border-[#7C7CE6]/15 flex items-center gap-2.5 text-[11px] text-[#757A95] font-medium">
                  <ShieldCheck size={16} className="text-[#5F5ED4] shrink-0" />
                  <span>Transaksi ini aman dan hanya kamu yang dapat melihatnya.</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
}
