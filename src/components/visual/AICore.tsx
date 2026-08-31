'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { AICoreState } from '@/types';

interface AICoreProps {
  state?: AICoreState;
  className?: string;
}

export default function AICore({
  state = 'idle',
  className = '',
}: AICoreProps) {
  const getGlowColor = () => {
    switch (state) {
      case 'thinking':
        return 'from-[#7C7CE6]/35 via-[#E4E2FB]/40 to-[#7C7CE6]/20';
      case 'responding':
        return 'from-[#D0EFE5]/45 via-[#BCE6D9]/40 to-[#7C7CE6]/20';
      default:
        return 'from-[#7C7CE6]/20 via-[#E4E2FB]/30 to-[#D6E4FA]/20';
    }
  };

  const getCoreColor = () => {
    switch (state) {
      case 'thinking':
        return 'radial-gradient(circle at 35% 30%, #FFFFFF 0%, #E4E2FB 40%, #7C7CE6 80%, #6362D8 100%)';
      case 'responding':
        return 'radial-gradient(circle at 35% 30%, #FFFFFF 0%, #D0EFE5 40%, #50B89C 80%, #1B7354 100%)';
      default:
        return 'radial-gradient(circle at 35% 30%, #FFFFFF 0%, #E4E2FB 45%, #7C7CE6 80%, #8C8BE8 100%)';
    }
  };

  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      {/* Background Ambient Glow */}
      <motion.div
        animate={{
          scale: state === 'thinking' ? [1, 1.15, 1] : [1, 1.05, 1],
          opacity: state === 'thinking' ? [0.6, 0.9, 0.6] : [0.4, 0.6, 0.4],
        }}
        transition={{
          duration: state === 'thinking' ? 1.5 : 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className={`absolute w-56 h-56 rounded-full bg-gradient-to-tr ${getGlowColor()} blur-3xl transition-colors duration-500`}
      />

      {/* Radial Wave Burst (when responding) */}
      <AnimatePresence>
        {state === 'responding' && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0.8 }}
            animate={{ scale: 1.6, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
            className="absolute w-44 h-44 rounded-full border-2 border-[#D0EFE5] pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Main Core Assembly */}
      <motion.div
        animate={{
          y: state === 'thinking' ? [-4, 4, -4] : [-6, 6, -6],
          scale: state === 'thinking' ? [0.98, 1.04, 0.98] : [1, 1.02, 1],
        }}
        transition={{
          duration: state === 'thinking' ? 2 : 5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="relative w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center"
      >
        {/* Orbital Energy Rings */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: state === 'thinking' ? 8 : 24,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute inset-0 rounded-full border border-[#7C7CE6]/25 border-dashed pointer-events-none"
        />

        <motion.div
          animate={{ rotate: -360 }}
          transition={{
            duration: state === 'thinking' ? 12 : 32,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute inset-4 rounded-full border border-white/70 pointer-events-none shadow-[0_0_15px_rgba(124,124,230,0.08)]"
        />

        {/* Central Luminous Orb */}
        <div
          className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-full backdrop-blur-xl border border-white/90 shadow-[0_16px_45px_-8px_rgba(124,124,230,0.3),inset_0_0_25px_rgba(255,255,255,0.8)] flex items-center justify-center transition-all duration-500 overflow-hidden"
          style={{ background: getCoreColor() }}
        >
          {/* Inner Morphing Shape */}
          <motion.div
            animate={{
              rotate: state === 'thinking' ? 360 : [0, 90, 180, 270, 360],
              scale: state === 'thinking' ? [0.85, 1.1, 0.85] : [0.9, 1.02, 0.9],
            }}
            transition={{
              duration: state === 'thinking' ? 3 : 12,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="w-16 h-16 rounded-2xl bg-white/40 backdrop-blur-sm border border-white/60 flex items-center justify-center shadow-inner"
          >
            <Sparkles
              size={20}
              className={`transition-colors duration-500 ${
                state === 'thinking'
                  ? 'text-[#7C7CE6] animate-spin'
                  : state === 'responding'
                  ? 'text-[#1B7354]'
                  : 'text-white'
              }`}
            />
          </motion.div>

          {/* Specular Highlight Sheen */}
          <div className="absolute top-3 left-4 w-12 h-12 rounded-full bg-gradient-to-b from-white to-transparent opacity-80 blur-[1px] pointer-events-none" />
        </div>
      </motion.div>
    </div>
  );
}
