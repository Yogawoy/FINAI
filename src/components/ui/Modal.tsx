'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
  hideHeader?: boolean;
  hideCloseButton?: boolean;
  className?: string;
  noPadding?: boolean;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'md',
  hideHeader = false,
  hideCloseButton = false,
  className = '',
  noPadding = false,
}: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const getMaxWidthClass = () => {
    switch (maxWidth) {
      case 'sm':
        return 'max-w-sm';
      case 'lg':
        return 'max-w-xl';
      case 'xl':
        return 'max-w-3xl';
      case '2xl':
        return 'max-w-4xl';
      case '3xl':
        return 'max-w-5xl';
      case '4xl':
        return 'max-w-6xl';
      case '5xl':
        return 'max-w-[1180px]';
      default:
        return 'max-w-md';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
          {/* Lightweight Optimized Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            onClick={onClose}
            className="fixed inset-0 bg-[#1e2030]/35 backdrop-blur-[2px] transform-gpu will-change-[opacity]"
          />

          {/* Snappy Hardware-Accelerated Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className={`relative w-full ${getMaxWidthClass()} bg-white rounded-t-[28px] sm:rounded-[28px] ${
              noPadding ? 'p-0' : 'p-7 sm:p-8'
            } shadow-[0_16px_45px_rgba(20,22,35,0.12)] border border-[#E8E8F5] max-h-[90vh] sm:max-h-[92vh] overflow-y-auto overscroll-contain scrollbar-thin transform-gpu will-change-[transform,opacity] ${className}`}
          >
            {/* Standard Header if not hidden */}
            {!hideHeader && (
              <div className="flex items-start justify-between mb-4">
                <div>
                  {title && (
                    <h3 className="text-lg sm:text-xl font-bold tracking-tight text-[#242636] flex items-center gap-2">
                      {title}
                    </h3>
                  )}
                  {subtitle && (
                    <p className="text-xs text-[#757A95] mt-0.5 font-normal">
                      {subtitle}
                    </p>
                  )}
                </div>
                {!hideCloseButton && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[#757A95] hover:text-[#242636] hover:bg-black/[0.04] transition-colors cursor-pointer shrink-0 ml-3"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            )}

            {/* Custom Top Right Close Button only if Header is hidden and close button is not suppressed */}
            {hideHeader && !hideCloseButton && (
              <button
                type="button"
                onClick={onClose}
                className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full flex items-center justify-center text-[#757A95] hover:text-[#242636] hover:bg-black/[0.04] transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            )}

            {/* Content */}
            <div>{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
