'use client';

import React from 'react';
import { CircleCheck, ShieldCheck } from 'lucide-react';

interface AIConfirmationProps {
  message: string;
  submessage?: string;
}

export default function AIConfirmation({ message, submessage }: AIConfirmationProps) {
  return (
    <div className="p-3.5 sm:p-4 rounded-2xl bg-[#EBF7F2] border border-[#D0EFE5] flex items-start gap-3 max-w-md shadow-2xs">
      <div className="w-7 h-7 rounded-xl bg-[#D0EFE5] text-[#1B7354] flex items-center justify-center shrink-0 mt-0.5">
        <CircleCheck size={16} strokeWidth={2.5} />
      </div>
      <div className="space-y-0.5 text-xs">
        <p className="font-bold text-[#1B7354]">{message}</p>
        {submessage && <p className="text-[#757A95]">{submessage}</p>}
      </div>
    </div>
  );
}
