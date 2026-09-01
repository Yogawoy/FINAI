'use client';

import React, { useState, useMemo } from 'react';
import { Target, Sparkles, Calendar, TrendingUp, X } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import DatePicker from '@/components/ui/DatePicker';
import SegmentedControl from '@/components/ui/SegmentedControl';
import WalletSelect from '@/components/ui/WalletSelect';
import { GoalItem, GoalCategoryType, GoalColorTheme, GoalFrequency, Wallet } from '@/types';
import { formatIDR, MOCK_WALLETS } from '@/data/mockData';
import GoalVisualIcon, { GOAL_THEME_COLORS } from './GoalVisualIcon';

interface CreateGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateGoal: (goal: GoalItem) => void;
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

export default function CreateGoalModal({
  isOpen,
  onClose,
  onCreateGoal,
}: CreateGoalModalProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<GoalCategoryType>('laptop');
  const [targetAmountRaw, setTargetAmountRaw] = useState('12000000');
  const [currentAmountRaw, setCurrentAmountRaw] = useState('3000000');
  const [targetDate, setTargetDate] = useState('2026-12-31');
  const [frequency, setFrequency] = useState<GoalFrequency>('monthly');
  const [selectedWalletId, setSelectedWalletId] = useState('BCA');
  const [colorTheme, setColorTheme] = useState<GoalColorTheme>('periwinkle');
  const [notes, setNotes] = useState('');

  // Number parses
  const targetAmount = parseFloat(targetAmountRaw) || 0;
  const currentAmount = parseFloat(currentAmountRaw) || 0;
  const remaining = Math.max(targetAmount - currentAmount, 0);

  // Auto calculate required monthly saving
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || targetAmount <= 0) return;

    const wallet = MOCK_WALLETS.find((w: Wallet) => w.id === selectedWalletId);

    const newGoal: GoalItem = {
      id: `goal-${Date.now()}`,
      title: title.trim(),
      category,
      targetAmount,
      currentAmount,
      targetDate,
      frequency,
      monthlySaving: calculation.monthlyReq,
      walletId: selectedWalletId,
      walletName: wallet ? wallet.name : 'Bank BCA',
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
                walletName: wallet ? wallet.name : 'Bank BCA',
                note: 'Tabungan Awal',
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
      <div className="space-y-5">
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
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
          {/* Left Form */}
          <form onSubmit={handleSubmit} className="md:col-span-7 space-y-3.5">
            {/* 1. Nama Target */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[#757A95] uppercase tracking-wider block">
                Nama Target
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Laptop Baru, Liburan Jepang..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#F8F9FD] border border-black/[0.06] rounded-2xl text-xs sm:text-sm font-semibold text-[#242636] placeholder-[#757A95] focus:outline-none focus:border-[#7C7CE6] focus:bg-white transition-all"
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

            {/* 3. Target Dana & Dana Awal */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Target Dana */}
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

              {/* Dana Saat Ini */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#757A95] uppercase tracking-wider block">
                  Dana Saat Ini (Opsional)
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

            {/* 4. Target Tanggal */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[#757A95] uppercase tracking-wider block">
                Target Tanggal
              </label>
              <DatePicker value={targetDate} onChange={setTargetDate} />
            </div>

            {/* 5. Frekuensi & Sumber Dompet */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#757A95] uppercase tracking-wider block">
                  Sumber Dana
                </label>
                <WalletSelect
                  value={selectedWalletId}
                  onChange={setSelectedWalletId}
                  wallets={MOCK_WALLETS}
                />
              </div>
            </div>

            {/* 6. Pilihan Tema Warna */}
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
              <Button type="submit" variant="primary" size="md" className="flex-1">
                Buat Target
              </Button>
            </div>
          </form>

          {/* Right Live Goal Preview Card */}
          <div className="md:col-span-5 p-5 rounded-[24px] bg-gradient-to-br from-[#FAF9FE] via-white to-[#F3F0FE] border border-[#E8E4F8] shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-black/[0.04]">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#757A95] flex items-center gap-1">
                <Sparkles size={12} className="text-[#7C7CE6]" />
                Live Preview
              </span>
              <span className="text-[10px] font-bold text-[#5F5ED4] bg-[#EDEAFC] px-2 py-0.5 rounded-full">
                {calculation.percentage}%
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <GoalVisualIcon
                  category={category}
                  colorTheme={colorTheme}
                  size={22}
                  className="w-12 h-12 shadow-2xs"
                />
                <div className="min-w-0">
                  <h4 className="text-base font-bold text-[#242636] truncate">
                    {title.trim() || 'Nama Target Impian'}
                  </h4>
                  <span className="text-xs text-[#757A95] block">
                    Target: {targetDate || '31 Des 2026'}
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
                <div className="text-[11px] text-[#757A95] font-semibold">
                  Sisa {formatIDR(remaining)}
                </div>
              </div>

              {/* Auto Calculation Recommendation Box */}
              <div className="p-3 rounded-2xl bg-white border border-black/[0.05] space-y-1">
                <div className="flex items-center gap-1 text-[11px] font-bold text-[#1B7354]">
                  <TrendingUp size={13} />
                  <span>Estimasi Kebutuhan Nabung:</span>
                </div>
                <div className="text-sm font-extrabold text-[#242636]">
                  {formatIDR(calculation.monthlyReq)} / bulan
                </div>
                <p className="text-[10px] text-[#757A95] leading-relaxed">
                  Perlu menabung sekitar {formatIDR(calculation.monthlyReq)} per bulan selama {calculation.months} bulan untuk mencapai target tepat waktu.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
