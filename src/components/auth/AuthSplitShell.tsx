'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import LoginIllustration from './LoginIllustration';
import RegisterIllustration from './RegisterIllustration';
import LoginFormCard from './LoginFormCard';
import RegisterFormCard from './RegisterFormCard';

type Lang = 'id' | 'en';

const HERO_COPY = {
  login: {
    id: {
      tagline: 'Kelola Keuangan Pribadi',
      line1: 'Kelola Keuangan',
      line2: 'Lebih Cerdas',
      line3: 'Dengan FinAI.',
    },
    en: {
      tagline: 'Smart Personal Finance',
      line1: 'Manage Your',
      line2: 'Finances Smarter',
      line3: 'With FinAI.',
    },
  },
  register: {
    id: {
      tagline: 'Kelola Keuangan Pribadi',
      line1: 'Mulai Langkah',
      line2: 'Finansial Terarah',
      line3: 'Bersama FinAI.',
    },
    en: {
      tagline: 'Smart Personal Finance',
      line1: 'Start Your',
      line2: 'Smarter Financial',
      line3: 'Journey Today.',
    },
  },
} as const;

export default function AuthSplitShell() {
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();
  const [lang, setLang] = useState<Lang>('id');

  const isRegister = pathname?.startsWith('/register') ?? false;
  const mode = isRegister ? 'register' : 'login';
  const hero = HERO_COPY[mode][lang];

  // Lock viewport scroll completely while on /login or /register
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    const prevHtmlOverscroll = html.style.overscrollBehavior;
    const prevBodyOverscroll = body.style.overscrollBehavior;

    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    html.style.overscrollBehavior = 'none';
    body.style.overscrollBehavior = 'none';

    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
      html.style.overscrollBehavior = prevHtmlOverscroll;
      body.style.overscrollBehavior = prevBodyOverscroll;
    };
  }, []);

  const springTransition = prefersReducedMotion
    ? { duration: 0.15 }
    : { type: 'spring' as const, stiffness: 260, damping: 28, mass: 0.9 };

  const contentTransition = prefersReducedMotion
    ? { duration: 0.12 }
    : { duration: 0.24, ease: [0.22, 1, 0.36, 1] as const };

  return (
    <div className="fixed inset-0 h-[100dvh] w-full overflow-hidden overscroll-none bg-[#F6F7FB] flex items-center justify-center p-3 sm:p-6">
      {/* Desktop Animated Split Card (lg+) */}
      <div className="hidden lg:block relative w-full max-w-[1000px] h-[min(570px,calc(100dvh-3rem))] rounded-[32px] bg-gradient-to-br from-[#898BF7] via-[#7E80F2] to-[#7274EA] shadow-[0_24px_70px_rgba(36,38,54,0.12)] overflow-hidden">
        {/* Sliding Purple Visual & Illustration Panel */}
        <motion.div
          initial={false}
          animate={{ left: isRegister ? '58.3333%' : '0%' }}
          transition={springTransition}
          className="absolute top-0 bottom-0 w-[41.6667%] px-8 pt-8 pb-5 flex flex-col justify-between text-white z-0"
        >
          <div className="space-y-7">
            {/* Brand Header */}
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 group select-none"
            >
              <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-xs border border-white/30 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                <Sparkles size={18} className="text-white" />
              </div>
              <div>
                <span className="font-black tracking-tight text-lg leading-none block text-white">
                  FinAI
                </span>
                <span className="text-[10px] font-medium text-white/80 block mt-0.5 leading-none">
                  {hero.tagline}
                </span>
              </div>
            </Link>

            {/* Animated Hero Headline */}
            <AnimatePresence mode="wait" initial={false}>
              <motion.h2
                key={`hero-${mode}-${lang}`}
                initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
                transition={contentTransition}
                className="text-[30px] font-extrabold leading-[1.22] tracking-tight text-white"
              >
                {hero.line1}
                <br />
                <span className="inline-flex items-center gap-2">
                  <span>{hero.line2}</span>
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-white/20 border border-white/35 text-xs shadow-xs">
                    <Sparkles size={14} className="text-[#FFE082]" />
                  </span>
                </span>
                <br />
                {hero.line3}
              </motion.h2>
            </AnimatePresence>
          </div>

          {/* Animated Transparent Illustration */}
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={`illus-${mode}`}
              initial={
                prefersReducedMotion
                  ? { opacity: 0 }
                  : { opacity: 0, scale: 0.96, y: 10 }
              }
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={
                prefersReducedMotion
                  ? { opacity: 0 }
                  : { opacity: 0, scale: 0.96, y: -8 }
              }
              transition={contentTransition}
            >
              {isRegister ? <RegisterIllustration /> : <LoginIllustration />}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Sliding White Form Panel with Morphing Curved Corners */}
        <motion.div
          initial={false}
          animate={{
            left: isRegister ? '0%' : '41.6667%',
            borderTopLeftRadius: isRegister ? 0 : 32,
            borderBottomLeftRadius: isRegister ? 0 : 32,
            borderTopRightRadius: isRegister ? 32 : 0,
            borderBottomRightRadius: isRegister ? 32 : 0,
          }}
          transition={springTransition}
          className="absolute top-0 bottom-0 w-[58.3333%] bg-white z-10 px-12 py-8 flex flex-col justify-between shadow-[0_0_40px_rgba(36,38,54,0.08)]"
        >
          <Suspense
            fallback={
              <div className="flex-1 flex items-center justify-center text-xs text-[#757A95]">
                Memuat...
              </div>
            }
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={`form-desktop-${mode}`}
                initial={
                  prefersReducedMotion
                    ? { opacity: 0 }
                    : { opacity: 0, x: isRegister ? -18 : 18 }
                }
                animate={{ opacity: 1, x: 0 }}
                exit={
                  prefersReducedMotion
                    ? { opacity: 0 }
                    : { opacity: 0, x: isRegister ? 18 : -18 }
                }
                transition={contentTransition}
                className="flex-1 flex flex-col justify-between"
              >
                {isRegister ? (
                  <RegisterFormCard lang={lang} onLangChange={setLang} />
                ) : (
                  <LoginFormCard lang={lang} onLangChange={setLang} />
                )}
              </motion.div>
            </AnimatePresence>
          </Suspense>
        </motion.div>
      </div>

      {/* Mobile & Tablet Layout (< lg) */}
      <div className="lg:hidden w-full max-w-[520px] max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-3rem)] rounded-[28px] bg-gradient-to-br from-[#898BF7] via-[#7E80F2] to-[#7274EA] shadow-[0_24px_70px_rgba(36,38,54,0.12)] overflow-hidden flex flex-col">
        {/* Top Accent Header */}
        <div className="px-5 pt-5 pb-4 sm:px-8 sm:pt-7 sm:pb-5 text-white shrink-0">
          <div className="space-y-3.5 sm:space-y-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 group select-none"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white/20 backdrop-blur-xs border border-white/30 flex items-center justify-center shadow-xs">
                <Sparkles size={16} className="text-white" />
              </div>
              <div>
                <span className="font-black tracking-tight text-base sm:text-lg leading-none block text-white">
                  FinAI
                </span>
                <span className="text-[10px] font-medium text-white/80 block mt-0.5 leading-none">
                  {hero.tagline}
                </span>
              </div>
            </Link>

            <AnimatePresence mode="wait" initial={false}>
              <motion.h2
                key={`mobile-hero-${mode}-${lang}`}
                initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
                transition={contentTransition}
                className="text-xl sm:text-2xl font-extrabold leading-[1.2] tracking-tight text-white"
              >
                {hero.line1}
                <br />
                <span className="inline-flex items-center gap-2">
                  <span>{hero.line2}</span>
                  <span className="inline-flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white/20 border border-white/35 text-xs shadow-xs">
                    <Sparkles size={12} className="text-[#FFE082]" />
                  </span>
                </span>
                <br />
                {hero.line3}
              </motion.h2>
            </AnimatePresence>
          </div>
        </div>

        {/* Bottom White Form Card */}
        <div className="bg-white rounded-t-[26px] px-5 py-5 sm:px-9 sm:py-7 flex flex-col flex-1 overflow-hidden">
          <Suspense
            fallback={
              <div className="flex-1 flex items-center justify-center text-xs text-[#757A95]">
                Memuat...
              </div>
            }
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={`form-mobile-${mode}`}
                initial={
                  prefersReducedMotion
                    ? { opacity: 0 }
                    : { opacity: 0, x: isRegister ? 18 : -18 }
                }
                animate={{ opacity: 1, x: 0 }}
                exit={
                  prefersReducedMotion
                    ? { opacity: 0 }
                    : { opacity: 0, x: isRegister ? -18 : 18 }
                }
                transition={contentTransition}
                className="flex-1 flex flex-col justify-between"
              >
                {isRegister ? (
                  <RegisterFormCard lang={lang} onLangChange={setLang} />
                ) : (
                  <LoginFormCard lang={lang} onLangChange={setLang} />
                )}
              </motion.div>
            </AnimatePresence>
          </Suspense>
        </div>
      </div>
    </div>
  );
}
