'use client';

import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

interface AIErrorProps {
  message?: string;
  onRetry?: () => void;
}

export default function AIError({
  message = 'FinAI belum dapat memproses pesan ini.',
  onRetry,
}: AIErrorProps) {
  return (
    <div className="p-4 rounded-2xl bg-[#FEF3F2] border border-[#FCE2E0] space-y-3 max-w-md shadow-2xs">
      <div className="flex items-center gap-2.5 text-[#D94F4F]">
        <AlertCircle size={17} className="shrink-0" />
        <span className="text-xs font-bold">{message}</span>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="px-3 py-1.5 rounded-xl bg-white border border-[#FCE2E0] hover:bg-[#FEF3F2] text-xs font-bold text-[#D94F4F] transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <RotateCcw size={12} />
          <span>Coba Lagi</span>
        </button>
      )}
    </div>
  );
}
