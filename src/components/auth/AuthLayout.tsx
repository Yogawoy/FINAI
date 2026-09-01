'use client';

import React from 'react';
import AuthTransition from './AuthTransition';

interface AuthLayoutProps {
  initialMode?: 'login' | 'register';
}

export default function AuthLayout({ initialMode = 'login' }: AuthLayoutProps) {
  return (
    <main className="min-h-screen bg-[#F6F7FB] text-[#242636] relative flex items-center justify-center overflow-x-hidden selection:bg-[#E4E2FB] selection:text-[#7C7CE6] py-6 sm:py-10">
      {/* Background Multi-Layer Soft Lavender & Periwinkle Ambience */}
      <div className="fixed -top-28 left-1/4 w-[500px] h-[500px] rounded-full bg-[#E4E2FB]/50 blur-[120px] pointer-events-none -z-10" />
      <div className="fixed -bottom-28 right-1/4 w-[550px] h-[550px] rounded-full bg-[#D6E4FA]/45 blur-[130px] pointer-events-none -z-10" />
      <div className="fixed top-1/2 -left-20 w-[400px] h-[400px] rounded-full bg-[#EBE9FD]/40 blur-[100px] pointer-events-none -z-10" />

      {/* Main Interactive Auth Card Container */}
      <div className="w-full max-w-7xl mx-auto flex items-center justify-center">
        <AuthTransition initialMode={initialMode} />
      </div>
    </main>
  );
}
