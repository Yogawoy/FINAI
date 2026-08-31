'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import Header from '@/components/navigation/Header';
import Button from '@/components/ui/Button';
import { Transaction, TransactionCategory, TransactionType } from '@/types';
import { MOCK_TRANSACTIONS } from '@/data/mockData';

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

export default function TransactionsPage() {
  // 1. Data mutasi transaksi (25 catatan realistis)
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);

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

  // 5. Notifikasi Toast Mengambang
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // 6. Kalkulasi Ringkasan Dinamis
  const summary = useMemo(() => {
    const augustTx = transactions.filter((t) => t.date.startsWith('2026-08') || t.date.startsWith('2026-09'));
    const totalIncome = augustTx
      .filter((t) => t.type === 'income')
      .reduce((acc, curr) => acc + curr.amount, 0);
    const totalExpenses = augustTx
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

  // 7. Logika Pemfilteran & Pencarian Cepat
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Filter tipe (Semua / Pengeluaran / Pemasukan)
      if (selectedType !== 'all' && tx.type !== selectedType) {
        return false;
      }

      // Filter kategori
      if (selectedCategory !== 'all' && tx.category !== selectedCategory) {
        return false;
      }

      // Filter rentang tanggal
      if (selectedDateFilter === 'today' && tx.date !== '2026-08-31') {
        return false;
      }
      if (selectedDateFilter === 'week' && tx.date < '2026-08-24') {
        return false;
      }
      if (selectedDateFilter === 'month' && !tx.date.startsWith('2026-08')) {
        return false;
      }

      // Kata kunci pencarian
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = tx.title.toLowerCase().includes(query);
        const matchCategory = tx.category.toLowerCase().includes(query);
        const matchNote = tx.note ? tx.note.toLowerCase().includes(query) : false;
        const matchAccount = tx.account ? tx.account.toLowerCase().includes(query) : false;
        const matchPayment = tx.paymentMethod ? tx.paymentMethod.toLowerCase().includes(query) : false;
        const matchAmount = tx.amount.toString().includes(query);

        if (!matchTitle && !matchCategory && !matchNote && !matchAccount && !matchPayment && !matchAmount) {
          return false;
        }
      }

      return true;
    });
  }, [transactions, selectedType, selectedCategory, selectedDateFilter, searchQuery]);

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

  // 8. Operasi CRUD
  const handleAddTransaction = (newTx: Transaction) => {
    setTransactions((prev) => [newTx, ...prev]);
    setLastAffectedTransaction(newTx);
    setSuccessActionType('added');
    setIsSuccessModalOpen(true);
    showToast('Transaksi berhasil ditambahkan.');
  };

  const handleUpdateTransaction = (updatedTx: Transaction) => {
    setTransactions((prev) =>
      prev.map((tx) => (tx.id === updatedTx.id ? updatedTx : tx))
    );
    setLastAffectedTransaction(updatedTx);
    setSuccessActionType('updated');
    setIsSuccessModalOpen(true);
    showToast('Transaksi berhasil diperbarui.');
  };

  const handleDeleteTransaction = (txId: string) => {
    setTransactions((prev) => prev.filter((tx) => tx.id !== txId));
    showToast('Transaksi berhasil dihapus.');
  };

  // Handler interaksi baris
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

  return (
    <div className="space-y-7 max-w-7xl mx-auto pb-16">
      {/* 1. HEADER HALAMAN */}
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
          + Tambah Transaksi
        </Button>
      </div>

      {/* 2. RINGKASAN FINANSIAL (4 Metrik Utama) */}
      <TransactionSummary
        income={summary.income}
        expenses={summary.expenses}
        net={summary.net}
        avgDaily={summary.avgDaily}
      />

      {/* 3. PANCARIAN & FILTER KAS */}
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

      {/* 4. BANNER ASISTEN ANALISIS FINAI */}
      <AITransactionBanner onOpenAI={handleOpenAIWithPrompt} />

      {/* 5. DAFTAR ARUS MUTASI KAS KRONOLOGIS */}
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

      {/* ========================================================================= */}
      {/* 6. REDESIGNED MODAL & POPUP SUITE (MATCHING VISUAL REFERENCE)             */}
      {/* ========================================================================= */}

      {/* Modal 1: Add Transaction (Top-Left in Visual Reference) */}
      <AddTransactionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddTransaction={handleAddTransaction}
      />

      {/* Modal 2: Edit Transaction (Bottom-Left in Visual Reference) */}
      <EditTransactionModal
        transaction={activeTransaction}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onUpdateTransaction={handleUpdateTransaction}
      />

      {/* Modal 3: Transaction Detail Receipt (Top-Center in Visual Reference) */}
      <TransactionDetail
        transaction={activeTransaction}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onEdit={(tx) => {
          setActiveTransaction(tx);
          setIsEditModalOpen(true);
        }}
        onDelete={(tx) => {
          setActiveTransaction(tx);
          setIsDeleteDialogOpen(true);
        }}
      />

      {/* Modal 4: Delete Confirmation (Top-Right in Visual Reference) */}
      <DeleteTransactionDialog
        transaction={activeTransaction}
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirmDelete={handleDeleteTransaction}
      />

      {/* Modal 5: Filter Transactions Modal (Bottom-Center in Visual Reference) */}
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

      {/* Modal 6: Transaction Success Modal (Bottom-Right in Visual Reference) */}
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

      {/* Panel Tanya FinAI */}
      <AITransactionPrompt
        isOpen={isAIModalOpen}
        onClose={() => {
          setIsAIModalOpen(false);
          setInitialAIPrompt(undefined);
        }}
        initialPrompt={initialAIPrompt}
      />

      {/* Notifikasi Toast Mengambang */}
      <TransactionToast
        message={toastMessage}
        onClose={() => setToastMessage(null)}
      />
    </div>
  );
}
