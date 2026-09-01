'use client';

import React, { useState } from 'react';
import { Search, Bell, Command, Menu } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  actionButton?: React.ReactNode;
}

export default function Header({
  title = 'Selamat siang, Yoga.',
  subtitle = 'Kondisi keuanganmu bulan ini sangat sehat.',
  actionButton,
}: HeaderProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <>
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent('open-mobile-sidebar'))}
            className="lg:hidden w-10 h-10 rounded-2xl bg-white/80 border border-[#E8EAF2] flex items-center justify-center text-[#757A95] hover:text-[#242636] transition-colors cursor-pointer shadow-xs shrink-0"
            aria-label="Buka Menu Navigasi"
          >
            <Menu size={18} />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#242636]">
              {title}
            </h1>
            <p className="text-xs sm:text-sm text-[#757A95] mt-0.5 font-medium">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Header Right Action Controls */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          {/* Quick Search Pill */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl glass-pill text-xs font-medium text-[#757A95] hover:text-[#242636] hover:bg-white/80 transition-all cursor-pointer shadow-xs"
          >
            <Search size={14} className="text-[#7C7CE6]" />
            <span className="hidden sm:inline">Cari transaksi, anggaran...</span>
            <span className="sm:hidden">Cari</span>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono bg-black/[0.04] text-[#757A95] rounded-md">
              <Command size={10} /> K
            </kbd>
          </button>

          {/* Notification Button */}
          <button
            className="relative w-10 h-10 rounded-2xl glass-pill flex items-center justify-center text-[#757A95] hover:text-[#242636] hover:bg-white/80 transition-all cursor-pointer shadow-xs"
            title="Notifikasi"
          >
            <Bell size={17} />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#7C7CE6] ring-2 ring-white" />
          </button>

          {/* Profile Avatar Pill */}
          <div className="flex items-center gap-2 pl-1">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#E4E2FB] to-[#D6E4FA] border border-white flex items-center justify-center text-[#7C7CE6] font-extrabold text-xs shadow-xs select-none">
              YW
            </div>
          </div>

          {actionButton}
        </div>
      </header>

      {/* Global Quick Search Modal */}
      <Modal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        title="Pencarian Cepat FinAI"
        subtitle="Temukan transaksi, pos anggaran, dan target impianmu"
      >
        <div className="space-y-4">
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#757A95]" />
            <input
              type="text"
              autoFocus
              placeholder="Ketik untuk mencari (misal: Ayam Geprek, Kopi, Jepang)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-black/[0.03] border border-black/[0.06] rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#7C7CE6]/50 focus:bg-white transition-all text-[#242636]"
            />
          </div>

          <div className="space-y-2 pt-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#757A95] block">
              Saran Filter Cepat
            </span>
            <div className="flex flex-wrap gap-2">
              {['Makanan & Minuman', 'Transportasi', 'Gaji Bulanan', 'Laptop Kerja'].map((s) => (
                <button
                  key={s}
                  onClick={() => setSearchQuery(s)}
                  className="px-3 py-1.5 rounded-xl bg-white text-xs font-semibold text-[#757A95] hover:text-[#7C7CE6] hover:bg-[#E4E2FB]/40 border border-black/[0.05] transition-colors cursor-pointer"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <Button variant="ghost" size="sm" onClick={() => setIsSearchOpen(false)}>
              Tutup
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
