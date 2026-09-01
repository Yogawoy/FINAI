'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Sparkles, TrendingUp, X, AlertCircle } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import DatePicker from '@/components/ui/DatePicker';
import WalletSelect from '@/components/ui/WalletSelect';
import { GoalItem, GoalContribution, Wallet } from '@/types';
import { MOCK_WALLETS, formatIDR } from '@/data/mockData';
import GoalTransferFlow from './GoalTransferFlow';

interface AddContributionModalProps {
  goal: GoalItem | null;
  isOpen: boolean;
  onClose: () => void;
  onAddContribution: (goalId: string, contribution: GoalContribution) => void;
  wallets?: Wallet[];
}

export default function AddContributionModal({
  goal,
  isOpen,
  onClose,
  onAddContribution,
  wallets = MOCK_WALLETS,
}: AddContributionModalProps) {
  const [amountRaw, setAmountRaw] = useState('500000');
  const [sourceWalletId, setSourceWalletId] = useState('w-1');
  const [destinationWalletId, setDestinationWalletId] = useState('w-5');
  const [date, setDate] = useState('2026-09-01');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (goal) {
      setSourceWalletId(goal.sourceWalletId || 'w-1');
      setDestinationWalletId(goal.destinationWalletId || 'w-5');
      setNote(`Setoran tabungan untuk ${goal.title}`);
    }
  }, [goal]);

  const amount = parseFloat(amountRaw) || 0;
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

  if (!goal) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0 || isSameWallet) return;

    const newContrib: GoalContribution = {
      id: `c-${Date.now()}`,
      amount,
      date,
      sourceWalletId,
      sourceWalletName: sourceWallet ? sourceWallet.name : 'Bank BCA',
      destinationWalletId,
      destinationWalletName: destinationWallet ? destinationWallet.name : 'Tabungan',
      note: note.trim() || `Setoran ${goal.title}`,
    };

    onAddContribution(goal.id, newContrib);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="md"
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
                  Setor dana untuk <strong className="text-[#242636]">{goal.title}</strong>
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

          {/* 2. DUAL WALLETS (DARI DOMPET -> KE DOMPET) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[#242636] uppercase tracking-wider block">
                Dari Dompet (Sumber)
              </label>
              <WalletSelect
                value={sourceWalletId}
                onChange={setSourceWalletId}
                wallets={wallets}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[#5F5ED4] uppercase tracking-wider block">
                Ke Dompet (Tujuan)
              </label>
              <WalletSelect
                value={destinationWalletId}
                onChange={setDestinationWalletId}
                wallets={wallets}
              />
            </div>
          </div>

          {/* 3. Transfer Preview Visual */}
          <GoalTransferFlow
            sourceWallet={sourceWallet}
            destinationWallet={destinationWallet}
            amount={amount}
            mode="contribution"
          />

          {/* 4. Tanggal & Catatan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[#757A95] uppercase tracking-wider block">
                Tanggal Setoran
              </label>
              <DatePicker value={date} onChange={setDate} />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[#757A95] uppercase tracking-wider block">
                Catatan (Opsional)
              </label>
              <input
                type="text"
                placeholder="Contoh: Tabungan bulan September..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#F8F9FD] border border-black/[0.06] rounded-2xl text-xs sm:text-sm text-[#242636] placeholder-[#757A95] focus:outline-none focus:border-[#7C7CE6] focus:bg-white transition-all"
              />
            </div>
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
            <Button
              type="submit"
              variant="primary"
              size="md"
              className="flex-1"
              disabled={isSameWallet || amount <= 0}
            >
              Simpan Tabungan
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
