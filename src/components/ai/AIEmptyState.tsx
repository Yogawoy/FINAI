'use client';

import React from 'react';
import { Sparkles, MessageSquare } from 'lucide-react';
import AIQuickActions from './AIQuickActions';

interface AIEmptyStateProps {
  onSelectAction: (prompt: string) => void;
}

export default function AIEmptyState({ onSelectAction }: AIEmptyStateProps) {
  return (
    <div className="py-8 sm:py-12 flex flex-col items-center text-center space-y-7 max-w-2xl mx-auto">
      {/* Abstract FinAI SVG Mark */}
      <div className="w-16 h-16 rounded-[24px] bg-gradient-to-tr from-[#7C7CE6] via-[#8C8BE8] to-[#D6E4FA] flex items-center justify-center shadow-[0_10px_30px_rgba(124,124,230,0.3)]">
        <Sparkles size={28} className="text-white" />
      </div>

      <div className="space-y-1.5">
        <h2 className="text-xl sm:text-2xl font-black text-[#242636] tracking-tight">
          FinAI Assistant
        </h2>
        <p className="text-xs sm:text-sm text-[#757A95] max-w-md mx-auto leading-relaxed">
          Ada yang ingin kamu catat atau tanyakan seputar kondisi keuanganmu hari ini?
        </p>
      </div>

      {/* Quick Action Suggestions */}
      <div className="w-full text-left pt-2">
        <AIQuickActions onSelectAction={onSelectAction} />
      </div>
    </div>
  );
}
