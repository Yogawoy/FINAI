'use client';

import React, { useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface FinancialCoreProps {
  size?: 'sm' | 'md' | 'lg' | 'hero';
  className?: string;
}

export default function FinancialCore({
  size = 'hero',
  className = '',
}: FinancialCoreProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Mouse tilt tracking physics with spring smoothing
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [14, -14]), {
    stiffness: 150,
    damping: 20,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-14, 14]), {
    stiffness: 150,
    damping: 20,
  });

  const highlightX = useTransform(mouseX, [-0.5, 0.5], ['20%', '60%']);
  const highlightY = useTransform(mouseY, [-0.5, 0.5], ['15%', '45%']);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-40 h-40';
      case 'md':
        return 'w-60 h-60';
      case 'lg':
        return 'w-72 h-72 sm:w-80 sm:h-80';
      default: // hero
        return 'w-72 h-72 sm:w-96 sm:h-96';
    }
  };

  return (
    <div
      className={`relative flex items-center justify-center select-none ${className}`}
      style={{ perspective: 1200 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      {/* ========================================================================= */}
      {/* LAYER 1: MULTI-LAYER AMBIENT RADIAL GLOW & LIGHT FIELD                   */}
      {/* ========================================================================= */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10">
        <motion.div
          animate={{
            scale: [1, 1.08, 1],
            opacity: [0.55, 0.75, 0.55],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="w-[120%] h-[120%] rounded-full bg-gradient-to-tr from-[#7C7CE6]/25 via-[#E4E2FB]/40 to-[#D0EFE5]/30 blur-3xl"
        />
        <div className="absolute w-[80%] h-[80%] rounded-full bg-gradient-to-bl from-[#D6E4FA]/40 via-white/50 to-[#FCE2E0]/20 blur-2xl" />
      </div>

      {/* ========================================================================= */}
      {/* PERSPECTIVE TILT WRAPPER (Tilted by cursor)                              */}
      {/* ========================================================================= */}
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        animate={{
          y: [-6, 6, -6],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className={`relative ${getSizeClasses()} flex items-center justify-center cursor-pointer`}
      >
        {/* ======================================================================= */}
        {/* LAYER 6: OUTER ORBITAL RINGS & ENERGY RAYS (CSS / SVG)                  */}
        {/* ======================================================================= */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 32, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-[-14%] rounded-full border border-[#7C7CE6]/20 border-dashed pointer-events-none"
          style={{ transform: 'translateZ(10px)' }}
        />

        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 42, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-[-24%] rounded-full border border-white/60 pointer-events-none shadow-[0_0_20px_rgba(124,124,230,0.06)]"
          style={{ transform: 'translateZ(5px)' }}
        >
          {/* Orbital floating energy nodes */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white border border-[#7C7CE6]/40 shadow-[0_2px_8px_rgba(124,124,230,0.35)] flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-[#7C7CE6]" />
          </div>
          <div className="absolute bottom-4 right-8 w-2.5 h-2.5 rounded-full bg-[#D0EFE5] border border-[#1B7354]/30 shadow-xs" />
        </motion.div>

        {/* ======================================================================= */}
        {/* LAYER 5: SOFT AMBIENT BASE DROP SHADOW                                  */}
        {/* ======================================================================= */}
        <div className="absolute -bottom-8 w-3/4 h-8 rounded-full bg-[#242636]/[0.07] blur-xl" />

        {/* ======================================================================= */}
        {/* LAYER 2 & 3: OPALESCENT GLASS SPHERE & NUCLEUS                          */}
        {/* ======================================================================= */}
        <div
          className="relative w-full h-full rounded-full overflow-hidden backdrop-blur-xl border border-white/90 shadow-[0_20px_60px_-10px_rgba(124,124,230,0.25),inset_0_0_40px_rgba(255,255,255,0.8)] flex items-center justify-center transition-shadow duration-500"
          style={{
            background: 'radial-gradient(circle at 35% 30%, rgba(255, 255, 255, 0.95) 0%, rgba(228, 226, 251, 0.75) 45%, rgba(124, 124, 230, 0.55) 85%, rgba(140, 139, 232, 0.7) 100%)',
            transform: 'translateZ(30px)',
          }}
        >
          {/* Internal Geometric Energy Refraction (SVG) */}
          <motion.svg
            animate={{ rotate: 360 }}
            transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
            viewBox="0 0 200 200"
            className="absolute inset-4 w-auto h-auto opacity-45 mix-blend-overlay pointer-events-none"
          >
            <polygon
              points="100,20 170,60 170,140 100,180 30,140 30,60"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="1.5"
            />
            <polygon
              points="100,45 150,75 150,125 100,155 50,125 50,75"
              fill="none"
              stroke="#D0EFE5"
              strokeWidth="1.2"
            />
            <circle cx="100" cy="100" r="35" fill="none" stroke="#E4E2FB" strokeWidth="1" strokeDasharray="3 3" />
          </motion.svg>

          {/* Internal Glowing Nucleus */}
          <motion.div
            animate={{
              scale: [0.92, 1.06, 0.92],
              rotate: [0, 45, 0],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-tr from-[#7C7CE6] via-[#D0EFE5] to-white opacity-85 blur-sm flex items-center justify-center shadow-[inset_0_0_20px_rgba(255,255,255,0.9)]"
            style={{ transform: 'translateZ(50px)' }}
          />

          {/* ===================================================================== */}
          {/* LAYER 4: SPECULAR CRESCENT HIGHLIGHT SHEEN                            */}
          {/* ===================================================================== */}
          <motion.div
            style={{
              top: highlightY,
              left: highlightX,
            }}
            className="absolute w-2/5 h-2/5 rounded-full bg-gradient-to-b from-white to-white/0 opacity-90 blur-[1px] pointer-events-none"
          />

          {/* Bottom iridescent rim reflex */}
          <div className="absolute inset-x-6 bottom-3 h-10 rounded-full bg-gradient-to-t from-[#D0EFE5]/50 to-transparent blur-md pointer-events-none" />
        </div>
      </motion.div>
    </div>
  );
}
