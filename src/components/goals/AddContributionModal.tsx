'use client';

import React, { useState } from 'react';
import { Plus, Sparkles, TrendingUp, X } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import DatePicker from '@/components/ui/DatePicker';
import WalletSelect from '@/components/ui/WalletSelect';
import { GoalItem, GoalContribution, Wallet } from '@/types';
import { MOCK_WALLETS, formatIDR } from '@/data/mockData';

interface AddContributionModalProps {
  goal: GoalItem | null;
  isOpen: boolean;
  onClose: () => void;
  onAddContribution: (goalId: string, contribution: GoalContribution) => void;
}

export default function AddContributionModal({
  goal,
  isOpen,
  onClose,
  onAddContribution,
}: AddContributionModalProps) {
  const [amountRaw, setAmountRaw] = useState('500000');
  const [selectedWalletId, setSelectedWalletId] = useState('BCA');
  const [date, setDate] = useState('2026-08-31');
  const [note, setNote] = useState('');

  if (!goal) return null;

  const amount = parseFloat(amountRaw) || 0;
  const remaining = Math.max(goal.targetAmount - goal.currentAmount, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;

    const wallet = MOCK_WALLETS.find((w: Wallet) => w.id === selectedWalletId);

    const newContrib: GoalContribution = {
      id: `c-${Date.now()}`,
      amount,
      date,
      walletName: wallet ? wallet.name : 'Bank BCA',
      note: note.trim() || undefined,
    };

    onAddContribution(goal.id, newContrib);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="sm"
      hideHeader
      hideCloseButton={true}
      className="p-6 sm:p-7"
    >
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between pb-1 border-b border-black/[0.04]">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#EDEAFC] text-[#5F5ED4] flex items-center justify-center">
                <Plus size={16} strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#242636] tracking-tight">
                  Tambah Tabungan
                </h3>
                <p className="text-xs text-[#757A95]">
                  Setor dana untuk {goal.title}
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#757A95] hover:text-[#242636] hover:bg-black/[0.04] transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Goal Brief Status */}
        <div className="p-3 rounded-2xl bg-[#F8F9FD] border border-black/[0.05] flex items-center justify-between text-xs">
          <span className="text-[#757A95]">Sisa Kebutuhan:</span>
          <span className="font-extrabold text-[#242636] tabular-nums">
            {formatIDR(remaining)}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 1. Nominal */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-[#757A95] uppercase tracking-wider block">
              Nominal Tabungan
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-[#757A95]">
                Rp
              </span>
              <input
                type="number"
                required
                min="10000"
                step="50000"
                value={amountRaw}
                onChange={(e) => setAmountRaw(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#F8F9FD] border border-black/[0.06] rounded-2xl text-base sm:text-lg font-extrabold text-[#242636] focus:outline-none focus:border-[#7C7CE6] focus:bg-white transition-all tabular-nums"
              />
            </div>
          </div>

          {/* 2. Sumber Dana */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-[#757A95] uppercase tracking-wider block">
              Sumber Dana Dompet
            </label>
            <WalletSelect
              value={selectedWalletId}
              onChange={setSelectedWalletId}
              wallets={MOCK_WALLETS}
            />
          </div>

          {/* 3. Tanggal */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-[#757A95] uppercase tracking-wider block">
              Tanggal Setoran
            </label>
            <DatePicker value={date} onChange={setDate} />
          </div>

          {/* 4. Catatan */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-[#757A95] uppercase tracking-wider block">
              Catatan (Opsional)
            </label>
            <input
              type="text"
              placeholder="Contoh: Bonus proyek, sisa uang saku..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#F8F9FD] border border-black/[0.06] rounded-2xl text-xs sm:text-sm text-[#242636] placeholder-[#757A95] focus:outline-none focus:border-[#7C7CE6] focus:bg-white transition-all"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-2.5 pt-3 border-t border-black/[0.05]">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-2xl bg-[#F4F3F9] hover:bg-[#EAE9F2] text-[#757A95] font-bold text-xs transition-colors cursor-pointer"
            >
              Batal
            </button>
            <Button type="submit" variant="primary" size="md" className="flex-1">
              Simpan Tabungan
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
