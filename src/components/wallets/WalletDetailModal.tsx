'use client';

import React from 'react';
import { Pencil, Trash2, X } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { Wallet, Transaction } from '@/types';
import { formatIDR } from '@/lib/format';
import WalletCard, { getWalletIconComponent, formatWalletTypeLabel } from './WalletCard';

interface WalletDetailModalProps {
  wallet: Wallet | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (wallet: Wallet) => void;
  onArchive: (wallet: Wallet) => void;
  transactions?: Transaction[];
}

export default function WalletDetailModal({
  wallet,
  isOpen,
  onClose,
  onEdit,
  onArchive,
}: WalletDetailModalProps) {
  if (!wallet) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="xl"
      hideHeader
      hideCloseButton={true}
      className="p-6 sm:p-8"
    >
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#E4E2FB] text-[#7C7CE6] flex items-center justify-center shadow-xs">
              {getWalletIconComponent(wallet.type || wallet.icon || 'Bank', 20)}
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-extrabold text-[#242636] tracking-tight">
                {wallet.name}
              </h3>
              <span className="text-xs text-[#757A95]">
                {formatWalletTypeLabel(wallet.type)}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#757A95] hover:text-[#242636] hover:bg-black/[0.04] transition-colors cursor-pointer"
            title="Tutup"
          >
            <X size={18} />
          </button>
        </div>

        {/* Card Preview & Real Metadata */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
          <div className="lg:col-span-6">
            <WalletCard wallet={wallet} />
          </div>

          <div className="lg:col-span-6 p-4 rounded-2xl bg-[#F8F9FD] border border-black/[0.05] divide-y divide-black/[0.04] text-xs space-y-2">
            <div className="flex items-center justify-between pb-1 pt-0.5">
              <span className="text-[#757A95]">Tipe Dompet</span>
              <span className="font-bold text-[#242636]">
                {formatWalletTypeLabel(wallet.type)}
              </span>
            </div>

            <div className="flex items-center justify-between py-1.5">
              <span className="text-[#757A95]">Nomor Rekening / ID</span>
              <span className="font-mono font-bold text-[#242636]">
                {wallet.accountIdentifier || '•••• 4821'}
              </span>
            </div>

            <div className="flex items-center justify-between py-1.5">
              <span className="text-[#757A95]">Mata Uang</span>
              <span className="font-bold text-[#242636]">
                {wallet.currency ? `${wallet.currency} (Rp)` : 'IDR (Rp)'}
              </span>
            </div>

            <div className="flex items-center justify-between pt-1.5">
              <span className="text-[#757A95]">Saldo Saat Ini</span>
              <span className="font-extrabold text-[#242636] tabular-nums">
                {formatIDR(wallet.balance)}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            onClick={() => {
              onClose();
              onEdit(wallet);
            }}
            className="py-3 px-4 rounded-2xl bg-[#E4E2FB] hover:bg-[#D9D6F7] text-[#5F5ED4] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 border border-[#7C7CE6]/20 transition-all shadow-xs active:scale-[0.98] cursor-pointer"
          >
            <Pencil size={14} />
            <span>Edit Dompet</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onArchive(wallet);
            }}
            className="py-3 px-4 rounded-2xl bg-white hover:bg-[#FFF1F0] text-[#757A95] hover:text-[#B83A38] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 border border-black/[0.08] hover:border-[#F7C0BC] transition-all shadow-xs active:scale-[0.98] cursor-pointer"
          >
            <Trash2 size={14} />
            <span>Hapus Dompet</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}
