'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Pencil, Sparkles, X, TrendingUp, AlertCircle } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import DatePicker from '@/components/ui/DatePicker';
import SegmentedControl from '@/components/ui/SegmentedControl';
import WalletSelect from '@/components/ui/WalletSelect';
import { GoalItem, GoalCategoryType, GoalColorTheme, GoalFrequency, Wallet } from '@/types';
import { MOCK_WALLETS, formatIDR } from '@/data/mockData';
import GoalTransferFlow from './GoalTransferFlow';

interface EditGoalModalProps {
  goal: GoalItem | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateGoal: (goal: GoalItem) => void;
  wallets?: Wallet[];
}

const CATEGORY_OPTIONS: { id: GoalCategoryType; label: string }[] = [
  { id: 'laptop', label: 'Gadget / Laptop' },
  { id: 'travel', label: 'Liburan & Wisata' },
  { id: 'emergency', label: 'Dana Darurat' },
  { id: 'vehicle', label: 'Kendaraan' },
  { id: 'home', label: 'Rumah & Properti' },
  { id: 'course', label: 'Edukasi / Kursus' },
  { id: 'wedding', label: 'Pernikahan' },
  { id: 'other', label: 'Lainnya' },
];

const COLOR_OPTIONS: { id: GoalColorTheme; label: string; bgClass: string }[] = [
  { id: 'periwinkle', label: 'Periwinkle', bgClass: 'bg-[#7C7CE6]' },
  { id: 'lavender', label: 'Lavender', bgClass: 'bg-[#9F7AEA]' },
  { id: 'iceblue', label: 'Ice Blue', bgClass: 'bg-[#3B82F6]' },
  { id: 'mint', label: 'Mint', bgClass: 'bg-[#10B981]' },
  { id: 'peach', label: 'Peach', bgClass: 'bg-[#F87171]' },
];

