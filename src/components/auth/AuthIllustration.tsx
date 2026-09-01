'use client';

import React from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import AuthBrand from './AuthBrand';

interface AuthIllustrationProps {
  mode: 'login' | 'register';
  className?: string;
}

export default function AuthIllustration({
  mode,
  className = '',
}: AuthIllustrationProps) {
  const isLogin = mode === 'login';

  return (
    <div
      className={`relative w-full h-full flex flex-col justify-between overflow-hidden bg-gradient-to-b from-[#F2F3FD] via-[#ECEAFD] to-[#DFE3FA] select-none ${className}`}
    >
      {/* Decorative ambient glow circles */}
      <div className="absolute -top-16 -left-16 w-72 h-72 rounded-full bg-[#E4E2FB]/70 blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-16 w-80 h-80 rounded-full bg-[#D6E4FA]/60 blur-3xl pointer-events-none" />

      {/* ========================================================================= */}
      {/* 1. TOP SECTION: BRAND & HEADLINE COPY                                     */}
      {/* ========================================================================= */}
      <div className="relative z-20 p-8 sm:p-10 lg:p-12 space-y-6">
        {/* Brand */}
        <AuthBrand />

        {/* Dynamic Headline & Subtitle with smooth crossfade */}
        <div className="pt-2">
          <AnimatePresence mode="wait">
            {isLogin ? (
              <motion.div
                key="login-heading"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="space-y-3"
              >
                <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-extrabold text-[#242636] tracking-tight leading-[1.18]">
                  Kelola keuangan <br />
                  <span className="text-[#7C7CE6]">lebih cerdas</span> <br />
                  bersama FinAI
                </h2>
                <p className="text-xs sm:text-sm text-[#757A95] leading-relaxed max-w-sm font-normal">
                  Catat, analisis, dan rencanakan keuanganmu dengan bantuan AI yang memahami kebutuhanmu.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="register-heading"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="space-y-3"
              >
                <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-extrabold text-[#242636] tracking-tight leading-[1.18]">
                  Mulai perjalanan <br />
                  <span className="text-[#7C7CE6]">finansial yang</span> <br />
                  lebih baik
                </h2>
                <p className="text-xs sm:text-sm text-[#757A95] leading-relaxed max-w-sm font-normal">
                  Catat, analisis, dan rencanakan keuanganmu dengan bantuan AI yang memahami kebutuhanmu.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. FLYING BIRDS IN PASTEL SKY (SUBTLE FLOATING ANIMATION)                  */}
      {/* ========================================================================= */}
      <div className="absolute top-[40%] right-[18%] z-20 pointer-events-none opacity-75">
        <motion.div
          animate={{ x: [0, 6, 0], y: [0, -3, 0] }}
          transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut' }}
          className="flex items-center gap-2.5"
        >
          {/* Bird 1 */}
          <svg width="20" height="11" viewBox="0 0 18 10" fill="none" className="text-[#3D3E64]">
            <path
              d="M1 7C4.5 2 7 2 9 6C11 2 13.5 2 17 7"
              stroke="currentColor"
              strokeWidth="1.9"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {/* Bird 2 */}
          <svg width="14" height="8" viewBox="0 0 18 10" fill="none" className="text-[#52547E] -mt-2">
            <path
              d="M1 7C4.5 2 7 2 9 6C11 2 13.5 2 17 7"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.div>
      </div>

      {/* ========================================================================= */}
      {/* 3. BOTTOM ILLUSTRATION: MISTY MOUNTAINS & DEER HILL                       */}
      {/* ========================================================================= */}
      <div className="relative w-full h-[52%] sm:h-[55%] mt-auto z-10">
        <Image
          src="/images/auth-landscape.jpg"
          alt="FinAI Serene Landscape"
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover object-bottom"
        />

        {/* Top subtle vertical gradient to blend landscape sky seamlessly into panel background */}
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#ECEAFD] via-[#ECEAFD]/80 to-transparent pointer-events-none" />
      </div>

      {/* ========================================================================= */}
      {/* 4. ORGANIC S-CURVE BORDER DIVIDER (MATCHES SCREENSHOT REFERENCE)          */}
      {/* ========================================================================= */}
      {/* When in Login mode, the white wave sits on the right edge of the illustration */}
      {isLogin && (
        <div className="hidden lg:block absolute right-0 top-0 bottom-0 w-14 sm:w-16 z-25 pointer-events-none">
          <svg
            className="h-full w-full fill-white"
            viewBox="0 0 100 800"
            preserveAspectRatio="none"
          >
            <path d="M100,0 L35,0 C75,170 5,330 65,490 C100,610 30,710 70,800 L100,800 Z" />
          </svg>
        </div>
      )}

      {/* When in Register mode, the white wave sits on the left edge of the illustration */}
      {!isLogin && (
        <div className="hidden lg:block absolute left-0 top-0 bottom-0 w-14 sm:w-16 z-25 pointer-events-none scale-x-[-1]">
          <svg
            className="h-full w-full fill-white"
            viewBox="0 0 100 800"
            preserveAspectRatio="none"
          >
            <path d="M100,0 L35,0 C75,170 5,330 65,490 C100,610 30,710 70,800 L100,800 Z" />
          </svg>
        </div>
      )}
    </div>
  );
}
