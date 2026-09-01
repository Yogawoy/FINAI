'use client';

import React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="md:hidden fixed inset-0 bg-black/20 backdrop-blur-xs z-35"
          />

          {/* Drawer container from top */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="md:hidden fixed top-20 inset-x-4 z-40 bg-white rounded-3xl p-6 shadow-[0_20px_45px_rgba(36,38,54,0.14)] border border-[#E8EAF2] space-y-5"
          >
            {/* Nav links */}
            <div className="flex flex-col space-y-3 text-sm font-semibold text-[#757A95]">
              <a
                href="#fitur"
                onClick={onClose}
                className="py-2 px-3 rounded-xl hover:bg-[#F6F7FB] hover:text-[#242636] transition-colors"
              >
                Fitur
              </a>
              <a
                href="#cara-kerja"
                onClick={onClose}
                className="py-2 px-3 rounded-xl hover:bg-[#F6F7FB] hover:text-[#242636] transition-colors"
              >
                Cara Kerja
              </a>
              <a
                href="#ai-assistant"
                onClick={onClose}
                className="py-2 px-3 rounded-xl hover:bg-[#F6F7FB] hover:text-[#242636] transition-colors"
              >
                AI Assistant
              </a>
              <a
                href="#tentang"
                onClick={onClose}
                className="py-2 px-3 rounded-xl hover:bg-[#F6F7FB] hover:text-[#242636] transition-colors"
              >
                Tentang
              </a>
            </div>

            <div className="pt-2 border-t border-[#E8EAF2] flex flex-col gap-2.5">
              <Link
                href="/login"
                onClick={onClose}
                className="w-full py-3 rounded-xl text-center text-xs font-bold text-[#242636] bg-[#F6F7FB] hover:bg-[#EAEBF4] transition-colors"
              >
                Masuk
              </Link>
              <Link
                href="/register"
                onClick={onClose}
                className="w-full py-3 rounded-xl text-center text-xs font-bold text-white bg-[#7C7CE6] hover:bg-[#6A6AD6] shadow-[0_4px_14px_rgba(124,124,230,0.32)] transition-all flex items-center justify-center gap-2"
              >
                <span>Daftar Gratis</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
