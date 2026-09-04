'use client';

import React, { useState } from 'react';
import { Sparkles, Plus } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { BudgetCategory, TransactionCategory, BudgetPeriod } from '@/types';
import BudgetCategorySelector, { BUDGET_CATEGORIES } from './BudgetCategorySelector';
import BudgetAmountInput from './BudgetAmountInput';
import BudgetPeriodSelector from './BudgetPeriodSelector';
import BudgetDatePicker from './BudgetDatePicker';
import BudgetPreviewCard from './BudgetPreviewCard';

interface CreateBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateBudget: (newBudget: BudgetCategory) => void;
}

export default function CreateBudgetModal({
  isOpen,
  onClose,
  onCreateBudget,
}: CreateBudgetModalProps) {
  const getMonthStart = () => { const d = new Date(); d.setDate(1); return d.toISOString().split('T')[0]; };
  const getMonthEnd = () => { const d = new Date(); d.setMonth(d.getMonth() + 1, 0); return d.toISOString().split('T')[0]; };
  const [category, setCategory] = useState<TransactionCategory>('food');
  const [amount, setAmount] = useState<number>(1500000);
  const [period, setPeriod] = useState<BudgetPeriod>('monthly');
  const [startDate, setStartDate] = useState<string>(getMonthStart());
  const [endDate, setEndDate] = useState<string>(getMonthEnd());

  React.useEffect(() => {
    if (isOpen) { setStartDate(getMonthStart()); setEndDate(getMonthEnd()); }
  }, [isOpen]);

  // Inline Validation states
  const [amountError, setAmountError] = useState<string | undefined>();
  const [dateError, setDateError] = useState<string | undefined>();

  const selectedCatOption =
    BUDGET_CATEGORIES.find((c) => c.id === category) || BUDGET_CATEGORIES[0];

  const handleAmountChange = (val: number) => {
    setAmount(val);
    if (val > 0) setAmountError(undefined);
  };

  const handleStartDateChange = (val: string) => {
    setStartDate(val);
    if (endDate && val > endDate) {
      setDateError('Tanggal selesai harus setelah tanggal mulai.');
    } else {
      setDateError(undefined);
    }
  };

  const handleEndDateChange = (val: string) => {
    setEndDate(val);
    if (startDate && val < startDate) {
      setDateError('Tanggal selesai harus setelah tanggal mulai.');
    } else {
      setDateError(undefined);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let hasError = false;
    if (amount <= 0) {
      setAmountError('Silakan masukkan nominal anggaran lebih dari Rp 0.');
      hasError = true;
    }
    if (startDate && endDate && endDate < startDate) {
      setDateError('Tanggal selesai harus setelah tanggal mulai.');
      hasError = true;
    }

    if (hasError) return;

    const newBudget: BudgetCategory = {
      id: `budget-${Date.now()}`,
      name: selectedCatOption.label,
      category: category,
      spent: 0,
      limit: amount,
      color: selectedCatOption.defaultColor,
      icon: category,
      period: period,
      startDate: startDate,
      endDate: endDate,
      status: 'safe',
      healthStatus: 'on_track',
      dailyVelocity: `Kecepatan belanja harian Rp${Math.round(amount / 30).toLocaleString('id-ID')}/hari`,
    };

    onCreateBudget(newBudget);
    onClose();

    // Reset fields
    setCategory('food');
    setAmount(1500000);
    setPeriod('monthly');
    setStartDate('2026-08-31');
    setEndDate('2026-09-30');
    setAmountError(undefined);
    setDateError(undefined);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="2xl"
      title=""
      hideHeader
      className="p-6 sm:p-8 overflow-hidden"
    >
      <div className="space-y-6">
        {/* Header with Sparkle Icon and Close */}
        <div className="flex items-start justify-between pb-1 border-b border-black/[0.04]">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-[#7C7CE6]" />
              <h3 className="text-lg sm:text-xl font-bold text-[#242636] tracking-tight">
                Buat Anggaran
              </h3>
            </div>
            <p className="text-xs text-[#757A95]">
              Tentukan batas pengeluaran.
            </p>
          </div>
        </div>

        {/* 2-Column Responsive Layout: Left Form, Right Preview */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Left Form (7 cols on desktop) */}
          <form onSubmit={handleSubmit} className="md:col-span-7 space-y-4">
            {/* Category Selector */}
            <BudgetCategorySelector
              selectedCategory={category}
              onSelectCategory={setCategory}
            />

            {/* Budget Amount Input */}
            <BudgetAmountInput
              value={amount}
              onChange={handleAmountChange}
              error={amountError}
            />

            {/* Period Segmented Control */}
            <BudgetPeriodSelector
              period={period}
              onPeriodChange={setPeriod}
            />

            {/* Date Pickers */}
            <BudgetDatePicker
              startDate={startDate}
              endDate={endDate}
              onStartDateChange={handleStartDateChange}
              onEndDateChange={handleEndDateChange}
              error={dateError}
            />

            {/* Actions */}
            <div className="pt-2 flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="w-1/3 py-3 rounded-2xl bg-[#F4F3F9] hover:bg-[#EAE9F5] text-[#757A95] hover:text-[#242636] text-xs sm:text-sm font-bold transition-colors cursor-pointer text-center"
              >
                Batal
              </button>

              <button
                type="submit"
                className="w-2/3 py-3 rounded-2xl bg-gradient-to-r from-[#7C7CE6] to-[#8E9AF7] text-white font-bold text-xs sm:text-sm shadow-[0_8px_20px_rgba(124,124,230,0.35)] hover:shadow-[0_10px_25px_rgba(124,124,230,0.45)] hover:brightness-105 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Plus size={16} />
                <span>Buat Anggaran</span>
              </button>
            </div>
          </form>

          {/* Right Live Preview Card (5 cols on desktop) */}
          <div className="md:col-span-5 md:pl-2">
            <BudgetPreviewCard
              category={category}
              amount={amount}
              period={period}
              startDate={startDate}
              spent={0}
              helperText="Anda dapat memperbarui nominal atau kategori ini kapan saja nanti."
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}
