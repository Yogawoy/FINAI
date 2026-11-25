'use client';

import React from 'react';
import { CARD_NOISE_TEXTURE_URI } from '@/lib/walletTheme';

export function CardMaterialLayers({
  enableHoverSweep = true,
}: {
  enableHoverSweep?: boolean;
}) {
  return (
    <>
      {/* 1. Diagonal Specular Light Sheen */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(125deg, rgba(255,255,255,0.24) 0%, rgba(255,255,255,0.04) 38%, transparent 56%, rgba(0,0,0,0.16) 100%)',
        }}
      />

      {/* 2a. Micro-Noise / Brushed Metallic Texture */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.06] mix-blend-overlay pointer-events-none"
        style={{ backgroundImage: CARD_NOISE_TEXTURE_URI }}
      />

      {/* 2b. Guilloché Security Curves */}
      <svg
        aria-hidden="true"
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 420 225"
        preserveAspectRatio="none"
      >
        <path
          d="M-20,165 C90,95 210,205 320,120 C370,82 405,105 440,86"
          fill="none"
          stroke="rgba(255,255,255,0.10)"
          strokeWidth="1.1"
        />
        <path
          d="M-20,178 C95,108 215,218 325,133 C375,95 410,118 440,99"
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="1"
        />
        <path
          d="M-20,191 C100,121 220,231 330,146 C380,108 415,131 440,112"
          fill="none"
          stroke="rgba(255,255,255,0.07)"
          strokeWidth="0.9"
        />
        <path
          d="M150,-15 C220,55 300,15 390,95"
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="1"
        />
      </svg>

      {/* 3. Hover Light Sweep Diagonal Super Halus */}
      {enableHoverSweep && (
        <div
          aria-hidden="true"
          className="absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/18 to-transparent -translate-x-full group-hover:translate-x-[360%] transition-transform duration-1000 ease-out pointer-events-none"
        />
      )}
    </>
  );
}

export function EmvGoldChip({ idSuffix }: { idSuffix: string }) {
  const gradId = `emvGoldGrad-${idSuffix}`;
  return (
    <div className="w-11 h-8 rounded-[6px] overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.6),0_1px_3px_rgba(0,0,0,0.25)] border border-[#8E6D18]/45 shrink-0">
      <svg
        viewBox="0 0 44 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full block"
        aria-hidden="true"
      >
        <defs>
          <linearGradient
            id={gradId}
            x1="0"
            y1="0"
            x2="44"
            y2="32"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#FDE68A" />
            <stop offset="52%" stopColor="#D4AF37" />
            <stop offset="100%" stopColor="#B48A1E" />
          </linearGradient>
        </defs>
        <rect width="44" height="32" fill={`url(#${gradId})`} />
        <rect x="0" y="4" width="44" height="5" fill="rgba(255,255,255,0.16)" />
        <path
          d="M14 0V32M30 0V32M0 10.5H14M0 21.5H14M30 10.5H44M30 21.5H44"
          stroke="rgba(78,56,12,0.42)"
          strokeWidth="0.9"
        />
        <rect
          x="15.5"
          y="8.5"
          width="13"
          height="15"
          rx="2.5"
          stroke="rgba(78,56,12,0.42)"
          strokeWidth="0.9"
          fill="rgba(255,255,255,0.08)"
        />
      </svg>
    </div>
  );
}

export function CardNetworkEmblem({
  icon,
}: {
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 shrink-0">
      {icon && (
        <div className="w-7 h-7 rounded-full bg-white/15 backdrop-blur-xs border border-white/25 flex items-center justify-center text-white/95">
          {icon}
        </div>
      )}
      <div className="flex flex-col items-end gap-1">
        <div className="flex items-center opacity-85" aria-hidden="true">
          <span className="w-5 h-5 rounded-full bg-white/35 backdrop-blur-2xs" />
          <span className="w-5 h-5 -ml-2.5 rounded-full bg-white/20 ring-1 ring-white/25" />
        </div>
        <span className="text-[9px] tracking-[0.22em] uppercase text-white/75 font-semibold leading-none">
          PLATINUM
        </span>
      </div>
    </div>
  );
}
