'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { PieChart, Plus, SearchX } from 'lucide-react';
import { BudgetCategory } from '@/types';
import Button from '@/components/ui/Button';
import BudgetRow from './BudgetRow';

interface BudgetListProps {
  budgets: BudgetCategory[];
  searchQuery: string;
  onSelectBudget: (budget: BudgetCategory) => void;
  onEditBudget: (budget: BudgetCategory) => void;
  onDeleteBudget: (budget: BudgetCategory) => void;
  onDuplicateBudget?: (budget: BudgetCategory) => void;
  onCreateBudget: () => void;
}

export default function BudgetList({
  budgets,
  searchQuery,
  onSelectBudget,
  onEditBudget,
  onDeleteBudget,
  onDuplicateBudget,
  onCreateBudget,
}: BudgetListProps) {
  // Empty State if no budgets exist at all
  if (budgets.length === 0 && !searchQuery) {
    return (
      <div className="p-12 sm:p-16 rounded-[32px] bg-white border border-black/[0.05] shadow-2xs text-center space-y-4 max-w-lg mx-auto">
        <div className="w-16 h-16 rounded-full bg-[#EDEAFC] text-[#7C7CE6] flex items-center justify-center mx-auto shadow-[0_8px_20px_rgba(124,124,230,0.2)]">
          <PieChart size={28} />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-[#242636]">Belum Ada Pos Anggaran</h3>
          <p className="text-xs sm:text-sm text-[#757A95] max-w-xs mx-auto">
            Buat rencana pos anggaran untuk mulai mengontrol dan mengelola pengeluaran belanja Anda.
          </p>
        </div>
        <div className="pt-2">
          <Button
            variant="primary"
            size="md"
            icon={<Plus size={16} />}
            onClick={onCreateBudget}
          >
            + Buat Anggaran
          </Button>
        </div>
      </div>
    );
  }

  // Empty Search Results
  if (budgets.length === 0 && searchQuery) {
    return (
      <div className="p-10 rounded-[28px] bg-white border border-black/[0.05] shadow-2xs text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-[#F4F3F9] text-[#757A95] flex items-center justify-center mx-auto">
          <SearchX size={22} />
        </div>
        <h4 className="text-sm font-bold text-[#242636]">
          Tidak ada anggaran yang cocok dengan "{searchQuery}"
        </h4>
        <p className="text-xs text-[#757A95]">
          Coba cari dengan kata kunci nama atau kategori yang berbeda.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {budgets.map((budget, index) => (
        <motion.div
          key={budget.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: index * 0.04 }}
        >
          <BudgetRow
            budget={budget}
            onSelect={onSelectBudget}
            onEdit={onEditBudget}
            onDelete={onDeleteBudget}
            onDuplicate={onDuplicateBudget}
          />
        </motion.div>
      ))}
    </div>
  );
}
