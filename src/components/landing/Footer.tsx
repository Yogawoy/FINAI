'use client';

import React from 'react';
import Link from 'next/link';
import AuthBrand from '@/components/auth/AuthBrand';

export default function Footer() {
  return (
    <footer className="border-t border-[#E8EAF2] bg-white/70 backdrop-blur-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-8">
          {/* Brand Col (5 Cols) */}
          <div className="md:col-span-5 space-y-4">
            <AuthBrand />
            <p className="text-xs sm:text-sm text-[#757A95] max-w-sm leading-relaxed">
              Personal finance, made simpler. Asisten cerdas untuk mencatat, merencanakan, dan memahami arah keuanganmu.
            </p>
          </div>

          {/* Links 1: Produk (2.5 Cols) */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#242636]">
              Produk
            </h4>
            <ul className="space-y-2 text-xs text-[#757A95]">
              <li>
                <a href="#fitur" className="hover:text-[#242636] transition-colors">
                  Fitur
                </a>
              </li>
              <li>
                <a href="#ai-assistant" className="hover:text-[#242636] transition-colors">
                  AI Assistant
                </a>
              </li>
              <li>
                <a href="#cara-kerja" className="hover:text-[#242636] transition-colors">
                  Cara Kerja
                </a>
              </li>
            </ul>
          </div>

          {/* Links 2: Perusahaan (2.5 Cols) */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#242636]">
              Perusahaan
            </h4>
            <ul className="space-y-2 text-xs text-[#757A95]">
              <li>
                <a href="#tentang" className="hover:text-[#242636] transition-colors">
                  Tentang
                </a>
              </li>
              <li>
                <a
                  href="mailto:contact@finai.design"
                  className="hover:text-[#242636] transition-colors"
                >
                  Kontak
                </a>
              </li>
            </ul>
          </div>

          {/* Links 3: Legal (2 Cols) */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#242636]">
              Legal
            </h4>
            <ul className="space-y-2 text-xs text-[#757A95]">
              <li>
                <button
                  type="button"
                  onClick={() => alert('Kebijakan Privasi FinAI: Seluruh privasi data keuangan Anda dilindungi dengan standar keamanan fintech modern.')}
                  className="hover:text-[#242636] transition-colors text-left cursor-pointer"
                >
                  Privasi
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => alert('Syarat & Ketentuan FinAI: Anda setuju menggunakan aplikasi untuk tujuan pencatatan keuangan pribadi dengan data terenkripsi lokal.')}
                  className="hover:text-[#242636] transition-colors text-left cursor-pointer"
                >
                  Syarat & Ketentuan
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright row */}
        <div className="pt-8 mt-12 border-t border-[#E8EAF2]/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8A8FA8]">
          <span>© 2026 FinAI. Hak cipta dilindungi.</span>
          <span>Spatial Personal Finance Assistant.</span>
        </div>
      </div>
    </footer>
  );
}
