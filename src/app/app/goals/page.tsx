'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Target,
  Plus,
  Sparkles,
  Calendar,
  TrendingUp,
  ShieldCheck,
} from 'lucide-react';
import Header from '@/components/navigation/Header';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import GoalVisual from '@/components/visual/GoalVisual';
import { MOCK_GOALS, formatIDR } from '@/data/mockData';
import { FinancialGoal } from '@/types';

export default function GoalsPage() {
  const [goals, setGoals] = useState<FinancialGoal[]>(MOCK_GOALS);
  const [selectedGoalId, setSelectedGoalId] = useState<string>('g-1');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Pengembangan Diri');
  const [newTarget, setNewTarget] = useState('');
  const [newDeadline, setNewDeadline] = useState('Desember 2026');

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newTarget) return;

    const newGoalItem: FinancialGoal = {
      id: `g-${Date.now()}`,
      title: newTitle,
      category: newCategory,
      currentAmount: 0,
      targetAmount: parseFloat(newTarget),
      deadline: newDeadline,
      icon3d: 'laptop',
      monthlyContribution: 1000000,
      status: 'Baru dimulai',
    };

    setGoals([...goals, newGoalItem]);
    setNewTitle('');
    setNewTarget('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-10">
      {/* Header */}
      <Header
        title="Target Keuangan & Impian"
        subtitle="Visualisasikan progres impian finansial dan estimasi waktu pencapaiannya"
        actionButton={
          <Button
            variant="primary"
            size="md"
            icon={<Plus size={16} />}
            onClick={() => setIsAddModalOpen(true)}
          >
            Buat Target Baru
          </Button>
        }
      />

      {/* Visual Showcase Banner */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-[0_10px_35px_rgba(124,124,230,0.06)] border border-white/90">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <Badge variant="periwinkle" size="sm" icon={<Sparkles size={12} />}>
              Target Aktif
            </Badge>
            <h2 className="text-xl font-bold text-[#242636] mt-1">
              Alokasi & Kecepatan Tabungan Impian
            </h2>
          </div>
          <span className="text-xs font-semibold text-[#1B7354] bg-[#D0EFE5] px-3 py-1 rounded-full">
            Total Seluruh Target: Rp57.000.000
          </span>
        </div>

        {/* CSS/SVG Visual Badges Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
          {goals.map((g) => {
            const isSelected = selectedGoalId === g.id;
            const pct = Math.round((g.currentAmount / g.targetAmount) * 100);

            return (
              <div
                key={g.id}
                onClick={() => setSelectedGoalId(g.id)}
                className={`p-6 rounded-3xl transition-all cursor-pointer select-none flex flex-col items-center text-center space-y-3 ${
                  isSelected
                    ? 'bg-white/95 shadow-[0_14px_40px_rgba(124,124,230,0.15)] border-2 border-[#7C7CE6]/40 scale-102'
                    : 'bg-white/60 hover:bg-white/80 border border-white/80'
                }`}
              >
                <GoalVisual type={g.icon3d} size="lg" active={isSelected} />
                <div>
                  <h3 className="text-sm font-bold text-[#242636]">
                    {g.title === 'Laptop Workstation'
                      ? 'Laptop Kerja M3 Pro'
                      : g.title === 'Japan Travel'
                      ? 'Liburan ke Jepang'
                      : g.title === 'Emergency Shield'
                      ? 'Dana Darurat'
                      : g.title}
                  </h3>
                  <span className="text-xs text-[#757A95]">{g.category}</span>
                </div>
                <Badge variant={isSelected ? 'periwinkle' : 'glass'} size="sm">
                  {pct}% Tercapai
                </Badge>
              </div>
            );
          })}
        </div>
      </div>

      {/* Goal Details Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {goals.map((g) => {
          const pct = Math.round((g.currentAmount / g.targetAmount) * 100);
          const isFocused = selectedGoalId === g.id;

          return (
            <GlassCard
              key={g.id}
              variant={isFocused ? 'elevated' : 'default'}
              interactive
              onClick={() => setSelectedGoalId(g.id)}
              className={`p-6 space-y-5 transition-all ${
                isFocused ? 'ring-2 ring-[#7C7CE6]/40' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <GoalVisual type={g.icon3d} size="sm" />
                  <div>
                    <h3 className="text-sm font-bold text-[#242636]">
                      {g.title === 'Laptop Workstation'
                        ? 'Laptop Kerja M3 Pro'
                        : g.title === 'Japan Travel'
                        ? 'Liburan ke Jepang'
                        : g.title === 'Emergency Shield'
                        ? 'Dana Darurat'
                        : g.title}
                    </h3>
                    <span className="text-[11px] text-[#757A95]">
                      {g.category}
                    </span>
                  </div>
                </div>
                <span className="text-sm font-extrabold text-[#7C7CE6]">
                  {pct}%
                </span>
              </div>

              {/* Progress Line */}
              <div className="space-y-1.5">
                <div className="w-full h-2.5 rounded-full bg-black/[0.04] overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="h-full rounded-full bg-gradient-to-r from-[#7C7CE6] to-[#C9E7DC]"
                  />
                </div>
                <div className="flex items-center justify-between text-xs font-bold text-[#242636]">
                  <span>{formatIDR(g.currentAmount)}</span>
                  <span className="text-[#757A95] font-medium">
                    Target {formatIDR(g.targetAmount)}
                  </span>
                </div>
              </div>

              {/* Pacing details */}
              <div className="pt-3 border-t border-black/[0.04] flex items-center justify-between text-[11px] text-[#757A95]">
                <span className="flex items-center gap-1">
                  <Calendar size={12} className="text-[#7C7CE6]" />
                  {g.deadline}
                </span>
                <span className="font-semibold text-[#1B7354]">
                  +{formatIDR(g.monthlyContribution)} / bln
                </span>
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* Add Goal Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Buat Target Impian Baru"
        subtitle="Tetapkan nominal target dan estimasi setoran tabungan bulanan"
      >
        <form onSubmit={handleAddGoal} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-[#757A95] block mb-1">
              Nama Target
            </label>
            <input
              type="text"
              required
              placeholder="misal: Mobil Pertama, DP Rumah, Umroh"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full px-4 py-2.5 bg-black/[0.02] border border-black/[0.06] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#7C7CE6]/50 focus:bg-white text-[#242636]"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[#757A95] block mb-1">
              Kategori
            </label>
            <input
              type="text"
              placeholder="misal: Gadget, Liburan, Tabungan Masa Depan"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="w-full px-4 py-2.5 bg-black/[0.02] border border-black/[0.06] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#7C7CE6]/50 focus:bg-white text-[#242636]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#757A95] block mb-1">
                Target Dana (Rp)
              </label>
              <input
                type="number"
                required
                placeholder="15000000"
                value={newTarget}
                onChange={(e) => setNewTarget(e.target.value)}
                className="w-full px-4 py-2.5 bg-black/[0.02] border border-black/[0.06] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#7C7CE6]/50 focus:bg-white text-[#242636]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#757A95] block mb-1">
                Estimasi Waktu
              </label>
              <input
                type="text"
                placeholder="misal: Des 2026"
                value={newDeadline}
                onChange={(e) => setNewDeadline(e.target.value)}
                className="w-full px-4 py-2.5 bg-black/[0.02] border border-black/[0.06] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#7C7CE6]/50 focus:bg-white text-[#242636]"
              />
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-black/[0.05]">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsAddModalOpen(false)}
            >
              Batal
            </Button>
            <Button type="submit" variant="primary" size="md">
              Simpan Target
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
