'use client';

import React, { useState, useMemo, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Plus } from 'lucide-react';
import Button from '@/components/ui/Button';
import TransactionToast from '@/components/transactions/TransactionToast';
import { GoalItem, GoalContribution, Wallet } from '@/types';
import { formatIDR } from '@/lib/format';
import { apiClient, mapApiErrorMessage } from '@/lib/api-client';
import { emitRefresh, onRefresh } from '@/lib/data-refresh';

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

function mapBackendGoalToUI(g: any): GoalItem {
  const currentAmount = Number(g.currentAmount);
  const targetAmount = Number(g.targetAmount);
  const isCompleted = currentAmount >= targetAmount;

  return {
    id: g.id,
    title: g.name,
    category: g.category as any,
    targetAmount,
    currentAmount,
    targetDate: g.deadline ? new Date(g.deadline).toISOString().split('T')[0] : '',
    frequency: (String(g.frequency).toLowerCase() === 'weekly' ? 'weekly' : 'monthly') as any,
    monthlySaving: 0,
    autoDeposit: Boolean(g.autoDeposit),
    nextDueDate: g.nextDueDate ? new Date(g.nextDueDate).toISOString().split('T')[0] : undefined,
    sourceWalletId: g.sourceWalletId || '',
    destinationWalletId: g.destinationWalletId || '',
    sourceWalletName: g.sourceWallet?.name || 'Dompet Sumber',
    destinationWalletName: g.destinationWallet?.name || 'Pos Tabungan',
    colorTheme: 'indigo',
    status: isCompleted ? 'completed' : 'on_track',
    notes: g.name,
    createdAt: g.createdAt,
    contributions: (g.contributions || []).map((c: any) => ({
      id: c.id,
      goalId: c.goalId,
      amount: Number(c.amount),
      date: c.contributionDate ? new Date(c.contributionDate).toISOString().split('T')[0] : '',
      time: '12:00',
      sourceWalletId: c.sourceWalletId,
      destinationWalletId: g.destinationWalletId || '',
      sourceWalletName: c.sourceWallet?.name || 'Dompet',
      destinationWalletName: 'Pos Tabungan',
      note: 'Setoran Target',
    })),
  };
}

