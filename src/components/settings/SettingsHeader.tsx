'use client';

import React from 'react';
import { Settings } from 'lucide-react';

export default function SettingsHeader() {
  return (
    <div className="flex items-center gap-3 pb-2 border-b border-[#E8EAF2]/80">
      <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#7C7CE6] via-[#8C8BE8] to-[#D6E4FA] text-white flex items-center justify-center shadow-[0_4px_14px_rgba(124,124,230,0.25)]">
        <Settings size={20} />
      </div>
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-[#242636] tracking-tight">
          Pengaturan
        </h1>
        <p className="text-xs sm:text-sm font-medium text-[#757A95]">
          Kelola akun dan preferensi FinAI kamu.
        </p>
      </div>
    </div>
  );
}
