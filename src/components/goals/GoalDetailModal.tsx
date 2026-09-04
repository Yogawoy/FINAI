'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Calendar,
  TrendingUp,
  Plus,
  MoreVertical,
  Pencil,
  Trash2,
  X,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowDownRight,
  ArrowUpRight,
} from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { GoalItem, GoalContribution } from '@/types';
import { formatIDR } from '@/lib/format';
import GoalVisualIcon, { GOAL_THEME_COLORS } from './GoalVisualIcon';
import GoalStatusBadge from './GoalStatusBadge';
import GoalTimeline from './GoalTimeline';
import GoalTransferFlow from './GoalTransferFlow';

interface GoalDetailModalProps {
  goal: GoalItem | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (goal: GoalItem) => void;
  onDelete: (goal: GoalItem) => void;
  onAddContribution: (goal: GoalItem) => void;
}

export default function GoalDetailModal({
  goal,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onAddContribution,
}: GoalDetailModalProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (!goal) return null;

  const percentage =
    goal.targetAmount > 0
      ? Math.min(Math.round((goal.currentAmount / goal.targetAmount) * 100), 100)
      : 0;

  const remaining = Math.max(goal.targetAmount - goal.currentAmount, 0);
  const theme = GOAL_THEME_COLORS[goal.colorTheme] || GOAL_THEME_COLORS.periwinkle;
  const isWeekly = goal.frequency === 'weekly';
  const weeklySaving = ((goal as any).weeklySaving ?? Math.ceil(goal.monthlySaving / 4.33)) || 0;

  const formatDeadline = (d: string) => {
    if (!d) return '31 Desember 2026';
    const parts = d.split('-');
    if (parts.length === 3) {
      const months = [
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
      return `${parts[2]} ${months[parseInt(parts[1], 10) - 1]} ${parts[0]}`;
    }
    return d;
  };

  const thisMonthSaved = goal.contributions
    .slice(0, 2)
    .reduce((sum, c) => sum + c.amount, 0);
  const monthlyPlanProgress =
    goal.monthlySaving > 0
      ? Math.min(Math.round((thisMonthSaved / goal.monthlySaving) * 100), 100)
      : 100;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="2xl"
      hideHeader
      hideCloseButton={true}
      className="p-6 sm:p-8 space-y-6 overflow-hidden"
    >
      {/* ========================================================================= */}
      {/* 1. TOP HEADER ROW                                                         */}
      {/* ========================================================================= */}
      <div className="flex items-start justify-between pb-1 border-b border-black/[0.04]">
        <div className="flex items-center gap-3">
          <GoalVisualIcon
            category={goal.category}
            colorTheme={goal.colorTheme}
            size={24}
            className="w-13 h-13 shadow-xs"
          />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl sm:text-2xl font-black text-[#242636] tracking-tight">
                {goal.title}
              </h3>
              <GoalStatusBadge status={goal.status} size="sm" />
            </div>
            <p className="text-xs text-[#757A95] mt-0.5">
              {goal.notes || `Target ${formatDeadline(goal.targetDate)}`}
            </p>
          </div>
        </div>

        {/* Top-Right Action Controls (Kebab Menu + Close Button) */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-[#757A95] hover:text-[#242636] hover:bg-black/[0.04] transition-colors cursor-pointer"
              title="Menu Opsi"
            >
              <MoreVertical size={18} />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-44 p-1.5 bg-white border border-black/[0.08] rounded-2xl shadow-[0_12px_30px_rgba(36,38,54,0.12)] z-30 space-y-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onEdit(goal);
                  }}
                  className="w-full px-3 py-2 rounded-xl text-left text-xs font-semibold text-[#242636] hover:bg-[#F8F9FD] flex items-center gap-2 cursor-pointer"
                >
                  <Pencil size={13} className="text-[#7C7CE6]" />
                  <span>Edit Target</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onDelete(goal);
                  }}
                  className="w-full px-3 py-2 rounded-xl text-left text-xs font-semibold text-[#B83A38] hover:bg-[#FFF1F0] flex items-center gap-2 cursor-pointer"
                >
                  <Trash2 size={13} />
                  <span>Hapus Target</span>
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#757A95] hover:text-[#242636] hover:bg-black/[0.04] transition-colors cursor-pointer"
            title="Tutup"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. MAIN PROGRESS & 4 METRIC CARDS                                         */}
      {/* ========================================================================= */}
      <div className="p-5 sm:p-6 rounded-[28px] bg-gradient-to-br from-[#FAF9FE] via-white to-[#F4F2FD] border border-[#E8E4F8] space-y-4">
        {/* Progress Bar Header */}
        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#757A95] block">
                Dana Terkumpul
              </span>
              <div className="text-2xl sm:text-3xl font-black text-[#242636] tabular-nums">
                {formatIDR(goal.currentAmount)}
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#757A95] block">
                Target Capaian
              </span>
              <div className="text-base sm:text-lg font-bold text-[#757A95] tabular-nums">
                {formatIDR(goal.targetAmount)}
              </div>
            </div>
          </div>

          <div className="w-full h-3.5 bg-[#EAE9F5] rounded-full overflow-hidden p-0.5 shadow-inner">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className={`h-full rounded-full ${theme.bar}`}
            />
          </div>

          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-[#5F5ED4]">{percentage}% Terkumpul</span>
            <span className="text-[#757A95]">Sisa Kebutuhan: {formatIDR(remaining)}</span>
          </div>
        </div>

        {/* 4 Information Metric Mini Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
          <div className="p-3 rounded-2xl bg-white border border-black/[0.05] text-center space-y-0.5">
            <span className="text-[10px] font-bold text-[#757A95] uppercase tracking-wider block">
              Sumber Dana
            </span>
            <div className="text-xs sm:text-sm font-extrabold text-[#242636] truncate">
              {goal.sourceWalletName || 'BCA Priority'}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white border border-[#7C7CE6]/25 bg-[#FAF9FE] text-center space-y-0.5">
            <span className="text-[10px] font-bold text-[#5F5ED4] uppercase tracking-wider block">
              Dompet Tujuan
            </span>
            <div className="text-xs sm:text-sm font-extrabold text-[#5F5ED4] truncate">
              {goal.destinationWalletName || 'Tabungan'}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white border border-black/[0.05] text-center space-y-0.5">
            <span className="text-[10px] font-bold text-[#757A95] uppercase tracking-wider block">
              Rencana {isWeekly ? 'Mingguan' : 'Bulanan'}
            </span>
            <div className="text-xs sm:text-sm font-extrabold text-[#1B7354] tabular-nums">
              {formatIDR(isWeekly ? weeklySaving : goal.monthlySaving)}/{isWeekly ? 'mgg' : 'bln'}
            </div>
            <span className="text-[10px] text-[#757A95] block">≈ {formatIDR(isWeekly ? goal.monthlySaving : weeklySaving)}/{isWeekly ? 'bln' : 'mgg'}</span>
          </div>

          <div className="p-3 rounded-2xl bg-white border border-black/[0.05] text-center space-y-0.5">
            <span className="text-[10px] font-bold text-[#757A95] uppercase tracking-wider block">
              Target Tanggal
            </span>
            <div className="text-xs sm:text-sm font-extrabold text-[#242636] truncate">
              {formatDeadline(goal.targetDate)}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. SAVING PLAN & PROGRESS BULAN INI                                       */}
      {/* ========================================================================= */}
      <div className="space-y-2">
        <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#757A95]">
          Rencana Tabungan Bulan Ini
        </h4>
        <div className="p-4 rounded-2xl bg-white border border-black/[0.05] space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#757A95]">
              Target {isWeekly ? 'Minggu' : 'Bulan'} Ini: <strong className="text-[#242636]">{formatIDR(isWeekly ? weeklySaving : goal.monthlySaving)}</strong>
              <span className="text-[#A0A4B8] ml-1">({formatIDR(isWeekly ? goal.monthlySaving : weeklySaving)}/{isWeekly ? 'bln' : 'mgg'})</span>
            </span>
            <span className="font-extrabold text-[#1B7354]">
              Tersisihkan: {formatIDR(thisMonthSaved)} ({monthlyPlanProgress}%)
            </span>
          </div>
          <div className="w-full h-2 bg-[#F4F3F9] rounded-full overflow-hidden">
            <div
              style={{ width: `${monthlyPlanProgress}%` }}
              className="h-full rounded-full bg-[#10B981] transition-all duration-500"
            />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. GOAL TIMELINE                                                          */}
      {/* ========================================================================= */}
      <GoalTimeline
        percentage={percentage}
        hasContributions={goal.contributions.length > 0}
      />

      {/* ========================================================================= */}
      {/* 5. RIWAYAT TABUNGAN / CONTRIBUTIONS LIST (TRANSFER RECORDS)               */}
      {/* ========================================================================= */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#757A95]">
            Riwayat Setoran Tabungan (Transfer Internal)
          </h4>
          <span className="text-[11px] text-[#757A95]">
            {goal.contributions.length} Transaksi
          </span>
        </div>

        {goal.contributions.length === 0 ? (
          <div className="p-4 rounded-2xl bg-[#F8F9FD] border border-black/[0.05] text-center text-xs text-[#757A95]">
            Belum ada setoran tabungan yang tercatat untuk target ini.
          </div>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {goal.contributions.map((c) => (
              <div
                key={c.id}
                className="p-3 rounded-2xl bg-white hover:bg-[#FAF9FE] border border-black/[0.05] flex items-center justify-between transition-colors text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-[#EDEAFC] text-[#5F5ED4] flex items-center justify-center font-bold text-[10px]">
                    <Plus size={13} strokeWidth={2.5} />
                  </div>
                  <div>
                    <span className="font-bold text-[#242636] block">
                      {c.note || `Setoran ${goal.title}`}
                    </span>
                    <div className="flex items-center gap-1.5 text-[10px] text-[#757A95] mt-0.5">
                      <span>{c.date}</span>
                      <span>•</span>
                      <span className="font-semibold text-[#242636]">{c.sourceWalletName || 'BCA'}</span>
                      <ArrowRight size={10} className="text-[#7C7CE6]" />
                      <span className="font-semibold text-[#5F5ED4]">{c.destinationWalletName || 'Tabungan'}</span>
                    </div>
                  </div>
                </div>
                <span className="font-black text-[#1B7354] tabular-nums text-sm">
                  +{formatIDR(c.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 6. FINAI INSIGHT & RECOMMENDATION                                         */}
      {/* ========================================================================= */}
      <div className="p-4 rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0] space-y-1">
        <div className="flex items-center gap-1.5 text-xs font-bold text-[#15803D]">
          <Sparkles size={14} />
          <span>FinAI Insight</span>
        </div>
        <p className="text-xs text-[#166534] leading-relaxed">
          {percentage >= 100
            ? `Target ${goal.title} telah tercapai 100%! Dana aman tersimpan di ${goal.destinationWalletName}.`
            : `Menyetor ${formatIDR(isWeekly ? weeklySaving : goal.monthlySaving)}/${isWeekly ? 'minggu' : 'bulan'} (≈ ${formatIDR(isWeekly ? goal.monthlySaving : weeklySaving)}/${isWeekly ? 'bulan' : 'minggu'}) dari ${goal.sourceWalletName} ke ${goal.destinationWalletName} akan memastikan target tercapai tepat pada ${formatDeadline(goal.targetDate)}.`}
        </p>
      </div>

      {/* ========================================================================= */}
      {/* 7. BOTTOM ACTION BUTTON                                                   */}
      {/* ========================================================================= */}
      <div className="pt-2 border-t border-black/[0.05]">
        <button
          type="button"
          onClick={() => onAddContribution(goal)}
          className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-[#7C7CE6] to-[#8C8BE8] hover:brightness-105 active:scale-[0.98] text-white font-bold text-xs sm:text-sm shadow-[0_8px_20px_rgba(124,124,230,0.35)] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Plus size={16} />
          <span>Tambah Tabungan</span>
        </button>
      </div>
    </Modal>
  );
}
