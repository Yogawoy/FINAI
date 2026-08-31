'use client';

import React from 'react';
import { Lock, Activity, Sparkles, Info, X } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { Wallet } from '@/types';
import WalletCard from './WalletCard';

interface WalletPreviewModalProps {
  wallet: Wallet | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function WalletPreviewModal({
  wallet,
  isOpen,
  onClose,
}: WalletPreviewModalProps) {
  if (!wallet) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="md"
      title="Wallet Preview"
      subtitle="This is how your wallet will look"
      className="p-6 sm:p-7"
    >
      <div className="space-y-6 text-center">
        {/* Large Wallet Card Display */}
        <div className="w-full max-w-[340px] mx-auto">
          <WalletCard wallet={wallet} />
        </div>

        {/* 3 Feature Badges */}
        <div className="grid grid-cols-3 gap-2.5">
          {/* Badge 1 */}
          <div className="p-2.5 rounded-2xl bg-[#F8F9FD] border border-black/[0.05] flex flex-col items-center justify-center gap-1">
            <div className="w-7 h-7 rounded-xl bg-[#E4E2FB] text-[#7C7CE6] flex items-center justify-center">
              <Lock size={14} />
            </div>
            <span className="text-[10px] font-bold text-[#242636] text-center leading-tight">
              Secure & Encrypted
            </span>
          </div>

          {/* Badge 2 */}
          <div className="p-2.5 rounded-2xl bg-[#F8F9FD] border border-black/[0.05] flex flex-col items-center justify-center gap-1">
            <div className="w-7 h-7 rounded-xl bg-[#D6E4FA] text-[#3E6FB0] flex items-center justify-center">
              <Activity size={14} />
            </div>
            <span className="text-[10px] font-bold text-[#242636] text-center leading-tight">
              Real-time Tracking
            </span>
          </div>

          {/* Badge 3 */}
          <div className="p-2.5 rounded-2xl bg-[#F8F9FD] border border-black/[0.05] flex flex-col items-center justify-center gap-1">
            <div className="w-7 h-7 rounded-xl bg-[#D0EFE5] text-[#1B7354] flex items-center justify-center">
              <Sparkles size={14} />
            </div>
            <span className="text-[10px] font-bold text-[#242636] text-center leading-tight">
              AI Data Ready
            </span>
          </div>
        </div>

        {/* Bottom Note */}
        <div className="p-3 rounded-2xl bg-[#F4F3FF] border border-[#E4E2FB] flex items-center justify-center gap-2 text-xs text-[#5F5ED4] font-medium">
          <Info size={14} className="shrink-0" />
          <span>You can always change this later in wallet settings.</span>
        </div>
      </div>
    </Modal>
  );
}
