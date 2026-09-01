'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, useScroll, useSpring } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import AuthBrand from '@/components/auth/AuthBrand';
import MobileMenu from './MobileMenu';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Framer Motion scroll tracking
  const { scrollYProgress, scrollY } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  useEffect(() => {
    return scrollY.on('change', (latest) => {
      setIsScrolled(latest > 25);
    });
  }, [scrollY]);

  return (
    <>
      {/* 1. Sleek Top Scroll Progress Indicator */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#7C7CE6] via-[#9B9AF0] to-[#5F5ED4] origin-left z-[60] pointer-events-none"
        style={{ scaleX }}
      />

      {/* 2. Fixed Floating Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 pt-2.5 sm:pt-3.5 transition-all duration-300 pointer-events-none">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <nav
            aria-label="Navigasi Utama"
            className={`pointer-events-auto rounded-full px-5 sm:px-6 transition-all duration-300 flex items-center justify-between ${
              isScrolled
                ? 'py-2.5 bg-white/92 backdrop-blur-xl shadow-[0_12px_36px_rgba(48,51,74,0.08)] border border-[#E8EAF2]'
                : 'py-3 bg-white/85 backdrop-blur-md shadow-[0_8px_30px_rgba(48,51,74,0.04)] border border-white/80'
            }`}
          >
            {/* Brand Logo */}
            <AuthBrand />

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-7 text-xs font-semibold text-[#757A95]">
              <a
                href="#fitur"
                className="hover:text-[#242636] transition-colors cursor-pointer"
              >
                Fitur
              </a>
              <a
                href="#cara-kerja"
                className="hover:text-[#242636] transition-colors cursor-pointer"
              >
                Cara Kerja
              </a>
              <a
                href="#ai-assistant"
                className="hover:text-[#242636] transition-colors cursor-pointer"
              >
                AI Assistant
              </a>
              <a
                href="#tentang"
                className="hover:text-[#242636] transition-colors cursor-pointer"
              >
                Tentang
              </a>
            </div>

            {/* Desktop CTA Action Controls */}
            <div className="hidden md:flex items-center gap-3">
              <Link
                href="/login"
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#757A95] hover:text-[#242636] hover:bg-[#F2F3FA] transition-all cursor-pointer"
              >
                Masuk
              </Link>
              <Link
                href="/register"
                className="px-4.5 py-2 rounded-xl text-xs font-bold bg-[#7C7CE6] hover:bg-[#6A6AD6] text-white shadow-[0_4px_14px_rgba(124,124,230,0.32)] transition-all cursor-pointer active:scale-98"
              >
                Daftar Gratis
              </Link>
            </div>

            {/* Mobile Hamburger Button */}
            <div className="md:hidden flex items-center">
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label={isMobileMenuOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi'}
                className="p-2 rounded-xl text-[#757A95] hover:text-[#242636] hover:bg-[#F2F3FA] transition-colors cursor-pointer"
              >
                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
    </>
  );
}
