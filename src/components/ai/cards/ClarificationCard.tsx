'use client';

import React from 'react';
import { HelpCircle, MessageCircle, Plus, ArrowRight } from 'lucide-react';

interface ClarificationCardProps {
  message: string;
  relatedGoalId?: string;
  newGoalHref?: string;
  newGoalLabel?: string;
  existingGoalName?: string;
  confirmAction?: () => void;
  freeReplyHint?: string;
}

export default function ClarificationCard({
  message,
  relatedGoalId,
  newGoalHref,
  newGoalLabel,
  existingGoalName,
  confirmAction,
  freeReplyHint,
}: ClarificationCardProps) {
  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E8EAF2] shadow-[0_6px_24px_rgba(36,38,54,0.04)] space-y-3 max-w-md">
      <div className="flex items-center gap-2">
        <span className="px-2.5 py-0.5 rounded-full bg-[#EDEAFC] text-[#5F5ED4] text-[10px] font-bold uppercase tracking-wider">
          Perlu Informasi
        </span>
        <HelpCircle size={14} className="text-[#757A95]" />
      </div>

      <p className="text-xs sm:text-sm leading-relaxed text-[#242636] whitespace-pre-line">
        {message}
      </p>

      {relatedGoalId ? (
        <div className="space-y-2">
          <div className="text-[11px] text-[#757A95]">
            {existingGoalName ? (
              <span className="font-semibold">{existingGoalName}</span>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-2">
            {newGoalHref ? (
              <a
                href={newGoalHref}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl bg-[#E4E2FB] text-[#7C7CE6] hover:bg-[#D9D6F7] transition-colors"
              >
                <Plus size={14} />
                {newGoalLabel || 'Buat target baru'}
              </a>
            ) : null}
            {confirmAction ? (
              <button
                type="button"
                onClick={confirmAction}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl bg-gradient-to-r from-[#7C7CE6] to-[#8C8BE8] text-white shadow-sm hover:brightness-110 transition-colors"
              >
                Tambah ke target ini
                <ArrowRight size={14} />
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="text-[11px] text-[#757A95] flex items-center gap-1">
        <MessageCircle size={13} />
        {freeReplyHint || 'Jawab pesan ini dengan detail yang diminta agar saya bisa lanjut hitung rencana atau rencanakan aksinya.'}
      </div>
    </div>
  );
}
