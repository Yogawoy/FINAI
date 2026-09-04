'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Plus } from 'lucide-react';
import Button from '@/components/ui/Button';
import { Transaction, TransactionType } from '@/types';
import { apiClient, mapApiErrorMessage } from '@/lib/api-client';
import { emitRefresh, onRefresh } from '@/lib/data-refresh';

// Loading & Page Transition
import TransactionsSkeleton from '@/components/loading/TransactionsSkeleton';
import PageTransition from '@/components/loading/PageTransition';

// Subkomponen Modular
import TransactionSummary from '@/components/transactions/TransactionSummary';
import TransactionFilters, { DateFilterType } from '@/components/transactions/TransactionFilters';
import AITransactionBanner from '@/components/transactions/AITransactionBanner';
import TransactionList from '@/components/transactions/TransactionList';
import TransactionDetail from '@/components/transactions/TransactionDetail';
import AddTransactionModal from '@/components/transactions/AddTransactionModal';
import EditTransactionModal from '@/components/transactions/EditTransactionModal';
import DeleteTransactionDialog from '@/components/transactions/DeleteTransactionDialog';
import FilterTransactionsModal from '@/components/transactions/FilterTransactionsModal';
import TransactionSuccessModal from '@/components/transactions/TransactionSuccessModal';
import TransactionToast from '@/components/transactions/TransactionToast';
import AITransactionPrompt from '@/components/transactions/AITransactionPrompt';

// Helper to map DB transaction to UI Transaction
function mapBackendTransactionToUI(tx: any): Transaction {
  const isIncome = String(tx.type).toUpperCase() === 'INCOME';
  const type: TransactionType = isIncome ? 'income' : 'expense';
  const rawDate = tx.transactionDate ? new Date(tx.transactionDate) : new Date();
  const dateStr = rawDate.toISOString().split('T')[0];
  const timeStr = rawDate.toTimeString().slice(0, 5);

  return {
    id: tx.id,
    type,
    amount: Number(tx.amount),
    category: tx.category as any,
    title: tx.description,
    date: dateStr,
    time: timeStr,
    account: tx.wallet?.name || 'Dompet Utama',
    paymentMethod: tx.wallet?.type || 'Bank',
    status: 'completed',
    note: tx.description,
    walletId: tx.walletId || tx.wallet?.id || undefined,
    walletName: tx.wallet?.name || undefined,
  };
}

