'use client';

import React from 'react';
import {
  Calendar,
  Clock,
  Wallet as WalletIcon,
  Tag,
  FileText,
  Sparkles,
  Pencil,
  Trash2,
  X,
} from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { Transaction } from '@/types';
import { formatIDR } from '@/lib/format';
import { getCategoryIcon, formatCategoryLabel } from './TransactionRow';

interface TransactionDetailProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (tx: Transaction) => void;
  onDelete: (tx: Transaction) => void;
}

export default function TransactionDetail({
  transaction,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}: TransactionDetailProps) {
  if (!transaction) return null;

  const isIncome = transaction.type === 'income';

  // Format a realistic Transaction Receipt ID: TRX-YYYYMMDD-HHMMSS
  const transactionId = React.useMemo(() => {
    if (!transaction) return 'TRX-20260830-184200';
    if (transaction.id.toUpperCase().startsWith('TRX-')) {
      return transaction.id;
    }
    const cleanDate = (transaction.date || '').replace(/\D/g, '') || '20260830';
    const cleanTime = (transaction.time || '').replace(/\D/g, '') || '184200';
    return `TRX-${cleanDate.padEnd(8, '0').slice(0, 8)}-${cleanTime.padEnd(6, '0').slice(0, 6)}`;
  }, [transaction]);

  // Wallet / payment source display
  const paymentSource =
    transaction.paymentMethod || transaction.account || 'Bank BCA •••• 4821';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="md"
      hideHeader
      hideCloseButton={true}
      className="p-4 sm:p-5 max-w-[460px] mx-auto overflow-hidden"
    >
      <div className="relative space-y-2.5">
        {/* ========================================================================= */}
        {/* TOP RIGHT: CLOSE BUTTON (X)                                               */}
        {/* ========================================================================= */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-0 top-0 w-7 h-7 rounded-full flex items-center justify-center text-[#757A95] hover:text-[#242636] hover:bg-black/[0.04] transition-colors cursor-pointer z-20"
          title="Tutup"
        >
          <X size={16} />
        </button>

        {/* ========================================================================= */}
        {/* TOP AREA: CATEGORY ICON BADGE, TITLE, SUBTITLE & AMOUNT                   */}
        {/* ========================================================================= */}
        <div className="text-center pt-1 space-y-0.5 relative">
          {/* Circular Soft Lavender Badge */}
          <div className="w-11 h-11 rounded-full bg-[#EDEAFC] border border-[#E4E2FB] text-[#7C7CE6] flex items-center justify-center mx-auto shadow-[0_6px_18px_rgba(124,124,230,0.15)]">
            {getCategoryIcon(transaction.category)}
          </div>

          {/* Prominent Transaction Title */}
          <div className="pt-1">
            <h3 className="text-sm sm:text-base font-black uppercase tracking-wide text-[#242636] leading-tight max-w-xs mx-auto px-2">
              {transaction.title || 'Belanja Kebutuhan Supermarket'}
            </h3>
            <span className="text-[11px] text-[#757A95] font-medium block">
              {formatCategoryLabel(transaction.category)}
            </span>
          </div>

          {/* Large Prominent Amount */}
          <div
            className={`text-xl sm:text-2xl font-black tracking-tight ${
              isIncome ? 'text-[#1B7354]' : 'text-[#C93B38]'
            }`}
          >
            {isIncome ? '+' : '-'} {formatIDR(transaction.amount)}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* DIGITAL RECEIPT PAPER ("FINAI RECEIPT")                                    */}
        {/* ========================================================================= */}
        <div className="relative rounded-[20px] bg-[#FAFAFE] border border-[#E8E7F6] shadow-[0_8px_24px_rgba(124,124,230,0.06)] overflow-hidden">
          {/* Perforated Top Edge SVG Sawtooth / Scallop */}
          <div className="w-full overflow-hidden leading-none select-none bg-[#FAFAFE]">
            <svg
              viewBox="0 0 400 8"
              className="w-full h-2 text-white fill-current"
              preserveAspectRatio="none"
            >
              <path d="M0,0 L0,4 Q10,8 20,4 Q30,8 40,4 Q50,8 60,4 Q70,8 80,4 Q90,8 100,4 Q110,8 120,4 Q130,8 140,4 Q150,8 160,4 Q170,8 180,4 Q190,8 200,4 Q210,8 220,4 Q230,8 240,4 Q250,8 260,4 Q270,8 280,4 Q290,8 300,4 Q310,8 320,4 Q330,8 340,4 Q350,8 360,4 Q370,8 380,4 Q390,8 395,8 400,4 L400,0 Z" />
            </svg>
          </div>

          {/* Small Perforated Circular Hole Strip */}
          <div className="flex justify-between items-center px-4 py-0.5 opacity-25 select-none overflow-hidden">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-[#7C7CE6] shrink-0 mx-0.5"
              />
            ))}
          </div>

          {/* Receipt Header */}
          <div className="px-4 sm:px-5 pt-0.5 pb-1.5 text-center">
            <div className="flex items-center justify-center gap-1.5 text-[#7C7CE6]">
              <Sparkles size={11} className="text-[#7C7CE6]" />
              <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.22em] text-[#5F5ED4]">
                FINAI · BUKTI TRANSAKSI
              </span>
              <Sparkles size={11} className="text-[#7C7CE6]" />
            </div>
            {/* Dotted Divider */}
            <div className="border-b border-dashed border-[#DDD9F8] mt-1.5" />
          </div>

          {/* Receipt Body: 5 Key-Value Rows with dotted dividers */}
          <div className="px-4 sm:px-5 divide-y divide-dashed divide-black/[0.07] text-[11px] sm:text-xs">
            {/* Row 1: Tanggal */}
            <div className="py-1.5 sm:py-2 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-[#757A95]">
                <div className="w-6 h-6 rounded-lg bg-[#EDEAFC] text-[#7C7CE6] flex items-center justify-center shrink-0">
                  <Calendar size={12} />
                </div>
                <span className="font-medium">Tanggal</span>
              </div>
              <span className="font-bold text-[#242636] text-right">
                {transaction.date || '30 Agustus 2026'}
              </span>
            </div>

            {/* Row 2: Waktu */}
            <div className="py-1.5 sm:py-2 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-[#757A95]">
                <div className="w-6 h-6 rounded-lg bg-[#EDEAFC] text-[#7C7CE6] flex items-center justify-center shrink-0">
                  <Clock size={12} />
                </div>
                <span className="font-medium">Waktu</span>
              </div>
              <span className="font-bold text-[#242636] text-right">
                {transaction.time || '18:42'}
              </span>
            </div>

            {/* Row 3: Dompet / Sumber Dana */}
            <div className="py-1.5 sm:py-2 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-[#757A95]">
                <div className="w-6 h-6 rounded-lg bg-[#EDEAFC] text-[#7C7CE6] flex items-center justify-center shrink-0">
                  <WalletIcon size={12} />
                </div>
                <span className="font-medium">Dompet</span>
              </div>
              <span className="font-bold text-[#242636] text-right truncate max-w-[200px]">
                {paymentSource}
              </span>
            </div>

            {/* Row 4: Kategori */}
            <div className="py-1.5 sm:py-2 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-[#757A95]">
                <div className="w-6 h-6 rounded-lg bg-[#EDEAFC] text-[#7C7CE6] flex items-center justify-center shrink-0">
                  <Tag size={12} />
                </div>
                <span className="font-medium">Kategori</span>
              </div>
              <span className="font-bold text-[#242636] text-right">
                {formatCategoryLabel(transaction.category)}
              </span>
            </div>

            {/* Row 5: Catatan */}
            <div className="py-1.5 sm:py-2 flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 text-[#757A95] shrink-0 pt-0.5">
                <div className="w-6 h-6 rounded-lg bg-[#EDEAFC] text-[#7C7CE6] flex items-center justify-center shrink-0">
                  <FileText size={12} />
                </div>
                <span className="font-medium">Catatan</span>
              </div>
              <span className="font-bold text-[#242636] text-right leading-snug max-w-[220px]">
                {transaction.note || 'Belanja sayur, buah, dan kebutuhan dapur'}
              </span>
            </div>
          </div>

          {/* Receipt Bottom Details & Stamp */}
          <div className="px-4 sm:px-5 pt-0.5 pb-2">
            <div className="border-b border-dashed border-[#DDD9F8] mb-2" />
            <div className="flex items-center justify-between">
              {/* Left: Transaction ID */}
              <div className="text-left">
                <span className="block text-[8px] font-extrabold uppercase tracking-widest text-[#757A95]">
                  TRANSACTION ID
                </span>
                <span className="font-mono text-[10px] sm:text-[11px] font-bold text-[#242636]">
                  {transactionId}
                </span>
              </div>

              {/* Center: FinAI Seal Stamp with cancellation waves */}
              <div className="flex items-center gap-1 select-none">
                {/* Left Wavy Lines */}
                <svg
                  width="18"
                  height="10"
                  viewBox="0 0 24 14"
                  fill="none"
                  className="text-[#7C7CE6]/50 stroke-current hidden sm:block"
                >
                  <path
                    d="M0 3.5C4 1 8 6 12 3.5C16 1 20 6 24 3.5"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                  <path
                    d="M0 7C4 4.5 8 9.5 12 7C16 4.5 20 9.5 24 7"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                  <path
                    d="M0 10.5C4 8 8 13 12 10.5C16 8 20 13 24 10.5"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                </svg>

                {/* Circular Scalloped Rosette Seal */}
                <div className="w-7 h-7 rounded-full bg-[#EDEAFC] border-2 border-dashed border-[#7C7CE6] flex items-center justify-center shadow-xs">
                  <span className="font-black text-[11px] text-[#5F5ED4]">
                    F
                  </span>
                </div>

                {/* Right Wavy Lines */}
                <svg
                  width="18"
                  height="10"
                  viewBox="0 0 24 14"
                  fill="none"
                  className="text-[#7C7CE6]/50 stroke-current hidden sm:block"
                >
                  <path
                    d="M0 3.5C4 1 8 6 12 3.5C16 1 20 6 24 3.5"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                  <path
                    d="M0 7C4 4.5 8 9.5 12 7C16 4.5 20 9.5 24 7"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                  <path
                    d="M0 10.5C4 8 8 13 12 10.5C16 8 20 13 24 10.5"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              {/* Right: Recorded By FinAI */}
              <div className="text-right">
                <span className="block text-[8px] font-extrabold uppercase tracking-widest text-[#757A95]">
                  DICATAT OLEH
                </span>
                <span className="text-[10px] sm:text-[11px] font-bold text-[#5F5ED4] flex items-center justify-end gap-1">
                  FinAI <Sparkles size={10} className="text-[#7C7CE6]" />
                </span>
              </div>
            </div>
          </div>

          {/* Perforated Bottom Edge SVG Sawtooth / Scallop */}
          <div className="w-full overflow-hidden leading-none select-none bg-[#FAFAFE]">
            <svg
              viewBox="0 0 400 8"
              className="w-full h-2 text-white fill-current"
              preserveAspectRatio="none"
            >
              <path d="M0,8 L0,4 Q10,0 20,4 Q30,0 40,4 Q50,0 60,4 Q70,0 80,4 Q90,0 100,4 Q110,0 120,4 Q130,0 140,4 Q150,0 160,4 Q170,0 180,4 Q190,0 200,4 Q210,0 220,4 Q230,0 240,4 Q250,0 260,4 Q270,0 280,4 Q290,0 300,4 Q310,0 320,4 Q330,0 340,4 Q350,0 360,4 Q370,0 380,4 Q390,0 395,0 400,4 L400,8 Z" />
            </svg>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* FOOTER ACTION BUTTONS: EDIT TRANSAKSI & HAPUS TRANSAKSI                   */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-2 gap-2.5 pt-0.5">
          {/* Edit Button: Soft Lavender */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onEdit(transaction);
            }}
            className="py-2.5 px-4 rounded-xl bg-[#EDEAFC] hover:bg-[#E4E2FB] text-[#5F5ED4] font-bold text-xs sm:text-[13px] flex items-center justify-center gap-1.5 border border-[#7C7CE6]/25 transition-all shadow-2xs cursor-pointer active:scale-[0.98]"
          >
            <Pencil size={14} />
            <span>Edit Transaksi</span>
          </button>

          {/* Delete Button: Soft Peach / Coral */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onDelete(transaction);
            }}
            className="py-2.5 px-4 rounded-xl bg-[#FCE2E0] hover:bg-[#FAD0CD] text-[#B83A38] font-bold text-xs sm:text-[13px] flex items-center justify-center gap-1.5 border border-[#FAC2BE] transition-all shadow-2xs cursor-pointer active:scale-[0.98]"
          >
            <Trash2 size={14} />
            <span>Hapus Transaksi</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}
