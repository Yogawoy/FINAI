'use client';

import React, { useState, useMemo } from 'react';
import { Sparkles, TrendingUp, X, ArrowRight } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import DatePicker from '@/components/ui/DatePicker';
import SegmentedControl from '@/components/ui/SegmentedControl';
import WalletSelect from '@/components/ui/WalletSelect';
import { GoalItem, GoalCategoryType, GoalColorTheme, GoalFrequency, Wallet } from '@/types';
import { formatIDR } from '@/lib/format';
import GoalVisualIcon, { GOAL_THEME_COLORS } from './GoalVisualIcon';
import GoalTransferFlow from './GoalTransferFlow';

interface CreateGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateGoal: (goal: GoalItem) => void;
  wallets?: Wallet[];
}

const CATEGORY_OPTIONS: { id: GoalCategoryType; label: string }[] = [
  { id: 'laptop', label: 'Gadget' },
  { id: 'travel', label: 'Liburan' },
  { id: 'emergency', label: 'Darurat' },
  { id: 'vehicle', label: 'Kendaraan' },
  { id: 'home', label: 'Properti' },
  { id: 'course', label: 'Edukasi' },
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

export default function CreateGoalModal({
  isOpen,
  onClose,
  onCreateGoal,
  wallets = [],
}: CreateGoalModalProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<GoalCategoryType>('course');
  const getDefaultTargetDate = () => { const d = new Date(); d.setMonth(d.getMonth() + 6); return d.toISOString().split('T')[0]; };
  const [targetAmountRaw, setTargetAmountRaw] = useState('12000000');
  const [currentAmountRaw, setCurrentAmountRaw] = useState('3000000');
  const [targetDate, setTargetDate] = useState(getDefaultTargetDate());
  const [frequency, setFrequency] = useState<GoalFrequency>('monthly');

  React.useEffect(() => {
    if (isOpen && !targetDate) setTargetDate(getDefaultTargetDate());
  }, [isOpen]);

  // Dual Wallets: Source & Destination
  const [sourceWalletId, setSourceWalletId] = useState('');
  const [destinationWalletId, setDestinationWalletId] = useState('');

  React.useEffect(() => {
    if (wallets.length > 0) {
      if (!sourceWalletId || !wallets.some((w) => w.id === sourceWalletId)) {
        setSourceWalletId(wallets[0].id);
      }
      if (!destinationWalletId || !wallets.some((w) => w.id === destinationWalletId)) {
        setDestinationWalletId(wallets.length > 1 ? wallets[1].id : wallets[0].id);
      }
    }
  }, [wallets, isOpen, sourceWalletId, destinationWalletId]);

  const [colorTheme, setColorTheme] = useState<GoalColorTheme>('periwinkle');
  const [notes, setNotes] = useState('');
  const [autoDeposit, setAutoDeposit] = useState(false);

  // Find wallet objects
  const sourceWallet = useMemo(
    () => wallets.find((w) => w.id === sourceWalletId) || wallets[0],
    [wallets, sourceWalletId]
  );
  const destinationWallet = useMemo(
    () => wallets.find((w) => w.id === destinationWalletId) || wallets[wallets.length - 1],
    [wallets, destinationWalletId]
  );

  const isSameWallet = sourceWalletId === destinationWalletId;

  // Number parses
  const targetAmount = parseFloat(targetAmountRaw) || 0;
  const currentAmount = parseFloat(currentAmountRaw) || 0;
  const remaining = Math.max(targetAmount - currentAmount, 0);

  // Auto calculate required saving — respects frekuensi bulanan/mingguan + tampil dual
  const calculation = useMemo(() => {
    const today = new Date();
    const target = new Date(targetDate || getDefaultTargetDate());
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.max(Math.ceil(diffTime / (1000 * 60 * 60 * 24)), 7);
    const months = Math.max(Math.round(diffDays / 30), 1);
    const weeks = Math.max(Math.ceil(diffDays / 7), 1);
    let monthlyReq: number, weeklyReq: number;
    if (frequency === 'weekly') {
      weeklyReq = remaining > 0 ? Math.ceil(remaining / weeks) : 0;
      monthlyReq = Math.ceil(weeklyReq * 4.33);
    } else {
      monthlyReq = remaining > 0 ? Math.ceil(remaining / months) : 0;
      weeklyReq = Math.ceil(monthlyReq / 4.33);
    }

    return {
      months,
      weeks,
      monthlyReq,
      weeklyReq,
      primaryReq: frequency === 'weekly' ? weeklyReq : monthlyReq,
      percentage:
        targetAmount > 0
          ? Math.min(Math.round((currentAmount / targetAmount) * 100), 100)
          : 0,
    };
  }, [targetAmount, currentAmount, remaining, targetDate, frequency]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || targetAmount <= 0 || isSameWallet) return;

    const newGoal: GoalItem = {
      id: `goal-${Date.now()}`,
      title: title.trim(),
      category,
      targetAmount,
      currentAmount,
      targetDate,
      frequency,
      monthlySaving: calculation.monthlyReq,
      weeklySaving: calculation.weeklyReq as any,
      autoDeposit,
      sourceWalletId,
      sourceWalletName: sourceWallet ? sourceWallet.name : 'Bank BCA',
      destinationWalletId,
      destinationWalletName: destinationWallet ? destinationWallet.name : 'Tabungan',
      colorTheme,
      status:
        calculation.percentage >= 100
          ? 'completed'
          : calculation.percentage >= 50
          ? 'on_track'
          : 'needs_attention',
      notes: notes.trim() || undefined,
      contributions:
        currentAmount > 0
          ? [
              {
                id: `c-${Date.now()}`,
                amount: currentAmount,
                date: 'Hari Ini',
                sourceWalletId,
                sourceWalletName: sourceWallet ? sourceWallet.name : 'Bank BCA',
                destinationWalletId,
                destinationWalletName: destinationWallet ? destinationWallet.name : 'Tabungan',
                note: 'Saldo Awal di Dompet Tujuan',
              },
            ]
          : [],
    };

    onCreateGoal(newGoal);
    onClose();
  };

  const themeConfig = GOAL_THEME_COLORS[colorTheme] || GOAL_THEME_COLORS.periwinkle;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="2xl"
      hideHeader
      hideCloseButton={true}
      className="p-6 sm:p-7 overflow-hidden"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between pb-1 border-b border-black/[0.04]">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-[#7C7CE6]" />
              <h3 className="text-lg sm:text-xl font-bold text-[#242636] tracking-tight">
                Buat Target Impian
              </h3>
            </div>
            <p className="text-xs text-[#757A95]">
              Mulai dengan menentukan apa yang ingin kamu capai.
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

        {/* 2-Column Responsive Layout: Left Form (7 cols), Right Live Preview (5 cols) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
          {/* Left Form (7 cols) */}
          <div className="md:col-span-7 space-y-3">
            {/* 1. Nama Target */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[#757A95] uppercase tracking-wider block">
                Nama Target
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Kuliah, Laptop Baru, Liburan..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#F8F9FD] border border-black/[0.06] rounded-2xl text-xs sm:text-sm font-semibold text-[#242636] placeholder-[#757A95] focus:outline-none focus:border-[#7C7CE6] focus:bg-white transition-all"
              />
            </div>

            {/* 2. DUAL WALLETS SELECTION */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Dompet Sumber */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#242636] uppercase tracking-wider block truncate">
                  Dompet Sumber Dana
                </label>
                <WalletSelect
                  value={sourceWalletId}
                  onChange={setSourceWalletId}
                  wallets={wallets}
                />
              </div>

              {/* Dompet Tujuan */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#5F5ED4] uppercase tracking-wider block truncate">
                  Dompet Tujuan Tabungan
                </label>
                <WalletSelect
                  value={destinationWalletId}
                  onChange={setDestinationWalletId}
                  wallets={wallets}
                />
              </div>
            </div>

            {/* 3. Kategori */}
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
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Target Dana & Dana Awal */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
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
                    placeholder="12000000"
                    value={targetAmountRaw}
                    onChange={(e) => setTargetAmountRaw(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-[#F8F9FD] border border-black/[0.06] rounded-2xl text-xs sm:text-sm font-extrabold text-[#242636] focus:outline-none focus:border-[#7C7CE6] focus:bg-white transition-all tabular-nums"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#757A95] uppercase tracking-wider block truncate">
                  Dana Saat Ini
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#757A95]">
                    Rp
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="50000"
                    placeholder="0"
                    value={currentAmountRaw}
                    onChange={(e) => setCurrentAmountRaw(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-[#F8F9FD] border border-black/[0.06] rounded-2xl text-xs sm:text-sm font-extrabold text-[#242636] focus:outline-none focus:border-[#7C7CE6] focus:bg-white transition-all tabular-nums"
                  />
                </div>
              </div>
            </div>

            {/* 5. Target Tanggal & Frekuensi */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#757A95] uppercase tracking-wider block">
                  Target Tanggal
                </label>
                <DatePicker value={targetDate} onChange={setTargetDate} />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#757A95] uppercase tracking-wider block">
                  Frekuensi
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

            {/* 6. Setoran Otomatis mengikuti tagihan */}
            <label className="flex items-center justify-between p-3 rounded-2xl bg-[#F8F9FD] border border-black/[0.06] cursor-pointer gap-3">
              <div>
                <span className="text-xs font-bold text-[#242636] block">Setoran Otomatis mengikuti tagihan</span>
                <span className="text-[10px] text-[#757A95]">Auto-debit {frequency === 'weekly' ? 'mingguan' : 'bulanan'} sebesar {formatIDR(calculation.primaryReq)} ke {destinationWallet?.name || 'tabungan'}</span>
              </div>
              <input type="checkbox" checked={autoDeposit} onChange={(e) => setAutoDeposit(e.target.checked)} className="w-10 h-6 accent-[#7C7CE6]" />
            </label>

            {/* 7. Pilihan Tema Warna */}
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
          </div>

          {/* Right Live Goal Preview Card (5 cols - fills height completely) */}
          <div className="md:col-span-5 p-4 sm:p-5 rounded-[24px] bg-gradient-to-br from-[#FAF9FE] via-white to-[#F3F0FE] border border-[#E8E4F8] shadow-sm flex flex-col justify-between space-y-3">
            <div className="space-y-3">
              {/* Header Preview */}
              <div className="flex items-center justify-between pb-2 border-b border-black/[0.04]">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#757A95] flex items-center gap-1">
                  <Sparkles size={12} className="text-[#7C7CE6]" />
                  Live Preview
                </span>
                <span className="text-[10px] font-bold text-[#5F5ED4] bg-[#EDEAFC] px-2 py-0.5 rounded-full">
                  {calculation.percentage}%
                </span>
              </div>

              {/* Goal Title & Target */}
              <div className="flex items-center gap-3">
                <GoalVisualIcon
                  category={category}
                  colorTheme={colorTheme}
                  size={20}
                  className="w-11 h-11 shadow-2xs"
                />
                <div className="min-w-0">
                  <h4 className="text-sm sm:text-base font-bold text-[#242636] truncate">
                    {title.trim() || 'Nama Target Impian'}
                  </h4>
                  <span className="text-[11px] text-[#757A95] block">
                    Target: {targetDate ? new Date(targetDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                  </span>
                </div>
              </div>

              {/* Progress visual */}
              <div className="space-y-1">
                <div className="flex items-baseline justify-between text-xs font-bold">
                  <span className="text-[#242636]">{formatIDR(currentAmount)}</span>
                  <span className="text-[#757A95]">dari {formatIDR(targetAmount)}</span>
                </div>
                <div className="w-full h-2.5 bg-[#EAE9F5] rounded-full overflow-hidden">
                  <div
                    style={{ width: `${calculation.percentage}%` }}
                    className={`h-full rounded-full ${themeConfig.bar} transition-all duration-300`}
                  />
                </div>
                <div className="text-[10px] text-[#757A95] font-semibold">
                  Sisa kebutuhan: {formatIDR(remaining)}
                </div>
              </div>

              {/* Visual Transfer Flow Component */}
              <GoalTransferFlow
                sourceWallet={sourceWallet}
                destinationWallet={destinationWallet}
                amount={calculation.primaryReq}
                mode="create"
              />
            </div>

            {/* Auto Calculation Recommendation Box — dual per bulan & per minggu */}
            <div className="p-3 rounded-2xl bg-white border border-black/[0.05] space-y-2">
              <div className="flex items-center gap-1 text-[11px] font-bold text-[#1B7354]">
                <TrendingUp size={13} />
                <span>Kebutuhan Nabung {frequency === 'weekly' ? 'Mingguan' : 'Bulanan'}:</span>
              </div>
              <div className="text-sm font-extrabold text-[#242636]">
                {formatIDR(calculation.primaryReq)} / {frequency === 'weekly' ? 'minggu' : 'bulan'}
                <span className="text-[11px] font-semibold text-[#757A95] ml-2">
                  (≈ {formatIDR(frequency === 'weekly' ? calculation.monthlyReq : calculation.weeklyReq)} / {frequency === 'weekly' ? 'bulan' : 'minggu'})
                </span>
              </div>
              <p className="text-[10px] text-[#757A95] leading-relaxed">
                {frequency === 'weekly'
                  ? `Perlu menabung ${formatIDR(calculation.weeklyReq)}/minggu selama ${calculation.weeks} minggu. Setara ${formatIDR(calculation.monthlyReq)}/bulan.`
                  : `Perlu menabung ${formatIDR(calculation.monthlyReq)}/bulan selama ${calculation.months} bulan. Setara ${formatIDR(calculation.weeklyReq)}/minggu.`}
              </p>
              <div className="grid grid-cols-2 gap-2 pt-1 text-center">
                <div className={`p-2 rounded-xl border ${frequency === 'weekly' ? 'bg-[#EDEAFC] border-[#7C7CE6] text-[#5F5ED4] font-bold' : 'bg-[#F8F9FD] border-black/[0.05] text-[#757A95]'}`}>
                  <span className="text-[10px] uppercase block">Per Bulan</span>
                  <span className="text-xs font-extrabold">{formatIDR(calculation.monthlyReq)}</span>
                </div>
                <div className={`p-2 rounded-xl border ${frequency === 'weekly' ? 'bg-[#F8F9FD] border-black/[0.05] text-[#757A95]' : 'bg-[#EDEAFC] border-[#7C7CE6] text-[#5F5ED4] font-bold'}`}>
                  <span className="text-[10px] uppercase block">Per Minggu</span>
                  <span className="text-xs font-extrabold">{formatIDR(calculation.weeklyReq)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Full-width Modal Action Buttons */}
        <div className="flex items-center gap-3 pt-3 border-t border-black/[0.05]">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-2xl bg-[#F4F3F9] hover:bg-[#EAE9F2] text-[#757A95] font-bold text-xs sm:text-sm transition-colors cursor-pointer"
          >
            Batal
          </button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            className="flex-1"
            disabled={isSameWallet || !title.trim() || targetAmount <= 0}
          >
            Buat Target
          </Button>
        </div>
      </form>
    </Modal>
  );
}
