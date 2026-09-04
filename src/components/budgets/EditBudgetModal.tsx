'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Check } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { BudgetCategory, TransactionCategory, BudgetPeriod } from '@/types';
import BudgetCategorySelector, { BUDGET_CATEGORIES } from './BudgetCategorySelector';
import BudgetAmountInput from './BudgetAmountInput';
import BudgetPeriodSelector from './BudgetPeriodSelector';
import BudgetDatePicker from './BudgetDatePicker';
import BudgetPreviewCard from './BudgetPreviewCard';

interface EditBudgetModalProps {
  budget: BudgetCategory | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateBudget: (updatedBudget: BudgetCategory) => void;
}

export default function EditBudgetModal({
  budget,
  isOpen,
  onClose,
  onUpdateBudget,
}: EditBudgetModalProps) {
  const getMonthStart = () => { const d = new Date(); d.setDate(1); return d.toISOString().split('T')[0]; };
  const getMonthEnd = () => { const d = new Date(); d.setMonth(d.getMonth() + 1, 0); return d.toISOString().split('T')[0]; };
  const [category, setCategory] = useState<TransactionCategory>('food');
  const [amount, setAmount] = useState<number>(1500000);
  const [period, setPeriod] = useState<BudgetPeriod>('monthly');
  const [startDate, setStartDate] = useState<string>(getMonthStart());
  const [endDate, setEndDate] = useState<string>(getMonthEnd());

  // Inline Validation states
  const [amountError, setAmountError] = useState<string | undefined>();
  const [dateError, setDateError] = useState<string | undefined>();

  useEffect(() => {
    if (budget) {
      setCategory(budget.category);
      setAmount(budget.limit);
      setPeriod(budget.period || 'monthly');
      setStartDate(budget.startDate || '2026-08-31');
      setEndDate(budget.endDate || '2026-09-30');
      setAmountError(undefined);
      setDateError(undefined);
    }
  }, [budget]);

  if (!budget) return null;

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

    const updated: BudgetCategory = {
      ...budget,
      name: selectedCatOption.label,
      category: category,
      limit: amount,
      period: period,
      startDate: startDate,
      endDate: endDate,
    };

    onUpdateBudget(updated);
    onClose();
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
        {/* Header */}
        <div className="flex items-start justify-between pb-1 border-b border-black/[0.04]">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-[#7C7CE6]" />
              <h3 className="text-lg sm:text-xl font-bold text-[#242636] tracking-tight">
                Edit Anggaran
              </h3>
            </div>
            <p className="text-xs text-[#757A95]">
              Perbarui target dan batas anggaran.
            </p>
          </div>
        </div>

        {/* 2-Column Responsive Layout: Left Form, Right Preview */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Left Form */}
          <form onSubmit={handleSubmit} className="md:col-span-7 space-y-4">
            {/* Category Selector */}
            <BudgetCategorySelector
              selectedCategory={category}
              onSelectCategory={setCategory}
            />

            {/* Budget Amount Input with helper text */}
            <BudgetAmountInput
              value={amount}
              onChange={handleAmountChange}
              helperText="Perubahan nominal akan otomatis menghitung ulang persentase progress."
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
                <Check size={16} />
                <span>Simpan Perubahan</span>
              </button>
            </div>
          </form>

          {/* Right Live Preview Card */}
          <div className="md:col-span-5 md:pl-2">
            <BudgetPreviewCard
              category={category}
              amount={amount}
              period={period}
              startDate={startDate}
              spent={budget.spent}
              helperText="Perubahan akan langsung diterapkan seketika."
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}
