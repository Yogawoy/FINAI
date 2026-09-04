'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PieChart,
  Plus,
  ChevronDown,
  Calendar,
  Check,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { BudgetCategory } from '@/types';
import { formatIDR } from '@/lib/format';
import { apiClient, mapApiErrorMessage } from '@/lib/api-client';
import { emitRefresh, onRefresh } from '@/lib/data-refresh';

// Loading & Page Transition
import BudgetsSkeleton from '@/components/loading/BudgetsSkeleton';
import PageTransition from '@/components/loading/PageTransition';

// Modular Subcomponents & 6 Visual Modals
import BudgetOverview from '@/components/budgets/BudgetOverview';
import BudgetInsight from '@/components/budgets/BudgetInsight';
import BudgetFilters, { BudgetFilterType } from '@/components/budgets/BudgetFilters';
import BudgetList from '@/components/budgets/BudgetList';
import CreateBudgetModal from '@/components/budgets/CreateBudgetModal';
import EditBudgetModal from '@/components/budgets/EditBudgetModal';
import DeleteBudgetDialog from '@/components/budgets/DeleteBudgetDialog';
import BudgetDetailModal from '@/components/budgets/BudgetDetailModal';
import BudgetSuccessModal from '@/components/budgets/BudgetSuccessModal';
import DuplicateBudgetModal from '@/components/budgets/DuplicateBudgetModal';
import TransactionToast from '@/components/transactions/TransactionToast';
import { computeBudgetHealth } from '@/components/budgets/BudgetHealth';

function getMonthOptions(): string[] {
  const now = new Date();
  const fmt = (d: Date) => d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }).replace(/^\w/, (c) => c.toUpperCase());
  const months: string[] = [];
  for (let offset = -1; offset <= 2; offset++) {
    const d = new Date(now.getFullYear(), now.getMonth() + offset, 1);
    months.push(fmt(d));
  }
  return months;
}
const MONTH_OPTIONS = getMonthOptions();

function mapBackendBudgetToUI(b: any): BudgetCategory {
  return {
    id: b.id,
    name: b.category,
    category: b.category as any,
    limit: Number(b.limitAmount),
    spent: Number(b.usedAmount || 0),
    period: 'monthly',
    color: '#7C7CE6',
    icon: 'PieChart',
    iconName: 'PieChart',
    status: 'safe',
  };
}

