'use client';

import React from 'react';
import { Receipt, PieChart, Target, LineChart, ArrowRight } from 'lucide-react';

interface QuickActionItem {
  id: string;
  title: string;
  subtitle: string;
  prompt: string;
  icon: React.ReactNode;
}

interface AIQuickActionsProps {
  onSelectAction: (prompt: string) => void;
}

const QUICK_ACTIONS: QuickActionItem[] = [
  {
    id: 'qa-1',
    title: 'Catat Pengeluaran',
    subtitle: 'Catat transaksi belanja baru',
    prompt: 'Tadi aku beli ayam geprek 10 ribu.',
    icon: <Receipt size={16} className="text-[#D94F4F]" />,
  },
  {
    id: 'qa-2',
    title: 'Cek Pengeluaran',
    subtitle: 'Lihat pengeluaran bulan ini',
    prompt: 'Pengeluaranku bulan ini gimana?',
    icon: <LineChart size={16} className="text-[#7C7CE6]" />,
  },
  {
    id: 'qa-3',
    title: 'Cek Budget',
    subtitle: 'Apakah anggaran masih aman?',
    prompt: 'Budget makananku masih aman?',
    icon: <PieChart size={16} className="text-[#5F5ED4]" />,
  },
  {
    id: 'qa-4',
    title: 'Target Impian',
    subtitle: 'Nabung untuk target impian',
    prompt: 'Aku mau nabung 500 ribu buat kuliah dari BCA.',
    icon: <Target size={16} className="text-[#1B7354]" />,
  },
];

export default function AIQuickActions({ onSelectAction }: AIQuickActionsProps) {
  return (
    <div className="space-y-2">
      <span className="text-[11px] font-bold text-[#757A95] uppercase tracking-wider block pl-1">
        Saran Cepat
      </span>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {QUICK_ACTIONS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelectAction(item.prompt)}
            className="p-3.5 rounded-2xl bg-white border border-[#E8EAF2] hover:border-[#7C7CE6]/50 hover:bg-[#FAFBFD] shadow-2xs hover:shadow-xs transition-all text-left group cursor-pointer flex flex-col justify-between space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-xl bg-[#FAFBFD] border border-black/[0.04] flex items-center justify-center group-hover:scale-105 transition-transform">
                {item.icon}
              </div>
              <ArrowRight size={13} className="text-[#A0A4B8] group-hover:text-[#7C7CE6] group-hover:translate-x-0.5 transition-all" />
            </div>

            <div>
              <span className="block text-xs font-bold text-[#242636] group-hover:text-[#5F5ED4] transition-colors">
                {item.title}
              </span>
              <span className="block text-[11px] text-[#757A95] line-clamp-1 mt-0.5">
                {item.subtitle}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
