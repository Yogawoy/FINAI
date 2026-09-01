'use client';

import {
  Receipt,
  PieChart,
  Target,
  LineChart,
  ArrowRight,
  Coffee,
  Zap,
  ArrowDownLeft,
  Wallet,
} from 'lucide-react';

interface QuickActionItem {
  id: string;
  title: string;
  subtitle: string;
  prompt: string;
  icon: React.ReactNode;
}

interface AIQuickActionsProps {
  onSelectAction: (prompt: string) => void;
  variant?: 'cards' | 'sticky-bar';
}

const QUICK_ACTIONS: QuickActionItem[] = [
  {
    id: 'qa-1',
    title: 'Ayam Geprek',
    subtitle: 'Catat pengeluaran makan',
    prompt: 'Tadi aku beli ayam geprek 10 ribu.',
    icon: <Receipt size={14} className="text-[#D94F4F]" />,
  },
  {
    id: 'qa-2',
    title: 'Beli Kopi',
    subtitle: 'Catat beli kopi susu',
    prompt: 'Tadi beli kopi susu 18 ribu',
    icon: <Coffee size={14} className="text-[#9C7550]" />,
  },
  {
    id: 'qa-3',
    title: 'Bayar Listrik',
    subtitle: 'Catat tagihan bulanan PLN',
    prompt: 'Bayar listrik 250 ribu dari BCA',
    icon: <Zap size={14} className="text-[#E0A824]" />,
  },
  {
    id: 'qa-4',
    title: 'Terima Gaji',
    subtitle: 'Catat pemasukan bulanan',
    prompt: 'Terima transfer gaji 7 juta ke BCA',
    icon: <ArrowDownLeft size={14} className="text-[#1B7354]" />,
  },
  {
    id: 'qa-5',
    title: 'Cek Budget',
    subtitle: 'Evaluasi sisa kuota pos',
    prompt: 'Budget makananku masih aman?',
    icon: <PieChart size={14} className="text-[#5F5ED4]" />,
  },
  {
    id: 'qa-6',
    title: 'Cek Pengeluaran',
    subtitle: 'Lihat cashflow bulan ini',
    prompt: 'Pengeluaranku bulan ini gimana?',
    icon: <LineChart size={14} className="text-[#7C7CE6]" />,
  },
  {
    id: 'qa-7',
    title: 'Nabung Kuliah',
    subtitle: 'Alokasikan dana ke target',
    prompt: 'Aku mau nabung 500 ribu buat kuliah dari BCA.',
    icon: <Target size={14} className="text-[#1B7354]" />,
  },
  {
    id: 'qa-8',
    title: 'Cek Saldo Kas',
    subtitle: 'Lihat saldo seluruh dompet',
    prompt: 'Berapa saldo di semua dompetku?',
    icon: <Wallet size={14} className="text-[#4F73D9]" />,
  },
];

export default function AIQuickActions({
  onSelectAction,
  variant = 'cards',
}: AIQuickActionsProps) {
  if (variant === 'sticky-bar') {
    return (
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        <div className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-bold text-[#757A95] uppercase tracking-wider shrink-0 select-none">
          <span>Saran Cepat:</span>
        </div>

        <div className="flex items-center gap-2">
          {QUICK_ACTIONS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectAction(item.prompt)}
              className="h-9 px-3.5 rounded-full bg-white border border-[#E8EAF2] hover:border-[#7C7CE6]/60 hover:bg-[#FAFBFD] shadow-2xs hover:shadow-xs transition-all text-xs font-semibold text-[#242636] flex items-center gap-2 shrink-0 cursor-pointer active:scale-95 group"
            >
              <div className="w-5 h-5 rounded-full bg-[#FAFBFD] flex items-center justify-center">
                {item.icon}
              </div>
              <span className="group-hover:text-[#5F5ED4] transition-colors">{item.title}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

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
