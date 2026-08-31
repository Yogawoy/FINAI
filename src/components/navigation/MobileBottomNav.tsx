'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Wallet,
  Receipt,
  PieChart,
  Target,
  LineChart,
  Sparkles,
} from 'lucide-react';

const MOBILE_ITEMS = [
  { label: 'Beranda', href: '/app', icon: Home },
  { label: 'Dompet', href: '/app/wallets', icon: Wallet },
  { label: 'Transaksi', href: '/app/transactions', icon: Receipt },
  { label: 'Anggaran', href: '/app/budgets', icon: PieChart },
  { label: 'Target', href: '/app/goals', icon: Target },
  { label: 'Asisten', href: '/app/assistant', icon: Sparkles, highlight: true },
];

export default function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <div className="lg:hidden fixed bottom-4 inset-x-4 z-40">
      <nav className="glass-panel rounded-full px-4 py-2.5 flex items-center justify-between shadow-[0_12px_40px_rgba(48,51,74,0.12)] border border-white/90">
        {MOBILE_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center justify-center p-2 rounded-full transition-all ${
                isActive
                  ? 'text-[#7C7CE6]'
                  : 'text-[#757A95] hover:text-[#242636]'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                  isActive
                    ? 'bg-[#E4E2FB] text-[#7C7CE6] shadow-xs scale-110'
                    : item.highlight
                    ? 'bg-[#E4E2FB]/50 text-[#7C7CE6]'
                    : ''
                }`}
              >
                <Icon size={18} />
              </div>
              <span className="text-[10px] font-medium mt-0.5 scale-90">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
