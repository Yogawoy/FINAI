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
  Settings,
  ShieldCheck,
  ArrowUpRight,
} from 'lucide-react';
import Badge from '@/components/ui/Badge';

const NAV_ITEMS = [
  { label: 'Beranda', href: '/app', icon: Home },
  { label: 'Dompet Kas', href: '/app/wallets', icon: Wallet },
  { label: 'Transaksi', href: '/app/transactions', icon: Receipt },
  { label: 'Anggaran', href: '/app/budgets', icon: PieChart },
  { label: 'Target Impian', href: '/app/goals', icon: Target },
  { label: 'Analisis', href: '/app/analytics', icon: LineChart },
  { label: 'Asisten FinAI', href: '/app/assistant', icon: Sparkles, highlight: true },
  { label: 'Pengaturan', href: '/app/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen fixed left-0 top-0 p-6 z-30 pointer-events-none">
      <div className="w-full h-full glass-panel rounded-3xl p-5 flex flex-col justify-between pointer-events-auto shadow-[0_8px_32px_rgba(48,51,74,0.04)] border border-white/90">
        {/* Brand Logo & Tag */}
        <div>
          <Link href="/" className="flex items-center gap-3 px-2 py-1 group">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#7C7CE6] via-[#8C8BE8] to-[#D6E4FA] flex items-center justify-center shadow-[0_4px_14px_rgba(124,124,230,0.35)] group-hover:scale-105 transition-transform">
              <Sparkles size={18} className="text-white" />
            </div>
            <div>
              <span className="font-extrabold tracking-tight text-lg text-[#242636] block leading-none">
                FinAI
              </span>
              <span className="text-[10px] tracking-wider uppercase font-semibold text-[#7C7CE6] block mt-0.5">
                Keuangan Personal
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="mt-8 space-y-1.5">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-[#E4E2FB] text-[#7C7CE6] font-bold shadow-[0_2px_10px_rgba(124,124,230,0.15)] border border-white'
                      : 'text-[#757A95] hover:text-[#242636] hover:bg-black/[0.03]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      size={18}
                      className={
                        isActive
                          ? 'text-[#7C7CE6]'
                          : item.highlight
                          ? 'text-[#7C7CE6]'
                          : 'text-[#757A95]'
                      }
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.highlight && !isActive && (
                    <span className="w-2 h-2 rounded-full bg-[#7C7CE6] animate-pulse" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Profile & Demo Switcher */}
        <div className="space-y-3 pt-4 border-t border-black/[0.04]">
          {/* Quick Landing Page Link */}
          <Link
            href="/"
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-[#757A95] hover:text-[#242636] hover:bg-black/[0.02] transition-colors"
          >
            <span className="flex items-center gap-2">
              <ArrowUpRight size={14} />
              Halaman Depan
            </span>
            <Badge variant="mint" size="sm">Aktif</Badge>
          </Link>

          {/* User Profile Pill */}
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-2xl bg-white/60 border border-white/80 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#E4E2FB] to-[#C9E7DC] flex items-center justify-center font-bold text-[#7C7CE6] text-sm shadow-xs">
              YW
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-[#242636] truncate">
                  Yoga W.
                </span>
                <ShieldCheck size={13} className="text-[#1B7354]" />
              </div>
              <span className="text-[11px] text-[#757A95] block truncate">
                FinAI Prioritas
              </span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
