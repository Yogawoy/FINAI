'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
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
    <div className="w-full flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* ===================================================================== */}
      {/* MAIN AUTH CONTAINER: 1100-1250px Width, 680-740px Height               */}
      {/* ===================================================================== */}
      <div className="relative w-full max-w-[1160px] bg-white rounded-[28px] sm:rounded-[32px] border border-[#E8EAF2] shadow-[0_30px_70px_-15px_rgba(36,38,54,0.12),0_10px_35px_rgba(124,124,230,0.08)] overflow-hidden">
        
        {/* =================================================================== */}
        {/* 1. DESKTOP SLIDING LAYOUT (LG & UP: 1024px+)                         */}
        {/* =================================================================== */}
        <div className="hidden lg:block relative w-full h-[690px] xl:h-[720px]">
          {/* Panel A: Illustration Panel (Slides Left <-> Right) */}
          <motion.div
            initial={false}
            animate={{
              left: isLogin ? '0%' : '50%',
            }}
            style={{
              left: isLogin ? '0%' : '50%',
            }}
            transition={{
              duration: 0.6,
              ease: [0.65, 0, 0.35, 1], // Custom smooth easeInOut
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
              duration: 0.6,
              ease: [0.65, 0, 0.35, 1],
            }}
            className="absolute top-0 bottom-0 w-1/2 h-full z-10 bg-white flex items-center justify-center overflow-y-auto no-scrollbar"
          >
            <AnimatePresence mode="wait">
              {isLogin ? (
                <motion.div
                  key="login-form-view"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.32, ease: 'easeOut' }}
                  className="w-full"
                >
                  <LoginForm onSwitchToRegister={handleSwitchToRegister} />
                </motion.div>
              ) : (
                <motion.div
                  key="register-form-view"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.32, ease: 'easeOut' }}
                  className="w-full"
                >
                  <RegisterForm onSwitchToLogin={handleSwitchToLogin} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* =================================================================== */}
        {/* 2. MOBILE & TABLET LAYOUT (< 1024px: VERTICAL COMPACT STACK)        */}
        {/* =================================================================== */}
        <div className="lg:hidden flex flex-col w-full">
          {/* Top Compact Illustration Header */}
          <div className="relative w-full h-56 sm:h-64 overflow-hidden rounded-t-[28px] sm:rounded-t-[32px]">
            <AuthIllustration mode={mode} />
          </div>

          {/* Bottom Form Area */}
          <div className="p-6 sm:p-8 bg-white">
            <AnimatePresence mode="wait">
              {isLogin ? (
                <motion.div
                  key="mobile-login"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.28 }}
                >
                  <LoginForm onSwitchToRegister={handleSwitchToRegister} />
                </motion.div>
              ) : (
                <motion.div
                  key="mobile-register"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.28 }}
                >
                  <RegisterForm onSwitchToLogin={handleSwitchToLogin} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
