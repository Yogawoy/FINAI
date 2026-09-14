'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ShieldCheck } from 'lucide-react';
import AuthIllustration from './AuthIllustration';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

interface AuthTransitionProps {
  initialMode?: 'login' | 'register';
  onModeChange?: (mode: 'login' | 'register') => void;
}

export default function AuthTransition({
  initialMode = 'login',
  onModeChange,
}: AuthTransitionProps) {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  // Sync mode with initialMode if props change externally
  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  const handleSwitchToRegister = () => {
    setMode('register');
    if (onModeChange) onModeChange('register');
    router.push('/register');
  };

  const handleSwitchToLogin = () => {
    setMode('login');
    if (onModeChange) onModeChange('login');
    router.push('/login');
  };

  const isLogin = mode === 'login';

  return (
    <div className="w-full flex items-center justify-center p-3 sm:p-6 lg:p-8">
      {/* ===================================================================== */}
      {/* 1. DESKTOP DUAL-PANEL LAYOUT (LG & UP: 1024px+)                       */}
      {/* ===================================================================== */}
      <div className="hidden lg:block relative w-full max-w-[1100px] h-[700px] bg-white rounded-[32px] border border-[#E8EAF2] shadow-[0_25px_60px_-15px_rgba(36,38,54,0.08),0_10px_30px_rgba(124,124,230,0.06)] overflow-hidden">
        {/* Panel A: Visual Showcase Panel (Slides Left <-> Right) */}
        <motion.div
          initial={false}
          animate={{
            left: isLogin ? '0%' : '50%',
          }}
          style={{
            left: isLogin ? '0%' : '50%',
          }}
          transition={{
            duration: 0.55,
            ease: [0.65, 0, 0.35, 1],
          }}
          className="absolute top-0 bottom-0 w-1/2 h-full z-20 overflow-hidden"
        >
          <AuthIllustration mode={mode} />
        </motion.div>

        {/* Panel B: Form Panel (Slides Right <-> Left) */}
        <motion.div
          initial={false}
          animate={{
            left: isLogin ? '50%' : '0%',
          }}
          style={{
            left: isLogin ? '50%' : '0%',
          }}
          transition={{
            duration: 0.55,
            ease: [0.65, 0, 0.35, 1],
          }}
          className="absolute top-0 bottom-0 w-1/2 h-full z-10 bg-white flex flex-col items-center justify-center overflow-y-auto no-scrollbar py-8"
        >
          {/* Segmented Switcher Tab */}
          <div className="w-full max-w-sm px-6 mb-2">
            <div className="bg-[#F4F5FB] p-1 rounded-2xl flex border border-[#E6E8F2]">
              <button
                type="button"
                onClick={handleSwitchToLogin}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                  isLogin
                    ? 'bg-white text-[#242636] shadow-xs'
                    : 'text-[#757A95] hover:text-[#242636]'
                }`}
              >
                Masuk
              </button>
              <button
                type="button"
                onClick={handleSwitchToRegister}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                  !isLogin
                    ? 'bg-white text-[#242636] shadow-xs'
                    : 'text-[#757A95] hover:text-[#242636]'
                }`}
              >
                Daftar Akun
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {isLogin ? (
              <motion.div
                key="desktop-login-view"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="w-full"
              >
                <LoginForm onSwitchToRegister={handleSwitchToRegister} />
              </motion.div>
            ) : (
              <motion.div
                key="desktop-register-view"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="w-full"
              >
                <RegisterForm onSwitchToLogin={handleSwitchToLogin} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* ===================================================================== */}
      {/* 2. MOBILE & TABLET APK LAYOUT (< 1024px: ULTRA CLEAN NATIVE APP)      */}
      {/* ===================================================================== */}
      <div className="lg:hidden w-full max-w-md mx-auto space-y-4">
        {/* App Header Bar */}
        <div className="text-center pt-2 pb-1 space-y-2">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#7C7CE6] via-[#8C8BE8] to-[#D6E4FA] items-center justify-center shadow-[0_8px_20px_rgba(124,124,230,0.25)]">
            <Sparkles size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black text-[#242636] tracking-tight">FinAI</h1>
            <p className="text-xs text-[#757A95] font-medium">Spatial Finance & Personal Budgeting</p>
          </div>
        </div>

        {/* Segmented Mode Switcher Tab (Masuk / Daftar) */}
        <div className="bg-[#F0F2FA] p-1.5 rounded-2xl flex border border-[#E2E4F0] shadow-2xs">
          <button
            type="button"
            onClick={handleSwitchToLogin}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
              isLogin
                ? 'bg-white text-[#242636] shadow-xs'
                : 'text-[#757A95] hover:text-[#242636]'
            }`}
          >
            Masuk
          </button>
          <button
            type="button"
            onClick={handleSwitchToRegister}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
              !isLogin
                ? 'bg-white text-[#242636] shadow-xs'
                : 'text-[#757A95] hover:text-[#242636]'
            }`}
          >
            Daftar Baru
          </button>
        </div>

        {/* Main Clean Form Card */}
        <div className="bg-white rounded-3xl border border-[#E8EAF2] shadow-[0_15px_40px_-10px_rgba(36,38,54,0.06)] p-5 sm:p-7">
          <AnimatePresence mode="wait">
            {isLogin ? (
              <motion.div
                key="mobile-login"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.22 }}
              >
                <LoginForm onSwitchToRegister={handleSwitchToRegister} />
              </motion.div>
            ) : (
              <motion.div
                key="mobile-register"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.22 }}
              >
                <RegisterForm onSwitchToLogin={handleSwitchToLogin} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Security / Privacy Trust Badge */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#8A8FA8] font-medium pt-1 pb-4">
          <ShieldCheck size={14} className="text-[#1B7354]" />
          <span>Enkripsi Standar Perbankan • Privasi Terlindungi</span>
        </div>
      </div>
    </div>
  );
}
