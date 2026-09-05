'use client';

import React, { useState } from 'react';
import { Target, Calendar, PiggyBank, TrendingUp, AlertCircle, CheckCircle2, X, Save, Wallet } from 'lucide-react';
import { formatIDR } from '@/lib/format';
import { apiClient } from '@/lib/api-client';

interface Plan {
  targetName: string;
  targetAmount: number;
  currentAmount: number;
  remainingAmount: number;
  durationMonths: number;
  requiredMonthlySaving: number;
  monthlyIncome: number;
  monthlyExpense: number;
  monthlyNetCashFlow: number;
  requiredPercentageOfNet: number;
  feasibility: 'realistic' | 'tight' | 'unlikely' | 'insufficient_data';
  assumptions: string[];
  relatedGoalId?: string | null;
}

interface FinancialPlanCardProps {
  plan: Plan;
  wallets: { id: string; name: string }[];
  onSave?: (goalId: string) => void;
  onCancel?: () => void;
  onWalletSelected?: (walletId: string) => void;
}

const FEASIBILITY_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  realistic: {
    label: 'Target Terlihat Realistis',
    color: 'text-[#1B7354]',
    icon: CheckCircle2,
  },
  tight: {
    label: 'Target Ketat',
    color: 'text-[#D97706]',
    icon: AlertCircle,
  },
  unlikely: {
    label: 'Target Sulit Dicapai',
    color: 'text-[#D94F4F]',
    icon: AlertCircle,
  },
  insufficient_data: {
    label: 'Data Belum Cukup',
    color: 'text-[#757A95]',
    icon: AlertCircle,
  },
};

