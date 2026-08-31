'use client';

import React from 'react';
import { SearchX, RefreshCcw } from 'lucide-react';
import { Transaction } from '@/types';
import TransactionRow from './TransactionRow';
import Button from '@/components/ui/Button';

interface TransactionListProps {
  transactions: Transaction[];
  onSelectTransaction: (tx: Transaction) => void;
  onEditTransaction: (tx: Transaction, e: React.MouseEvent) => void;
  onDeleteTransaction: (tx: Transaction, e: React.MouseEvent) => void;
  onResetFilters: () => void;
}

// Ubah tanggal menjadi judul grup yang ramah
const getGroupHeader = (dateStr: string) => {
  if (dateStr === '2026-08-31') return 'HARI INI';
  if (dateStr === '2026-08-30') return 'KEMARIN';

  if (dateStr.includes('-')) {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const day = parseInt(parts[2], 10);
      const monthNames = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
      ];
      const monthIndex = parseInt(parts[1], 10) - 1;
      const year = parts[0];
      return `${day} ${monthNames[monthIndex] || 'Agustus'} ${year}`.toUpperCase();
    }
  }
  return dateStr.toUpperCase();
};

export default function TransactionList({
  transactions,
  onSelectTransaction,
  onEditTransaction,
  onDeleteTransaction,
  onResetFilters,
}: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <div className="p-12 sm:p-16 rounded-[28px] bg-white/80 backdrop-blur-md border border-white/90 shadow-xs text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-[#E4E2FB]/50 text-[#7C7CE6] flex items-center justify-center mx-auto">
          <SearchX size={26} />
        </div>
        <div className="space-y-1">
          <h3 className="text-base sm:text-lg font-bold text-[#242636]">
            Tidak ada transaksi ditemukan
          </h3>
          <p className="text-xs sm:text-sm text-[#757A95] max-w-sm mx-auto">
            Coba ubah kata kunci pencarian atau ganti filter aktif untuk melihat catatan kas.
          </p>
        </div>
        <div>
          <Button
            variant="secondary"
            size="sm"
            icon={<RefreshCcw size={14} />}
            onClick={onResetFilters}
          >
            Reset Semua Filter
          </Button>
        </div>
      </div>
    );
  }

  // Pengelompokan kronologis
  const grouped: { [key: string]: Transaction[] } = {};
  transactions.forEach((tx) => {
    const header = getGroupHeader(tx.date);
    if (!grouped[header]) {
      grouped[header] = [];
    }
    grouped[header].push(tx);
  });

  return (
    <div className="space-y-6">
      {Object.keys(grouped).map((groupTitle) => {
        const items = grouped[groupTitle];

        return (
          <div key={groupTitle} className="space-y-2.5">
            {/* Header Grup Tanggal */}
            <div className="flex items-center justify-between px-2 text-xs font-extrabold text-[#757A95] tracking-wider uppercase">
              <span>{groupTitle}</span>
              <span className="text-[11px] font-semibold text-[#757A95] lowercase">
                {items.length} {items.length === 1 ? 'transaksi' : 'transaksi'}
              </span>
            </div>

            {/* Kontainer Daftar Transaksi */}
            <div className="p-2 sm:p-3 rounded-[26px] bg-white/85 backdrop-blur-md border border-white/90 shadow-[0_6px_25px_rgba(48,51,74,0.02)] space-y-1 divide-y divide-black/[0.03]">
              {items.map((tx) => (
                <TransactionRow
                  key={tx.id}
                  transaction={tx}
                  onClick={onSelectTransaction}
                  onEdit={onEditTransaction}
                  onDelete={onDeleteTransaction}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
