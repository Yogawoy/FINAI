'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Copy } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { BudgetCategory, BudgetPeriod } from '@/types';
import { formatIDR } from '@/data/mockData';
import { getCategoryIconComponent, getCategoryColorTheme } from './BudgetRow';
import BudgetPeriodSelector from './BudgetPeriodSelector';
import BudgetDatePicker from './BudgetDatePicker';

interface DuplicateBudgetModalProps {
  sourceBudget: BudgetCategory | null;
  isOpen: boolean;
  onClose: () => void;
  onDuplicateBudget: (newBudget: BudgetCategory) => void;
}

export default function DuplicateBudgetModal({
  sourceBudget,
  isOpen,
  onClose,
  onDuplicateBudget,
}: DuplicateBudgetModalProps) {
  const [name, setName] = useState('');
  const [period, setPeriod] = useState<BudgetPeriod>('monthly');
  const [startDate, setStartDate] = useState('2026-09-01');
  const [endDate, setEndDate] = useState('2026-09-30');
  const [dateError, setDateError] = useState<string | undefined>();

  useEffect(() => {
    if (sourceBudget) {
      setName(`${sourceBudget.name} (September)`);
      setPeriod(sourceBudget.period || 'monthly');
      setStartDate('2026-09-01');
      setEndDate('2026-09-30');
      setDateError(undefined);
    }
  }, [sourceBudget]);

  if (!sourceBudget) return null;

  const percentage =
    sourceBudget.limit > 0
      ? Math.round((sourceBudget.spent / sourceBudget.limit) * 100)
      : 0;
  const colorTheme = getCategoryColorTheme(sourceBudget.category);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (startDate && endDate && endDate < startDate) {
      setDateError('Tanggal selesai harus setelah tanggal mulai.');
      return;
    }

    const duplicated: BudgetCategory = {
      ...sourceBudget,
      id: `budget-${Date.now()}`,
      name: name.trim() || `${sourceBudget.name} (Salinan)`,
      spent: 0,
      period: period,
      startDate: startDate,
      endDate: endDate,
      status: 'safe',
      healthStatus: 'on_track',
    };

    onDuplicateBudget(duplicated);
    onClose();
  };

  const periodLabel =
    sourceBudget.period === 'weekly' ? 'Anggaran Mingguan' : sourceBudget.period === 'custom' ? 'Anggaran Kustom' : 'Anggaran Bulanan';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="md"
      title=""
      hideHeader
      className="p-6 sm:p-8 space-y-5"
    >
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between pb-1 border-b border-black/[0.04]">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-[#7C7CE6]" />
              <h3 className="text-lg sm:text-xl font-bold text-[#242636] tracking-tight">
                Duplikat Anggaran
              </h3>
            </div>
            <p className="text-xs text-[#757A95]">
              Buat anggaran serupa dengan menyalin pos yang sudah ada.
            </p>
          </div>
        </div>

        {/* Source Budget Summary Card */}
        <div className="p-4 rounded-2xl bg-[#F8F9FD] border border-black/[0.05] space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-xl ${colorTheme.bg} ${colorTheme.text} border ${colorTheme.border} flex items-center justify-center shrink-0 shadow-2xs`}
              >
                {getCategoryIconComponent(sourceBudget.category, 16)}
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-[#242636]">
                  {sourceBudget.name}
                </h4>
                <p className="text-[11px] text-[#757A95] font-medium">
                  {periodLabel}
                </p>
              </div>
            </div>

            <span className="text-xs sm:text-sm font-black text-[#242636]">
              {formatIDR(sourceBudget.limit)}
            </span>
          </div>

          {/* Progress bar preview */}
          <div className="space-y-1 pt-0.5">
            <div className="w-full h-1.5 rounded-full bg-[#EAE9F5] overflow-hidden">
              <div
                style={{ width: `${Math.min(percentage, 100)}%` }}
                className="h-full rounded-full bg-[#EF4444]"
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-[#757A95] font-semibold">
              <span className="text-[#EF4444] font-bold">{percentage}% terpakai</span>
              <span>100%</span>
            </div>
          </div>
        </div>

        {/* Duplication Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* New Budget Name Input */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-[#757A95] uppercase tracking-wider block">
              Nama Anggaran Baru <span className="font-normal lowercase text-[#757A95]/80">(opsional)</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="misal: Makanan & Minuman (September)"
              className="w-full px-3.5 py-2.5 bg-[#F8F9FD] border border-black/[0.06] rounded-xl text-xs sm:text-sm text-[#242636] focus:outline-none focus:ring-2 focus:ring-[#7C7CE6]/40 focus:bg-white"
            />
          </div>

          {/* Period Selector */}
          <BudgetPeriodSelector period={period} onPeriodChange={setPeriod} />

          {/* Dates */}
          <BudgetDatePicker
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            error={dateError}
          />

          {/* Actions */}
          <div className="pt-2 flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 py-3 rounded-2xl bg-[#F4F3F9] hover:bg-[#EAE9F5] text-[#757A95] hover:text-[#242636] font-bold text-xs sm:text-sm transition-colors cursor-pointer text-center"
            >
              Batal
            </button>
            <button
              type="submit"
              className="w-2/3 py-3 rounded-2xl bg-[#7C7CE6] hover:bg-[#6D6CD8] text-white font-bold text-xs sm:text-sm shadow-[0_8px_20px_rgba(124,124,230,0.35)] transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Copy size={15} />
              <span>Duplikat Anggaran</span>
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