export default function FinancialPlanCard({ plan, wallets, onSave, onCancel, onWalletSelected }: FinancialPlanCardProps) {
  const feasibilityInfo = FEASIBILITY_CONFIG[plan.feasibility] || FEASIBILITY_CONFIG.insufficient_data;
  const FeasibilityIcon = feasibilityInfo.icon;

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);

  const planComplete =
    plan.targetAmount > 0 &&
    plan.remainingAmount > 0 &&
    plan.durationMonths > 0;

  const canSave = planComplete && selectedWalletId !== null && wallets.length > 0;

  const handleSave = async () => {
    if (!canSave || saving || saved) return;
    setSaving(true);
    setError(null);

    try {
      const category = plan.relatedGoalId ? 'Target Impian' : 'Rencana';
      const deadline = new Date();
      deadline.setMonth(deadline.getMonth() + plan.durationMonths);

      const res = await apiClient.post<{ goal: { id: string } }>('/api/goals', {
        name: plan.targetName,
        category,
        targetAmount: plan.targetAmount,
        deadline: deadline.toISOString(),
        sourceWalletId: selectedWalletId,
        destinationWalletId: selectedWalletId,
        frequency: 'MONTHLY',
        autoDeposit: false,
      });

      setSaved(true);
      onSave?.(res.goal.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan target');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (saving) return;
    onCancel?.();
  };

  const handleWalletSelect = (walletId: string) => {
    setSelectedWalletId(walletId);
    onWalletSelected?.(walletId);
  };

  const handleOpenWallets = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/app/wallets';
    }
  };

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E8EAF2] shadow-[0_6px_24px_rgba(36,38,54,0.04)] space-y-4 max-w-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="px-2.5 py-0.5 rounded-full bg-[#EDEAFC] text-[#5F5ED4] text-[10px] font-bold uppercase tracking-wider">
            Rencana Keuangan
          </span>
          <h4 className="text-sm sm:text-base font-bold text-[#242636] mt-1.5">{plan.targetName}</h4>
        </div>
        <div className={`text-right flex items-center gap-1 ${feasibilityInfo.color}`}>
          <FeasibilityIcon size={14} />
          <span className="text-[10px] font-bold uppercase tracking-wider">{feasibilityInfo.label}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div>
          <span className="text-[#757A95] flex items-center gap-1">
            <Target size={12} /> Target
          </span>
          <span className="font-bold text-[#242636] tabular-nums block">{formatIDR(plan.targetAmount)}</span>
        </div>
        <div className="text-right">
          <span className="text-[#757A95] block">Sisa</span>
          <span className="font-bold text-[#242636] tabular-nums">{formatIDR(plan.remainingAmount)}</span>
        </div>
        <div>
          <span className="text-[#757A95] flex items-center gap-1">
            <Calendar size={12} /> Durasi
          </span>
          <span className="font-bold text-[#242636] tabular-nums">{plan.durationMonths} bulan</span>
        </div>
        <div className="text-right">
          <span className="text-[#757A95] flex items-center justify-end gap-1">
            <PiggyBank size={12} /> Tabungan/Bulan
          </span>
          <span className="font-bold text-[#242636] tabular-nums">{formatIDR(plan.requiredMonthlySaving)}</span>
        </div>
      </div>

      <div className="space-y-2 pt-2 border-t border-[#E8EAF2]/70">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[#757A95] flex items-center gap-1">
            <TrendingUp size={12} /> Surplus Bulanan
          </span>
          <span className="font-bold text-[#1B7354] tabular-nums">{formatIDR(plan.monthlyNetCashFlow)}</span>
        </div>
        <div className="w-full h-2 rounded-full bg-[#F0EFFC] overflow-hidden p-0.5">
          <div
            className={`h-full rounded-full transition-all ${
              plan.requiredPercentageOfNet <= 60
                ? 'bg-[#1B7354]'
                : plan.requiredPercentageOfNet <= 90
                ? 'bg-[#D97706]'
                : 'bg-[#D94F4F]'
            }`}
            style={{ width: `${Math.min(plan.requiredPercentageOfNet, 100)}%` }}
          />
        </div>
        <div className="text-[10px] text-[#757A95] text-right">
          {plan.requiredPercentageOfNet.toFixed(1)}% dari surplus bulanan
        </div>
      </div>

      {plan.assumptions.length > 0 && (
        <div className="space-y-1.5 pt-2 border-t border-[#E8EAF2]/70">
          <span className="text-[10px] font-bold text-[#757A95] uppercase tracking-wider">Asumsi</span>
          {plan.assumptions.map((assumption, idx) => (
            <p key={idx} className="text-[11px] text-[#757A95] leading-relaxed">
              {assumption}
            </p>
          ))}
        </div>
      )}

      {planComplete && (
        <div className="pt-3 border-t border-[#E8EAF2]/70 space-y-3">
          {wallets.length === 0 ? (
            <div className="text-[11px] text-[#757A95] space-y-2">
              <p>Kamu belum punya dompet. Buat dompet dulu sebelum menyimpan target.</p>
              <button
                type="button"
                onClick={handleOpenWallets}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl bg-[#E4E2FB] text-[#7C7CE6] hover:bg-[#D9D6F7] transition-colors"
              >
                <Wallet size={14} />
                Buka Halaman Dompet
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-[11px] text-[#757A95]">Pilih dompet untuk target ini:</div>
              <div className="flex flex-wrap gap-2">
                {wallets.map((wallet) => {
                  const isSelected = selectedWalletId === wallet.id;
                  return (
                    <button
                      key={wallet.id}
                      type="button"
                      onClick={() => handleWalletSelect(wallet.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl border transition-colors ${
                        isSelected
                          ? 'bg-[#EDEAFC] border-[#7C7CE6] text-[#5F5ED4]'
                          : 'bg-white border-[#E8EAF2] text-[#242636] hover:border-[#7C7CE6]/40'
                      }`}
                    >
                      <Wallet size={14} />
                      {wallet.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {error && <div className="text-[11px] text-red-500">{error}</div>}
          {saved && <div className="text-[11px] text-[#1B7354]">Target berhasil disimpan.</div>}

          {!saved && (
            <div className="flex items-center justify-between gap-3">
              <div className="text-[11px] text-[#757A95]">
                {!selectedWalletId && wallets.length > 0
                  ? 'Pilih dompet untuk menyimpan target.'
                  : 'Simpan untuk membuat target impian.'}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl bg-[#E4E2FB] text-[#7C7CE6] hover:bg-[#D9D6F7] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                >
                  <X size={14} />
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={!canSave || saving || saved}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl bg-gradient-to-r from-[#7C7CE6] to-[#8C8BE8] text-white shadow-sm hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                >
                  <Save size={14} />
                  {saving ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {!planComplete && (
        <div className="pt-3 border-t border-[#E8EAF2]/70">
          <div className="text-[11px] text-[#757A95]">
            Data plan belum cukup. Isi informasi yang dibutuhkan terlebih dahulu.
          </div>
        </div>
      )}
    </div>
  );
}