export default function TransactionsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [wallets, setWallets] = useState<any[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 2. State Filter & Pencarian
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | TransactionType>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDateFilter, setSelectedDateFilter] = useState<DateFilterType>('all');

  // 3. State Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successActionType, setSuccessActionType] = useState<'added' | 'updated'>('added');
  const [lastAffectedTransaction, setLastAffectedTransaction] = useState<Transaction | null>(null);

  // AI Modal State
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [initialAIPrompt, setInitialAIPrompt] = useState<string | undefined>(undefined);

  // 4. Transaksi yang sedang aktif untuk Detail/Edit/Hapus
  const [activeTransaction, setActiveTransaction] = useState<Transaction | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  const fetchWallets = useCallback(async () => {
    try {
      const res = await apiClient.get<{ wallets: any[] }>('/api/wallets');
      setWallets(res.wallets || []);
    } catch {
      // Ignore
    }
  }, []);

  const fetchTransactions = useCallback(async () => {
    try {
      setErrorMessage(null);
      const res = await apiClient.get<{ transactions: any[] }>('/api/transactions?limit=100');
      const mapped = (res.transactions || []).map(mapBackendTransactionToUI);
      setTransactions(mapped);
    } catch (err) {
      setErrorMessage(mapApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
    fetchWallets();
  }, [fetchTransactions, fetchWallets]);

  useEffect(() => {
    const off = onRefresh((kind) => {
      if (kind === 'transaction' || kind === 'transfer' || kind === 'wallet' || kind === 'goal_contribution' || kind === 'all') fetchTransactions();
    });
    return off;
  }, [fetchTransactions]);

  const summary = useMemo(() => {
    const totalIncome = transactions
      .filter((t) => t.type === 'income')
      .reduce((acc, curr) => acc + curr.amount, 0);
    const totalExpenses = transactions
      .filter((t) => t.type === 'expense')
      .reduce((acc, curr) => acc + curr.amount, 0);
    const net = totalIncome - totalExpenses;
    const avgDaily = Math.round(totalExpenses / 30);

    return {
      income: totalIncome,
      expenses: totalExpenses,
      net: net,
      avgDaily: avgDaily,
    };
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    const now = new Date();
    return transactions.filter((tx) => {
      if (selectedType !== 'all' && tx.type !== selectedType) {
        return false;
      }
      if (selectedCategory !== 'all' && tx.category !== selectedCategory) {
        return false;
      }
      if (selectedDateFilter !== 'all') {
        const txDate = new Date(tx.date);
        if (selectedDateFilter === 'today') {
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          if (txDate < today) return false;
        } else if (selectedDateFilter === 'week') {
          const weekAgo = new Date(now);
          weekAgo.setDate(weekAgo.getDate() - 7);
          if (txDate < weekAgo) return false;
        } else if (selectedDateFilter === 'month') {
          const monthAgo = new Date(now);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          if (txDate < monthAgo) return false;
        }
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = tx.title.toLowerCase().includes(query);
        const matchCategory = tx.category.toLowerCase().includes(query);
        const matchAmount = tx.amount.toString().includes(query);

        if (!matchTitle && !matchCategory && !matchAmount) {
          return false;
        }
      }
      return true;
    });
  }, [transactions, selectedType, selectedCategory, searchQuery, selectedDateFilter]);

  const walletOptions = useMemo(() => {
    return wallets.map((w: any) => ({
      id: w.id,
      name: w.name,
      identifier: w.accountLast4 ? `•••• ${w.accountLast4}` : w.institution || w.type,
      iconType: String(w.type).toUpperCase() === 'E_WALLET' ? 'ewallet' as const : String(w.type).toUpperCase() === 'CASH' ? 'cash' as const : 'bank' as const,
    }));
  }, [wallets]);

  const hasActiveFilters =
    searchQuery !== '' ||
    selectedType !== 'all' ||
    selectedCategory !== 'all' ||
    selectedDateFilter !== 'all';

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedType('all');
    setSelectedCategory('all');
    setSelectedDateFilter('all');
  };

  const handleOpenAIWithPrompt = (prompt?: string) => {
    setInitialAIPrompt(prompt);
    setIsAIModalOpen(true);
  };

  const handleAddTransactionSubmit = async (newTx: any) => {
    try {
      const walletId = newTx.walletId;
      if (!walletId) {
        if (wallets.length === 0) {
          showToast('Silakan buat dompet terlebih dahulu sebelum menambah transaksi');
          return;
        }
        showToast('Pilih dompet terlebih dahulu');
        return;
      }

      const created = await apiClient.post<{ transaction: any }>('/api/transactions', {
        walletId,
        type: newTx.type === 'income' ? 'INCOME' : 'EXPENSE',
        amount: Number(newTx.amount),
        category: newTx.category || 'Lainnya',
        description: newTx.title || 'Transaksi Baru',
      });

      const mapped = mapBackendTransactionToUI(created.transaction);
      setLastAffectedTransaction(mapped);
      setSuccessActionType('added');
      setIsSuccessModalOpen(true);
      showToast('Transaksi berhasil ditambahkan.');
      fetchTransactions();
      emitRefresh('transaction');
    } catch (err) {
      showToast(mapApiErrorMessage(err));
    }
  };

  const handleUpdateTransactionSubmit = async (updatedTx: any) => {
    try {
      const res = await apiClient.patch<{ transaction: any }>(`/api/transactions/${updatedTx.id}`, {
        amount: Number(updatedTx.amount),
        category: updatedTx.category,
        description: updatedTx.title,
        type: updatedTx.type === 'income' ? 'INCOME' : 'EXPENSE',
      });

      const mapped = mapBackendTransactionToUI(res.transaction);
      setLastAffectedTransaction(mapped);
      setSuccessActionType('updated');
      setIsSuccessModalOpen(true);
      showToast('Transaksi berhasil diperbarui.');
      fetchTransactions();
      emitRefresh('transaction');
    } catch (err) {
      showToast(mapApiErrorMessage(err));
    }
  };

  const handleDeleteTransactionSubmit = async (txId: string) => {
    try {
      await apiClient.delete(`/api/transactions/${txId}`);
      showToast('Transaksi berhasil dihapus.');
      fetchTransactions();
      emitRefresh('transaction');
    } catch (err) {
      showToast(mapApiErrorMessage(err));
    }
  };

  const handleSelectRow = (tx: Transaction) => {
    setActiveTransaction(tx);
    setIsDetailModalOpen(true);
  };

  const handleEditRow = (tx: Transaction, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveTransaction(tx);
    setIsEditModalOpen(true);
  };

  const handleDeleteRow = (tx: Transaction, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveTransaction(tx);
    setIsDeleteDialogOpen(true);
  };

  if (isLoading) {
    return <TransactionsSkeleton />;
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
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#242636] tracking-tight">
              Transaksi
            </h1>
            <p className="text-xs sm:text-sm text-[#757A95] mt-0.5">
              Pantau dan kelola seluruh arus pemasukan dan pengeluaran Anda.
            </p>
          </div>

          <Button
            type="button"
            variant="primary"
            size="md"
            icon={<Plus size={16} />}
            onClick={() => setIsAddModalOpen(true)}
          >
            Tambah Transaksi
          </Button>
        </div>

        <TransactionSummary
          income={summary.income}
          expenses={summary.expenses}
          net={summary.net}
          avgDaily={summary.avgDaily}
        />

        <TransactionFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedType={selectedType}
          onTypeChange={setSelectedType}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          selectedDateFilter={selectedDateFilter}
          onDateFilterChange={setSelectedDateFilter}
          onOpenFilterModal={() => setIsFilterModalOpen(true)}
          onResetFilters={handleResetFilters}
          hasActiveFilters={hasActiveFilters}
        />

        <AITransactionBanner onOpenAI={handleOpenAIWithPrompt} />

        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#757A95]">
              Buku Kas Mutasi
            </span>
            <span className="text-xs font-semibold text-[#757A95]">
              Menampilkan {filteredTransactions.length} dari {transactions.length} catatan transaksi
            </span>
          </div>

          <TransactionList
            transactions={filteredTransactions}
            onSelectTransaction={handleSelectRow}
            onEditTransaction={handleEditRow}
            onDeleteTransaction={handleDeleteRow}
            onResetFilters={handleResetFilters}
          />
        </section>

        <AddTransactionModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAddTransaction={handleAddTransactionSubmit}
          wallets={walletOptions}
        />

        <EditTransactionModal
          transaction={activeTransaction}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onUpdateTransaction={handleUpdateTransactionSubmit}
          wallets={walletOptions}
        />

        <TransactionDetail
          transaction={activeTransaction}
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          onEdit={(tx) => {
            setIsDetailModalOpen(false);
            setActiveTransaction(tx);
            setIsEditModalOpen(true);
          }}
          onDelete={(tx) => {
            setIsDetailModalOpen(false);
            setActiveTransaction(tx);
            setIsDeleteDialogOpen(true);
          }}
        />

        <DeleteTransactionDialog
          transaction={activeTransaction}
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirmDelete={handleDeleteTransactionSubmit}
        />

        <FilterTransactionsModal
          isOpen={isFilterModalOpen}
          onClose={() => setIsFilterModalOpen(false)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedType={selectedType}
          onTypeChange={setSelectedType}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          selectedDateFilter={selectedDateFilter}
          onDateFilterChange={setSelectedDateFilter}
          onResetFilters={handleResetFilters}
        />

        <TransactionSuccessModal
          transaction={lastAffectedTransaction}
          isOpen={isSuccessModalOpen}
          onClose={() => setIsSuccessModalOpen(false)}
          onViewTransaction={(tx) => {
            setIsSuccessModalOpen(false);
            setActiveTransaction(tx);
            setIsDetailModalOpen(true);
          }}
          actionType={successActionType}
        />

        <AITransactionPrompt
          isOpen={isAIModalOpen}
          onClose={() => {
            setIsAIModalOpen(false);
            setInitialAIPrompt(undefined);
          }}
          initialPrompt={initialAIPrompt}
        />

        <TransactionToast
          message={toastMessage}
          onClose={() => setToastMessage(null)}
        />
      </div>
    </PageTransition>
  );
}
