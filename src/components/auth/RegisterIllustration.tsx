'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function RegisterIllustration() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="w-full pt-2 select-none pointer-events-none"
    >
      <Image
        src="/images/register-illustration.png"
        alt="Ilustrasi kolaborasi dan keuangan FinAI"
        width={891}
        height={630}
        priority
        className="w-full h-auto object-contain block drop-shadow-[0_14px_26px_rgba(36,38,54,0.16)]"
      />
    </motion.div>
  );
}
