'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';

interface AddWalletCardProps {
  onClick: () => void;
}

export default function AddWalletCard({ onClick }: AddWalletCardProps) {
  return (
    <motion.button
      type="button"
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      onClick={onClick}
      className="relative w-full min-w-[280px] sm:min-w-[320px] rounded-[26px] p-6 bg-white/70 hover:bg-white/95 border-2 border-dashed border-[#7C7CE6]/30 hover:border-[#7C7CE6] shadow-[0_8px_30px_rgba(48,51,74,0.03)] hover:shadow-[0_14px_40px_rgba(124,124,230,0.12)] cursor-pointer overflow-hidden flex flex-col items-center justify-center text-center select-none min-h-[195px] transition-colors group"
    >
      <div className="w-13 h-13 rounded-2xl bg-[#E4E2FB] text-[#7C7CE6] flex items-center justify-center mb-3 shadow-xs group-hover:scale-110 group-hover:bg-[#7C7CE6] group-hover:text-white transition-all">
        <Plus size={24} strokeWidth={2.5} />
      </div>
      <h4 className="text-base font-bold text-[#242636] group-hover:text-[#7C7CE6] transition-colors">
        Tambah Dompet Baru
      </h4>
      <p className="text-xs text-[#757A95] mt-1 max-w-[200px] leading-relaxed">
        Hubungkan rekening bank, e-wallet, tabungan, atau uang tunai.
      </p>
    </motion.button>
  );
}
