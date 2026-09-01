'use client';

import React, { useState, useMemo } from 'react';
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
import { MOCK_BUDGETS, formatIDR } from '@/data/mockData';

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

const MONTH_OPTIONS = [
  'Juli 2026',
  'Agustus 2026',
  'September 2026',
  'Oktober 2026',
];

export default function BudgetsPage() {
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 450);
    return () => clearTimeout(timer);
  }, []);

  // 1. Budgets Local State (Initialized with 6 realistic categories)
  const [budgets, setBudgets] = useState<BudgetCategory[]>(MOCK_BUDGETS);

  // 2. Selected Month & Dropdown State
  const [selectedMonth, setSelectedMonth] = useState('Agustus 2026');
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

  // 5. Toast Message State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // 6. Dynamic Computations for Overview
  const totalBudget = useMemo(() => {
    return budgets.reduce((acc, curr) => acc + curr.limit, 0);
  }, [budgets]);

  const totalSpent = useMemo(() => {
    return budgets.reduce((acc, curr) => acc + curr.spent, 0);
  }, [budgets]);

  const remaining = totalBudget - totalSpent;
  const overallPercentage = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;
  const overallHealth = computeBudgetHealth(overallPercentage);

  // 7. Filtered Budgets List
  const filteredBudgets = useMemo(() => {
    return budgets.filter((b) => {
      // Search matching
      const matchesSearch =
        b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.category.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      // Filter category matching
      if (selectedFilter === 'all') return true;

      const pct = b.limit > 0 ? Math.round((b.spent / b.limit) * 100) : 0;
      const health = computeBudgetHealth(pct);
      return health === selectedFilter;
    });
  }, [budgets, searchQuery, selectedFilter]);

  // Counts for filter tabs
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

  // Handlers for 6 Modal Operations
  const handleCreateBudget = (newBudget: BudgetCategory) => {
    setBudgets((prev) => [newBudget, ...prev]);
    setLastCreatedBudget(newBudget);
    setIsSuccessModalOpen(true);
    showToast(`Anggaran "${newBudget.name}" (${formatIDR(newBudget.limit)}) berhasil dibuat.`);
  };

  const handleUpdateBudget = (updated: BudgetCategory) => {
    setBudgets((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
    if (activeBudget && activeBudget.id === updated.id) {
      setActiveBudget(updated);
    }
    showToast(`Anggaran "${updated.name}" berhasil diperbarui.`);
  };

  const handleDeleteBudget = (budgetId: string) => {
    const toDelete = budgets.find((b) => b.id === budgetId);
    setBudgets((prev) => prev.filter((b) => b.id !== budgetId));
    if (activeBudget && activeBudget.id === budgetId) {
      setActiveBudget(null);
    }
    showToast(`Anggaran "${toDelete?.name || 'Item'}" telah dihapus.`);
  };

  const handleDuplicateBudget = (newBudget: BudgetCategory) => {
    setBudgets((prev) => [newBudget, ...prev]);
    setLastCreatedBudget(newBudget);
    setIsSuccessModalOpen(true);
    showToast(`Anggaran "${newBudget.name}" berhasil diduplikasi.`);
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
        {/* ========================================================================= */}
        {/* 1. PAGE HEADER                                                            */}
        {/* ========================================================================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#242636] tracking-tight">
              Anggaran
            </h1>
            <p className="text-xs sm:text-sm text-[#757A95] mt-0.5 font-medium">
              Rencanakan pengeluaran sebelum Anda berbelanja.
            </p>
          </div>

          {/* Date Selector & Create Budget Action */}
          <div className="flex items-center gap-2.5">
            {/* Month Selector Dropdown */}
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

              {/* Dropdown Menu */}
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

            {/* Create Budget Button */}
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

        {/* ========================================================================= */}
        {/* 2. OVERVIEW CARD & SMART HEALTH METER                                     */}
        {/* ========================================================================= */}
        <BudgetOverview
          monthLabel={selectedMonth}
          totalBudget={totalBudget}
          totalSpent={totalSpent}
          remaining={remaining}
          percentage={overallPercentage}
          healthStatus={overallHealth}
          onQuickCreate={() => setIsCreateModalOpen(true)}
        />

        {/* ========================================================================= */}
        {/* 3. FINAI BUDGET INSIGHT BANNER                                            */}
        {/* ========================================================================= */}
        <BudgetInsight
          insightText="Dengan pola belanja saat ini, Anda berpotensi menghemat Rp420.000 pada pos Makanan & Minuman bulan ini."
          category="Makanan & Minuman"
          dailySafeSpend={51600}
          onExplore={() => {
            const foodBudget = budgets.find((b) => b.category === 'food');
            if (foodBudget) handleSelectBudget(foodBudget);
          }}
        />

        {/* ========================================================================= */}
        {/* 4. BUDGETS LIST SECTION & CONTROLS                                        */}
        {/* ========================================================================= */}
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

          {/* Search & Filter Toolbar */}
          <BudgetFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedFilter={selectedFilter}
            onFilterChange={setSelectedFilter}
            counts={filterCounts}
          />

          {/* Budget Categories Grid */}
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

        {/* ========================================================================= */}
        {/* 5. ALL 6 MODALS SUITE                                                     */}
        {/* ========================================================================= */}

        {/* Modal 1: Buat Anggaran Baru */}
        <CreateBudgetModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onCreateBudget={handleCreateBudget}
        />

        {/* Modal 2: Edit Anggaran */}
        <EditBudgetModal
          budget={activeBudget}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onUpdateBudget={handleUpdateBudget}
        />

        {/* Modal 3: Detail Anggaran */}
        <BudgetDetailModal
          budget={activeBudget}
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          onEdit={handleEditTrigger}
          onDelete={handleDeleteTrigger}
          onDuplicate={handleDuplicateTrigger}
        />

        {/* Modal 4: Konfirmasi Hapus Anggaran */}
        <DeleteBudgetDialog
          budget={activeBudget}
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirmDelete={handleDeleteBudget}
        />

        {/* Modal 5: Anggaran Dibuat Success Modal */}
        <BudgetSuccessModal
          budget={lastCreatedBudget}
          isOpen={isSuccessModalOpen}
          onClose={() => setIsSuccessModalOpen(false)}
          onCreateAnother={() => setIsCreateModalOpen(true)}
        />

        {/* Modal 6: Duplikat Anggaran Modal */}
        <DuplicateBudgetModal
          sourceBudget={activeBudget}
          isOpen={isDuplicateModalOpen}
          onClose={() => setIsDuplicateModalOpen(false)}
          onDuplicateBudget={handleDuplicateBudget}
        />

        {/* Toast Floating Notification */}
        <TransactionToast
          message={toastMessage}
          onClose={() => setToastMessage(null)}
        />
      </div>
    </PageTransition>
  );
}