export default function BudgetsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [budgets, setBudgets] = useState<BudgetCategory[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 2. Selected Month & Dropdown State — mengikuti bulan hari ini
  const getCurrentMonthLabel = () => new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }).replace(/^\w/, (c) => c.toUpperCase());
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthLabel());
  const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState(false);

  // 3. Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<BudgetFilterType>('all');

  // 4. Modal States for All 6 Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);

  const [activeBudget, setActiveBudget] = useState<BudgetCategory | null>(null);
  const [lastCreatedBudget, setLastCreatedBudget] = useState<BudgetCategory | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  const [categoryTransactions, setCategoryTransactions] = useState<any[]>([]);

  const fetchBudgets = useCallback(async () => {
    try {
      setErrorMessage(null);
      const res = await apiClient.get<{ budgets: any[] }>('/api/budgets');
      const mapped = (res.budgets || []).map(mapBackendBudgetToUI);
      setBudgets(mapped);
    } catch (err) {
      setErrorMessage(mapApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchCategoryTransactions = useCallback(async () => {
    try {
      const res = await apiClient.get<{ transactions: any[] }>('/api/transactions?limit=100');
      setCategoryTransactions(res.transactions || []);
    } catch {
      // Ignore
    }
  }, []);

  useEffect(() => {
    fetchBudgets();
    fetchCategoryTransactions();
  }, [fetchBudgets, fetchCategoryTransactions]);

  useEffect(() => {
    const off = onRefresh((kind) => {
      if (kind === 'budget' || kind === 'transaction' || kind === 'all') {
        fetchBudgets();
        fetchCategoryTransactions();
      }
    });
    return off;
  }, [fetchBudgets, fetchCategoryTransactions]);

  const totalBudget = useMemo(() => {
    return budgets.reduce((acc, curr) => acc + curr.limit, 0);
  }, [budgets]);

  const totalSpent = useMemo(() => {
    return budgets.reduce((acc, curr) => acc + curr.spent, 0);
  }, [budgets]);

  const remaining = totalBudget - totalSpent;
  const overallPercentage = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;
  const overallHealth = computeBudgetHealth(overallPercentage);

  const filteredBudgets = useMemo(() => {
    return budgets.filter((b) => {
      const matchesSearch =
        b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.category.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;
      if (selectedFilter === 'all') return true;

      const pct = b.limit > 0 ? Math.round((b.spent / b.limit) * 100) : 0;
      const health = computeBudgetHealth(pct);
      return health === selectedFilter;
    });
  }, [budgets, searchQuery, selectedFilter]);

  const filterCounts = useMemo(() => {
    let onTrack = 0;
    let almostThere = 0;
    let overBudget = 0;

    budgets.forEach((b) => {
      const pct = b.limit > 0 ? Math.round((b.spent / b.limit) * 100) : 0;
      const h = computeBudgetHealth(pct);
      if (h === 'on_track') onTrack++;
      else if (h === 'almost_there') almostThere++;
      else if (h === 'over_budget') overBudget++;
    });

    return {
      all: budgets.length,
      on_track: onTrack,
      almost_there: almostThere,
      over_budget: overBudget,
    };
  }, [budgets]);

  const handleCreateBudgetSubmit = async (newBudget: BudgetCategory) => {
    try {
      const now = new Date();
      const res = await apiClient.post<{ budget: any }>('/api/budgets', {
        category: newBudget.category || newBudget.name,
        limitAmount: newBudget.limit,
        month: now.getMonth() + 1,
        year: now.getFullYear(),
      });

      const mapped = mapBackendBudgetToUI(res.budget);
      setLastCreatedBudget(mapped);
      setIsSuccessModalOpen(true);
      showToast(`Anggaran "${mapped.name}" (${formatIDR(mapped.limit)}) berhasil dibuat.`);
      fetchBudgets();
      emitRefresh('budget');
    } catch (err) {
      showToast(mapApiErrorMessage(err));
    }
  };

  const handleUpdateBudgetSubmit = async (updated: BudgetCategory) => {
    try {
      const res = await apiClient.patch<{ budget: any }>(`/api/budgets/${updated.id}`, {
        limitAmount: updated.limit,
      });

      const mapped = mapBackendBudgetToUI(res.budget);
      if (activeBudget && activeBudget.id === mapped.id) {
        setActiveBudget(mapped);
      }
      showToast(`Anggaran "${mapped.name}" berhasil diperbarui.`);
      fetchBudgets();
      emitRefresh('budget');
    } catch (err) {
      showToast(mapApiErrorMessage(err));
    }
  };

  const handleDeleteBudgetSubmit = async (budgetId: string) => {
    try {
      await apiClient.delete(`/api/budgets/${budgetId}`);
      if (activeBudget && activeBudget.id === budgetId) {
        setActiveBudget(null);
      }
      showToast('Anggaran telah dihapus.');
      fetchBudgets();
      emitRefresh('budget');
    } catch (err) {
      showToast(mapApiErrorMessage(err));
    }
  };

  const handleDuplicateBudgetSubmit = async (newBudget: BudgetCategory) => {
    try {
      const now = new Date();
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      const res = await apiClient.post<{ budget: any }>('/api/budgets', {
        category: newBudget.category || newBudget.name,
        limitAmount: newBudget.limit,
        month: nextMonth.getMonth() + 1,
        year: nextMonth.getFullYear(),
      });

      const mapped = mapBackendBudgetToUI(res.budget);
      setLastCreatedBudget(mapped);
      setIsSuccessModalOpen(true);
      showToast(`Anggaran "${mapped.name}" berhasil diduplikasi.`);
      fetchBudgets();
      emitRefresh('budget');
    } catch (err) {
      showToast(mapApiErrorMessage(err));
    }
  };

  const handleSelectBudget = (budget: BudgetCategory) => {
    setActiveBudget(budget);
    setIsDetailModalOpen(true);
  };

  const handleEditTrigger = (budget: BudgetCategory) => {
    setIsDetailModalOpen(false);
    setActiveBudget(budget);
    setIsEditModalOpen(true);
  };

  const handleDeleteTrigger = (budget: BudgetCategory) => {
    setIsDetailModalOpen(false);
    setActiveBudget(budget);
    setIsDeleteDialogOpen(true);
  };

  const handleDuplicateTrigger = (budget: BudgetCategory) => {
    setIsDetailModalOpen(false);
    setActiveBudget(budget);
    setIsDuplicateModalOpen(true);
  };

  if (isLoading) {
    return <BudgetsSkeleton />;
  }

  return (
    <PageTransition>
      <div className="space-y-7 max-w-7xl mx-auto pb-16">
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-red-50 text-red-600 border border-red-200 text-xs font-semibold">
            {errorMessage}
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#242636] tracking-tight">
              Anggaran
            </h1>
            <p className="text-xs sm:text-sm text-[#757A95] mt-0.5 font-medium">
              Rencanakan pengeluaran sebelum Anda berbelanja.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsMonthDropdownOpen(!isMonthDropdownOpen)}
                className="px-3.5 py-2.5 rounded-2xl bg-white hover:bg-[#F8F9FD] text-[#242636] border border-black/[0.06] shadow-2xs text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer"
              >
                <Calendar size={15} className="text-[#7C7CE6]" />
                <span>{selectedMonth}</span>
                <ChevronDown
                  size={14}
                  className={`text-[#757A95] transition-transform duration-200 ${
                    isMonthDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              <AnimatePresence>
                {isMonthDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-20"
                      onClick={() => setIsMonthDropdownOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-48 rounded-2xl bg-white border border-black/[0.08] shadow-[0_12px_36px_rgba(48,51,74,0.12)] p-1.5 z-30 space-y-0.5"
                    >
                      {MONTH_OPTIONS.map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => {
                            setSelectedMonth(m);
                            setIsMonthDropdownOpen(false);
                          }}
                          className={`w-full px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                            selectedMonth === m
                              ? 'bg-[#E4E2FB] text-[#7C7CE6]'
                              : 'text-[#242636] hover:bg-[#F8F9FD]'
                          }`}
                        >
                          <span>{m}</span>
                          {selectedMonth === m && <Check size={14} className="text-[#7C7CE6]" />}
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            <Button
              type="button"
              variant="primary"
              size="md"
              icon={<Plus size={16} />}
              onClick={() => setIsCreateModalOpen(true)}
            >
              Buat Anggaran
            </Button>
          </div>
        </div>

        <BudgetOverview
          monthLabel={selectedMonth}
          totalBudget={totalBudget}
          totalSpent={totalSpent}
          remaining={remaining}
          percentage={overallPercentage}
          healthStatus={overallHealth}
          onQuickCreate={() => setIsCreateModalOpen(true)}
        />

        <BudgetInsight
          insightText="Dengan pola belanja saat ini, Anda berpotensi menghemat Rp420.000 pada pos Makanan & Minuman bulan ini."
          category="Makanan & Minuman"
          dailySafeSpend={51600}
          onExplore={() => {
            const foodBudget = budgets.find((b) => b.category === 'food');
            if (foodBudget) handleSelectBudget(foodBudget);
          }}
        />

        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div>
              <h2 className="text-lg font-bold text-[#242636] tracking-tight">
                Pos Anggaran Kategori
              </h2>
              <p className="text-xs text-[#757A95]">
                Klik pos anggaran mana pun untuk melihat rincian batas dan status.
              </p>
            </div>
            <span className="text-xs font-semibold text-[#757A95]">
              {filteredBudgets.length} Kategori Terpasang
            </span>
          </div>

          <BudgetFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedFilter={selectedFilter}
            onFilterChange={setSelectedFilter}
            counts={filterCounts}
          />

          <BudgetList
            budgets={filteredBudgets}
            searchQuery={searchQuery}
            onSelectBudget={handleSelectBudget}
            onEditBudget={handleEditTrigger}
            onDeleteBudget={handleDeleteTrigger}
            onDuplicateBudget={handleDuplicateTrigger}
            onCreateBudget={() => setIsCreateModalOpen(true)}
          />
        </section>

        <CreateBudgetModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onCreateBudget={handleCreateBudgetSubmit}
        />

        <EditBudgetModal
          budget={activeBudget}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onUpdateBudget={handleUpdateBudgetSubmit}
        />

        <BudgetDetailModal
          budget={activeBudget}
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          onEdit={handleEditTrigger}
          onDelete={handleDeleteTrigger}
          onDuplicate={handleDuplicateTrigger}
          transactions={categoryTransactions}
        />

        <DeleteBudgetDialog
          budget={activeBudget}
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirmDelete={handleDeleteBudgetSubmit}
        />

        <BudgetSuccessModal
          budget={lastCreatedBudget}
          isOpen={isSuccessModalOpen}
          onClose={() => setIsSuccessModalOpen(false)}
          onCreateAnother={() => setIsCreateModalOpen(true)}
        />

        <DuplicateBudgetModal
          sourceBudget={activeBudget}
          isOpen={isDuplicateModalOpen}
          onClose={() => setIsDuplicateModalOpen(false)}
          onDuplicateBudget={handleDuplicateBudgetSubmit}
        />

        <TransactionToast
          message={toastMessage}
          onClose={() => setToastMessage(null)}
        />
      </div>
    </PageTransition>
  );
}
