'use client';

import React from 'react';
import Sidebar from '@/components/navigation/Sidebar';
import MobileBottomNav from '@/components/navigation/MobileBottomNav';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-[#F6F7FB] overflow-x-clip">
      {/* Background Soft Aura Halos */}
      <div className="fixed top-0 left-1/4 w-[600px] h-[600px] rounded-full aurora-glow-1 pointer-events-none -z-10" />
      <div className="fixed bottom-10 right-10 w-[500px] h-[500px] rounded-full aurora-glow-2 pointer-events-none -z-10" />

      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="lg:pl-72 min-h-screen pb-24 lg:pb-12 pt-6 px-4 sm:px-8 lg:px-10 max-w-7xl mx-auto">
        {children}
      </main>

      {/* Mobile Navigation Dock */}
      <MobileBottomNav />
    </div>
  );
}
