'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function LoginIllustration() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="w-full pt-2 select-none pointer-events-none"
    >
      <Image
        src="/images/login-illustration.png"
        alt="Ilustrasi gaya hidup dan keuangan FinAI"
        width={894}
        height={609}
        priority
        className="w-full h-auto object-contain block drop-shadow-[0_14px_26px_rgba(36,38,54,0.16)]"
      />
    </motion.div>
  );
}