function GoalsContent() {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [goals, setGoals] = useState<GoalItem[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

  const fetchGoals = useCallback(async () => {
    try {
      setErrorMessage(null);
      const res = await apiClient.get<{ goals: any[] }>('/api/goals');
      const mapped = (res.goals || []).map(mapBackendGoalToUI);
      setGoals(mapped);
    } catch (err) {
      setErrorMessage(mapApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchWallets = useCallback(async () => {
    try {
      const res = await apiClient.get<{ wallets: any[] }>('/api/wallets');
      const mappedWallets = (res.wallets || []).map((w: any) => ({
        id: w.id,
        name: w.name,
        type: (w.type === 'E_WALLET' ? 'ewallet' : w.type === 'CASH' ? 'cash' : 'bank') as any,
        balance: Number(w.balance),
        currency: 'IDR',
        icon: 'Bank',
        colorTheme: 'indigo' as any,
      }));
      setWallets(mappedWallets);
    } catch {
      // Ignore background error
    }
  }, []);

  // Auto-deposit runner: jika ada goal dengan autoDeposit && nextDueDate <= hari ini, auto stor
  const hasRunAutoRef = React.useRef(false);
  useEffect(() => {
    if (hasRunAutoRef.current || isLoading) return;
    const dueGoals = goals.filter((g) => (g as any).autoDeposit && (g as any).nextDueDate && new Date((g as any).nextDueDate) <= new Date() && g.currentAmount < g.targetAmount);
    if (dueGoals.length === 0) return;
    hasRunAutoRef.current = true;
    (async () => {
      for (const g of dueGoals) {
        const remaining = g.targetAmount - g.currentAmount;
        const isWeekly = g.frequency === 'weekly';
        const amount = isWeekly ? Math.ceil((g.monthlySaving || 0) / 4.33) || Math.ceil(remaining / 4) : g.monthlySaving || Math.ceil(remaining / 6);
        const payAmount = Math.min(amount, remaining);
        if (payAmount <= 0) continue;
        try {
          await apiClient.post(`/api/goals/${g.id}/contributions`, { sourceWalletId: g.sourceWalletId, amount: payAmount });
          showToast(`Setoran otomatis ${formatIDR(payAmount)}/${isWeekly ? 'minggu' : 'bulan'} untuk "${g.title}" berhasil.`);
        } catch (e) {
          showToast(mapApiErrorMessage(e));
        }
      }
      fetchGoals();
      fetchWallets();
      hasRunAutoRef.current = false;
    })();
  }, [goals, isLoading]);

  useEffect(() => {
    fetchGoals();
    fetchWallets();
  }, [fetchGoals, fetchWallets]);

  useEffect(() => {
    const isNew = searchParams.get('new') === 'true' || searchParams.get('create') === 'true';
    if (isNew) {
      setIsCreateModalOpen(true);
    }
  }, [searchParams]);

  useEffect(() => {
    const off = onRefresh((kind) => {
      if (kind === 'goal' || kind === 'goal_contribution' || kind === 'wallet' || kind === 'all') {
        fetchGoals();
        fetchWallets();
      }
    });
    return off;
  }, [fetchGoals, fetchWallets]);

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

  const featuredGoal = useMemo(() => {
    if (goals.length === 0) return null;
    return goals[0];
  }, [goals]);

  const filteredGoals = useMemo(() => {
    let result = [...goals];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (g) =>
          g.title.toLowerCase().includes(q) ||
          (g.notes && g.notes.toLowerCase().includes(q))
      );
    }

    if (selectedFilter === 'active') {
      result = result.filter((g) => g.currentAmount < g.targetAmount);
    } else if (selectedFilter === 'completed') {
      result = result.filter((g) => g.currentAmount >= g.targetAmount || g.status === 'completed');
    }

    return result;
  }, [goals, searchQuery, selectedFilter]);

  const handleCreateGoalSubmit = async (newGoal: GoalItem) => {
    try {
      const freq = String(newGoal.frequency).toUpperCase() === 'WEEKLY' ? 'WEEKLY' : 'MONTHLY';
      const res = await apiClient.post<{ goal: any }>('/api/goals', {
        name: newGoal.title,
        category: newGoal.category || 'Lainnya',
        targetAmount: newGoal.targetAmount,
        deadline: newGoal.targetDate ? new Date(newGoal.targetDate).toISOString() : new Date(Date.now() + 86400000 * 180).toISOString(),
        sourceWalletId: newGoal.sourceWalletId || undefined,
        destinationWalletId: newGoal.destinationWalletId || undefined,
        frequency: freq,
        autoDeposit: Boolean((newGoal as any).autoDeposit),
      });

      const createdGoal = res.goal;

      // If user entered initial saving (Dana Saat Ini) > 0, immediately store as first contribution
      if (newGoal.currentAmount > 0 && newGoal.sourceWalletId) {
        try {
          await apiClient.post(`/api/goals/${createdGoal.id}/contributions`, {
            sourceWalletId: newGoal.sourceWalletId,
            amount: newGoal.currentAmount,
          });
        } catch (contribErr) {
          showToast(`${mapApiErrorMessage(contribErr)} — target dibuat namun setoran awal 300k gagal.`);
          fetchGoals();
          fetchWallets();
          return;
        }
      }

      const mapped = mapBackendGoalToUI(createdGoal);
      if (newGoal.currentAmount > 0) {
        showToast(`Target "${mapped.title}" berhasil dibuat dengan setoran awal ${formatIDR(newGoal.currentAmount)}.`);
      } else {
        showToast(`Target "${mapped.title}" berhasil dibuat.`);
      }
      fetchGoals();
      fetchWallets();
      emitRefresh('goal');
      if (newGoal.currentAmount > 0) emitRefresh('goal_contribution');
    } catch (err) {
      showToast(mapApiErrorMessage(err));
    }
  };

  const handleUpdateGoalSubmit = async (updatedGoal: GoalItem) => {
    try {
      const freq = String(updatedGoal.frequency).toUpperCase() === 'WEEKLY' ? 'WEEKLY' : 'MONTHLY';
      const res = await apiClient.patch<{ goal: any }>(`/api/goals/${updatedGoal.id}`, {
        name: updatedGoal.title,
        category: updatedGoal.category,
        targetAmount: updatedGoal.targetAmount,
        deadline: updatedGoal.targetDate ? new Date(updatedGoal.targetDate).toISOString() : undefined,
        frequency: freq,
        sourceWalletId: updatedGoal.sourceWalletId || null,
        destinationWalletId: updatedGoal.destinationWalletId || null,
      });

      const mapped = mapBackendGoalToUI(res.goal);
      setActiveGoal(mapped);
      showToast(`Target "${mapped.title}" berhasil diperbarui.`);
      fetchGoals();
      emitRefresh('goal');
    } catch (err) {
      showToast(mapApiErrorMessage(err));
    }
  };

  const handleDeleteGoalSubmit = async (goalId: string) => {
    try {
      await apiClient.delete(`/api/goals/${goalId}`);
      setIsDetailModalOpen(false);
      showToast('Target berhasil dihapus.');
      fetchGoals();
      emitRefresh('goal');
    } catch (err) {
      showToast(mapApiErrorMessage(err));
    }
  };

  const handleAddContributionSubmit = async (goalId: string, contribution: GoalContribution) => {
    try {
      await apiClient.post(`/api/goals/${goalId}/contributions`, {
        sourceWalletId: contribution.sourceWalletId,
        amount: contribution.amount,
      });

      showToast('Tabungan berhasil ditambahkan.');
      fetchGoals();
      fetchWallets();
      emitRefresh('goal_contribution');
      if (activeGoal && activeGoal.id === goalId) {
        const refreshed = await apiClient.get<{ goal: any }>(`/api/goals/${goalId}`);
        if (refreshed.goal) {
          setActiveGoal(mapBackendGoalToUI(refreshed.goal));
        }
      }
    } catch (err) {
      showToast(mapApiErrorMessage(err));
    }
  };

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
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-red-50 text-red-600 border border-red-200 text-xs font-semibold">
            {errorMessage}
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#242636] tracking-tight">
              Target Impian
            </h1>
            <p className="text-xs sm:text-sm text-[#757A95] mt-0.5">
              Wujudkan rencana dan impian finansial Anda menjadi kenyataan.
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

        <GoalSummary
          totalTarget={summary.totalTarget}
          totalSaved={summary.totalSaved}
          progressPercent={summary.progressPercent}
          activeCount={summary.activeCount}
          completedCount={summary.completedCount}
        />

        {featuredGoal && (
          <FeaturedGoal
            goal={featuredGoal}
            onViewDetail={handleSelectGoal}
            onAddContribution={handleContributionTrigger}
          />
        )}

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

          <GoalFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedFilter={selectedFilter}
            onFilterChange={setSelectedFilter}
            selectedSort={selectedSort}
            onSortChange={setSelectedSort}
            totalCount={goals.length}
          />

          <GoalList
            goals={filteredGoals}
            onSelectGoal={handleSelectGoal}
            onAddContribution={handleContributionTrigger}
            onCreateGoal={() => setIsCreateModalOpen(true)}
            isFiltered={searchQuery.trim().length > 0 || selectedFilter !== 'all'}
          />
        </section>

        <CreateGoalModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onCreateGoal={handleCreateGoalSubmit}
          wallets={wallets}
        />

        <EditGoalModal
          goal={activeGoal}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onUpdateGoal={handleUpdateGoalSubmit}
          wallets={wallets}
        />

        <GoalDetailModal
          goal={activeGoal}
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          onEdit={handleEditTrigger}
          onDelete={handleDeleteTrigger}
          onAddContribution={handleContributionTrigger}
        />

        <DeleteGoalDialog
          goal={activeGoal}
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirmDelete={handleDeleteGoalSubmit}
        />

        <AddContributionModal
          goal={activeGoal}
          isOpen={isContributionModalOpen}
          onClose={() => setIsContributionModalOpen(false)}
          onAddContribution={handleAddContributionSubmit}
          wallets={wallets}
        />

        <TransactionToast
          message={toastMessage}
          onClose={() => setToastMessage(null)}
        />
      </div>
    </PageTransition>
  );
}

export default function GoalsPage() {
  return (
    <Suspense fallback={<GoalsSkeleton />}>
      <GoalsContent />
    </Suspense>
  );
}