export default function EditGoalModal({
  goal,
  isOpen,
  onClose,
  onUpdateGoal,
  wallets = MOCK_WALLETS,
}: EditGoalModalProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<GoalCategoryType>('course');
  const [targetAmountRaw, setTargetAmountRaw] = useState('12000000');
  const [targetDate, setTargetDate] = useState('2026-12-31');
  const [frequency, setFrequency] = useState<GoalFrequency>('monthly');

  // Dual Wallets
  const [sourceWalletId, setSourceWalletId] = useState('w-1');
  const [destinationWalletId, setDestinationWalletId] = useState('w-5');

  const [colorTheme, setColorTheme] = useState<GoalColorTheme>('periwinkle');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (goal) {
      setTitle(goal.title);
      setCategory(goal.category);
      setTargetAmountRaw(goal.targetAmount.toString());
      setTargetDate(goal.targetDate);
      setFrequency(goal.frequency);
      setSourceWalletId(goal.sourceWalletId || 'w-1');
      setDestinationWalletId(goal.destinationWalletId || 'w-5');
      setColorTheme(goal.colorTheme || 'periwinkle');
      setNotes(goal.notes || '');
    }
  }, [goal]);

  const targetAmount = parseFloat(targetAmountRaw) || 0;
  const currentAmount = goal ? goal.currentAmount : 0;
  const remaining = Math.max(targetAmount - currentAmount, 0);

  const sourceWallet = useMemo(
    () => wallets.find((w) => w.id === sourceWalletId) || wallets[0],
    [wallets, sourceWalletId]
  );
  const destinationWallet = useMemo(
    () => wallets.find((w) => w.id === destinationWalletId) || wallets[wallets.length - 1],
    [wallets, destinationWalletId]
  );

  const isSameWallet = sourceWalletId === destinationWalletId;

  const calculation = useMemo(() => {
    const today = new Date();
    const target = new Date(targetDate || '2026-12-31');
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.max(Math.ceil(diffTime / (1000 * 60 * 60 * 24)), 30);
    const months = Math.max(Math.round(diffDays / 30), 1);
    const monthlyReq = Math.ceil(remaining / months);

    return {
      months,
      monthlyReq: remaining > 0 ? monthlyReq : 0,
      percentage:
        targetAmount > 0
          ? Math.min(Math.round((currentAmount / targetAmount) * 100), 100)
          : 0,
    };
  }, [targetAmount, currentAmount, remaining, targetDate]);

  if (!goal) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || targetAmount <= 0 || isSameWallet) return;

    const updated: GoalItem = {
      ...goal,
      title: title.trim(),
      category,
      targetAmount,
      targetDate,
      frequency,
      monthlySaving: calculation.monthlyReq,
      sourceWalletId,
      sourceWalletName: sourceWallet ? sourceWallet.name : goal.sourceWalletName,
      destinationWalletId,
      destinationWalletName: destinationWallet ? destinationWallet.name : goal.destinationWalletName,
      colorTheme,
      status:
        calculation.percentage >= 100
          ? 'completed'
          : calculation.percentage >= 50
          ? 'on_track'
          : 'needs_attention',
      notes: notes.trim() || undefined,
    };

    onUpdateGoal(updated);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="lg"
      hideHeader
      hideCloseButton={true}
      className="p-6 sm:p-7 overflow-hidden"
    >
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between pb-1 border-b border-black/[0.04]">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Pencil size={16} className="text-[#7C7CE6]" />
              <h3 className="text-lg sm:text-xl font-bold text-[#242636] tracking-tight">
                Edit Target Impian
              </h3>
            </div>
            <p className="text-xs text-[#757A95]">
              Perbarui target, tanggal, atau preferensi tabungan Anda.
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

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* 1. Nama Target */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-[#757A95] uppercase tracking-wider block">
              Nama Target
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#F8F9FD] border border-black/[0.06] rounded-2xl text-xs sm:text-sm font-semibold text-[#242636] focus:outline-none focus:border-[#7C7CE6] focus:bg-white transition-all"
            />
          </div>

          {/* 2. Kategori */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-[#757A95] uppercase tracking-wider block">
              Kategori Target
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {CATEGORY_OPTIONS.map((cat) => {
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`p-2 rounded-2xl border text-[11px] font-bold transition-all cursor-pointer truncate ${
                      isSelected
                        ? 'bg-[#EDEAFC] border-[#7C7CE6] text-[#5F5ED4] shadow-xs'
                        : 'bg-[#F8F9FD] border-black/[0.05] text-[#757A95] hover:text-[#242636]'
                    }`}
                  >
                    {cat.label.split('/')[0].trim()}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Target Dana */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-[#757A95] uppercase tracking-wider block">
              Target Dana
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#757A95]">
                Rp
              </span>
              <input
                type="number"
                required
                min="100000"
                step="50000"
                value={targetAmountRaw}
                onChange={(e) => setTargetAmountRaw(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[#F8F9FD] border border-black/[0.06] rounded-2xl text-xs sm:text-sm font-extrabold text-[#242636] focus:outline-none focus:border-[#7C7CE6] focus:bg-white transition-all tabular-nums"
              />
            </div>
          </div>

          {/* 4. Target Tanggal & Frekuensi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[#757A95] uppercase tracking-wider block">
                Target Tanggal
              </label>
              <DatePicker value={targetDate} onChange={setTargetDate} />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[#757A95] uppercase tracking-wider block">
                Frekuensi Tabungan
              </label>
              <SegmentedControl
                value={frequency}
                onChange={(val) => setFrequency(val as GoalFrequency)}
                options={[
                  { value: 'monthly', label: 'Bulanan' },
                  { value: 'weekly', label: 'Mingguan' },
                ]}
              />
            </div>
          </div>

          {/* 5. DUAL WALLETS (SUMBER DANA & TUJUAN TABUNGAN) */}
          <div className="p-3.5 rounded-2xl bg-[#FAF9FE] border border-[#E8E4F8] space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#242636] uppercase tracking-wider block truncate">
                  Dompet Sumber Dana
                </label>
                <WalletSelect
                  value={sourceWalletId}
                  onChange={setSourceWalletId}
                  wallets={wallets}
                />
                <p className="text-[10px] text-[#757A95] leading-tight">
                  Dompet untuk menyetor tabungan.
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#5F5ED4] uppercase tracking-wider block truncate">
                  Dompet Tujuan Tabungan
                </label>
                <WalletSelect
                  value={destinationWalletId}
                  onChange={setDestinationWalletId}
                  wallets={wallets}
                />
                <p className="text-[10px] text-[#757A95] leading-tight">
                  Dompet tempat dana target disimpan.
                </p>
              </div>
            </div>

            {/* Visual Transfer Flow Component */}
            <GoalTransferFlow
              sourceWallet={sourceWallet}
              destinationWallet={destinationWallet}
              amount={calculation.monthlyReq}
              mode="create"
            />
          </div>

          {/* 6. Tema Warna */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-[#757A95] uppercase tracking-wider block">
              Warna Tema
            </label>
            <div className="flex items-center gap-2">
              {COLOR_OPTIONS.map((c) => {
                const isSelected = colorTheme === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setColorTheme(c.id)}
                    className={`w-7 h-7 rounded-full ${c.bgClass} transition-all cursor-pointer flex items-center justify-center ${
                      isSelected
                        ? 'ring-2 ring-offset-2 ring-[#7C7CE6] scale-110'
                        : 'opacity-70 hover:opacity-100'
                    }`}
                    title={c.label}
                  />
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 pt-3 border-t border-black/[0.05]">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-2xl bg-[#F4F3F9] hover:bg-[#EAE9F2] text-[#757A95] font-bold text-xs transition-colors cursor-pointer"
            >
              Batal
            </button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              className="flex-1"
              disabled={isSameWallet}
            >
              Simpan Perubahan
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
