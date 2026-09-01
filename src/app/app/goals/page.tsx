'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Target, Sparkles, CircleCheck } from 'lucide-react';
import Button from '@/components/ui/Button';
import TransactionToast from '@/components/transactions/TransactionToast';
import { GoalItem, GoalContribution, Wallet } from '@/types';
import { MOCK_GOALS_LIST, MOCK_WALLETS, formatIDR } from '@/data/mockData';

// Loading & Page Transition
import GoalsSkeleton from '@/components/loading/GoalsSkeleton';
import PageTransition from '@/components/loading/PageTransition';

// Subcomponents
import GoalSummary from '@/components/goals/GoalSummary';
import FeaturedGoal from '@/components/goals/FeaturedGoal';
import GoalFilters, { GoalFilterStatus, GoalSortOption } from '@/components/goals/GoalFilters';
import GoalList from '@/components/goals/GoalList';
import CreateGoalModal from '@/components/goals/CreateGoalModal';
import EditGoalModal from '@/components/goals/EditGoalModal';
import GoalDetailModal from '@/components/goals/GoalDetailModal';
import DeleteGoalDialog from '@/components/goals/DeleteGoalDialog';
import AddContributionModal from '@/components/goals/AddContributionModal';

export default function GoalsPage() {
  // Loading State with Smooth Transition
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 450);
    return () => clearTimeout(timer);
  }, []);

  // State: Goals List & Wallets
  const [goals, setGoals] = useState<GoalItem[]>(MOCK_GOALS_LIST);
  const [wallets, setWallets] = useState<Wallet[]>(MOCK_WALLETS);

  // State: Active Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isContributionModalOpen, setIsContributionModalOpen] = useState(false);

  // State: Selected Goal for Modals
  const [activeGoal, setActiveGoal] = useState<GoalItem | null>(null);

  // State: Filters & Sort
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<GoalFilterStatus>('all');
  const [selectedSort, setSelectedSort] = useState<GoalSortOption>('newest');

  // State: Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  // Calculations for Summary
  const summary = useMemo(() => {
    const totalTarget = goals.reduce((acc, g) => acc + g.targetAmount, 0);
    const totalSaved = goals.reduce((acc, g) => acc + g.currentAmount, 0);
    const progressPercent =
      totalTarget > 0 ? parseFloat(((totalSaved / totalTarget) * 100).toFixed(1)) : 0;
    const activeCount = goals.filter((g) => g.currentAmount < g.targetAmount).length;
    const completedCount = goals.filter((g) => g.currentAmount >= g.targetAmount).length;

    return {
      totalTarget,
      totalSaved,
      progressPercent,
      activeCount,
      completedCount,
    };
  }, [goals]);

  // Featured Goal: Top priority active goal
  const featuredGoal = useMemo(() => {
    if (goals.length === 0) return null;
    return goals[0];
  }, [goals]);

  // Filtered and Sorted Goals List (for Grid)
  const filteredGoals = useMemo(() => {
    let result = [...goals];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (g) =>
          g.title.toLowerCase().includes(q) ||
          (g.notes && g.notes.toLowerCase().includes(q)) ||
          g.sourceWalletName.toLowerCase().includes(q) ||
          g.destinationWalletName.toLowerCase().includes(q)
      );
    }

    // Status filter
    if (selectedFilter === 'active') {
      result = result.filter((g) => g.currentAmount < g.targetAmount);
    } else if (selectedFilter === 'completed') {
      result = result.filter((g) => g.currentAmount >= g.targetAmount || g.status === 'completed');
    } else if (selectedFilter === 'attention') {
      result = result.filter((g) => g.status === 'needs_attention' || g.status === 'behind');
    }

    // Sort option
    if (selectedSort === 'deadline_asc') {
      result.sort((a, b) => (a.targetDate || '').localeCompare(b.targetDate || ''));
    } else if (selectedSort === 'progress_desc') {
      result.sort((a, b) => {
        const pctA = a.targetAmount > 0 ? a.currentAmount / a.targetAmount : 0;
        const pctB = b.targetAmount > 0 ? b.currentAmount / b.targetAmount : 0;
        return pctB - pctA;
      });
    } else if (selectedSort === 'progress_asc') {
      result.sort((a, b) => {
        const pctA = a.targetAmount > 0 ? a.currentAmount / a.targetAmount : 0;
        const pctB = b.targetAmount > 0 ? b.currentAmount / b.targetAmount : 0;
        return pctA - pctB;
      });
    }

    return result;
  }, [goals, searchQuery, selectedFilter, selectedSort]);

  // Handlers for Goal Lifecycle
  const handleCreateGoal = (newGoal: GoalItem) => {
    setGoals((prev) => [newGoal, ...prev]);
    showToast(`Target "${newGoal.title}" berhasil dibuat.`);
  };

  const handleUpdateGoal = (updatedGoal: GoalItem) => {
    setGoals((prev) => prev.map((g) => (g.id === updatedGoal.id ? updatedGoal : g)));
    setActiveGoal(updatedGoal);
    showToast(`Target "${updatedGoal.title}" berhasil diperbarui.`);
  };

  const handleDeleteGoal = (goalId: string) => {
    const target = goals.find((g) => g.id === goalId);
    setGoals((prev) => prev.filter((g) => g.id !== goalId));
    setIsDetailModalOpen(false);
    showToast(`Target "${target?.title || 'Impian'}" berhasil dihapus.`);
  };

  const handleAddContribution = (goalId: string, contribution: GoalContribution) => {
    // 1. Update wallet balances (Internal Transfer: Source -amount, Destination +amount)
    setWallets((prevWallets) =>
      prevWallets.map((w) => {
        if (w.id === contribution.sourceWalletId) {
          return { ...w, balance: Math.max(w.balance - contribution.amount, 0) };
        }
        if (w.id === contribution.destinationWalletId) {
          return { ...w, balance: w.balance + contribution.amount };
        }
        return w;
      })
    );

    // 2. Update Goal currentAmount and contributions history
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id === goalId) {
          const newCurrent = g.currentAmount + contribution.amount;
          const isDone = newCurrent >= g.targetAmount;
          return {
            ...g,
            currentAmount: newCurrent,
            status: isDone ? 'completed' : g.status,
            contributions: [contribution, ...g.contributions],
          };
        }
        return g;
      })
    );

    // If active in detail modal, update active state too
    if (activeGoal && activeGoal.id === goalId) {
      const newCurrent = activeGoal.currentAmount + contribution.amount;
      setActiveGoal({
        ...activeGoal,
        currentAmount: newCurrent,
        status: newCurrent >= activeGoal.targetAmount ? 'completed' : activeGoal.status,
        contributions: [contribution, ...activeGoal.contributions],
      });
    }

    showToast('Tabungan berhasil ditambahkan.');
  };

  // Modal Opener Triggers
  const handleSelectGoal = (goal: GoalItem) => {
    setActiveGoal(goal);
    setIsDetailModalOpen(true);
  };

  const handleEditTrigger = (goal: GoalItem) => {
    setIsDetailModalOpen(false);
    setActiveGoal(goal);
    setIsEditModalOpen(true);
  };

  const handleDeleteTrigger = (goal: GoalItem) => {
    setIsDetailModalOpen(false);
    setActiveGoal(goal);
    setIsDeleteDialogOpen(true);
  };

  const handleContributionTrigger = (goal: GoalItem) => {
    setIsDetailModalOpen(false);
    setActiveGoal(goal);
    setIsContributionModalOpen(true);
  };

  if (isLoading) {
    return <GoalsSkeleton />;
  }

  return (
    <PageTransition>
      <div className="space-y-8 max-w-7xl mx-auto pb-16">
        {/* ========================================================================= */}
        {/* 1. PAGE HEADER                                                            */}
        {/* ========================================================================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#242636] tracking-tight">
              Target Impian
            </h1>
            <p className="text-xs sm:text-sm text-[#757A95] mt-0.5">
              Turn your plans into something you can achieve.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="primary"
              size="md"
              icon={<Plus size={16} />}
              onClick={() => setIsCreateModalOpen(true)}
            >
              Buat Target
            </Button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. DREAM SUMMARY HERO AREA                                                */}
        {/* ========================================================================= */}
        <GoalSummary
          totalTarget={summary.totalTarget}
          totalSaved={summary.totalSaved}
          progressPercent={summary.progressPercent}
          activeCount={summary.activeCount}
          completedCount={summary.completedCount}
        />

        {/* ========================================================================= */}
        {/* 3. FEATURED GOAL (HIGHLIGHTED PRIORITY)                                   */}
        {/* ========================================================================= */}
        {featuredGoal && (
          <FeaturedGoal
            goal={featuredGoal}
            onViewDetail={handleSelectGoal}
            onAddContribution={handleContributionTrigger}
          />
        )}

        {/* ========================================================================= */}
        {/* 4. GOAL CARDS SECTION (MY GOALS)                                          */}
        {/* ========================================================================= */}
        <section className="space-y-5">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h2 className="text-lg sm:text-xl font-bold text-[#242636] tracking-tight">
                Daftar Target Saya
              </h2>
              <p className="text-xs text-[#757A95]">
                Pantau seluruh target jangka pendek dan panjang Anda.
              </p>
            </div>

            <span className="text-xs font-bold text-[#757A95] bg-[#F4F3F9] px-3 py-1 rounded-full">
              {filteredGoals.length} Target
            </span>
          </div>

          {/* Filters & Sorting Toolbar */}
          <GoalFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedFilter={selectedFilter}
            onFilterChange={setSelectedFilter}
            selectedSort={selectedSort}
            onSortChange={setSelectedSort}
            totalCount={goals.length}
          />

          {/* Goal Cards Grid */}
          <GoalList
            goals={filteredGoals}
            onSelectGoal={handleSelectGoal}
            onAddContribution={handleContributionTrigger}
            onCreateGoal={() => setIsCreateModalOpen(true)}
            isFiltered={searchQuery.trim().length > 0 || selectedFilter !== 'all'}
          />
        </section>

        {/* ========================================================================= */}
        {/* 5. MODALS SUITE                                                           */}
        {/* ========================================================================= */}

        {/* Modal 1: Buat Target Baru */}
        <CreateGoalModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onCreateGoal={handleCreateGoal}
          wallets={wallets}
        />

        {/* Modal 2: Edit Target */}
        <EditGoalModal
          goal={activeGoal}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onUpdateGoal={handleUpdateGoal}
          wallets={wallets}
        />

        {/* Modal 3: Detail Target */}
        <GoalDetailModal
          goal={activeGoal}
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          onEdit={handleEditTrigger}
          onDelete={handleDeleteTrigger}
          onAddContribution={handleContributionTrigger}
        />

        {/* Modal 4: Konfirmasi Hapus Target */}
        <DeleteGoalDialog
          goal={activeGoal}
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirmDelete={handleDeleteGoal}
        />

        {/* Modal 5: Tambah Tabungan / Setor Dana */}
        <AddContributionModal
          goal={activeGoal}
          isOpen={isContributionModalOpen}
          onClose={() => setIsContributionModalOpen(false)}
          onAddContribution={handleAddContribution}
          wallets={wallets}
        />

        {/* Floating Toast Notification */}
        <TransactionToast
          message={toastMessage}
          onClose={() => setToastMessage(null)}
        />
      </div>
    </PageTransition>
  );
}
