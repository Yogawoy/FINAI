'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Check, ChevronDown, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

type Lang = 'id' | 'en';

const COPY = {
  id: {
    langLabel: 'Indonesia (ID)',
    title: 'Masuk ke FinAI',
    emailPlaceholder: 'Alamat Email',
    passwordPlaceholder: 'Kata Sandi',
    rememberMe: 'Ingat saya di perangkat ini',
    fillDemo: 'Isi Akun Demo',
    submit: 'Masuk',
    submitting: 'Memproses...',
    showPass: 'Tampilkan kata sandi',
    hidePass: 'Sembunyikan kata sandi',
    requiredError: 'Email dan kata sandi wajib diisi.',
    networkError: 'Gagal terhubung ke server. Coba lagi sesaat lagi.',
    defaultError: 'Email atau kata sandi tidak sesuai.',
    noAccount: 'Belum punya akun?',
    signUp: 'Daftar',
  },
  en: {
    langLabel: 'English (USA)',
    title: 'Sign In to FinAI',
    emailPlaceholder: 'Email Address',
    passwordPlaceholder: 'Password',
    rememberMe: 'Keep me signed in',
    fillDemo: 'Use Demo Account',
    submit: 'Sign In',
    submitting: 'Signing in...',
    showPass: 'Show password',
    hidePass: 'Hide password',
    requiredError: 'Email and password are required.',
    networkError: 'Unable to reach server. Please try again.',
    defaultError: 'Invalid email or password.',
    noAccount: "Don't have an account?",
    signUp: 'Sign up',
  },
} as const;

interface LoginFormCardProps {
  lang: Lang;
  onLangChange: (lang: Lang) => void;
}

export default function LoginFormCard({ lang, onLangChange }: LoginFormCardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useAuth();
  const t = COPY[lang];

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFillDemo = () => {
    setEmail('demo@finai.local');
    setPassword('password123');
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage(t.requiredError);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password,
          rememberMe,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.success) {
        setErrorMessage(data?.error?.message || t.defaultError);
        return;
      }

      if (data?.data?.user) {
        setUser(data.data.user);
      }

      const rawRedirect = searchParams.get('redirect') || '/app';
      const safeRedirect =
        rawRedirect.startsWith('/') && !rawRedirect.startsWith('//')
          ? rawRedirect
          : '/app';

      router.replace(safeRedirect);
      router.refresh();
    } catch {
      setErrorMessage(t.networkError);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex-1 flex flex-col justify-between">
      {/* Top-right Language Selector */}
      <div className="flex justify-end mb-2">
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsLangOpen((prev) => !prev)}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#8B90A7] hover:text-[#242636] transition-colors cursor-pointer py-1 px-2 rounded-lg"
            aria-expanded={isLangOpen}
            aria-haspopup="listbox"
          >
            <span>{t.langLabel}</span>
            <ChevronDown size={13} />
          </button>

          {isLangOpen && (
            <div
              role="listbox"
              className="absolute right-0 mt-1 w-40 rounded-xl bg-white border border-[#E8EAF2] shadow-[0_12px_28px_rgba(36,38,54,0.12)] py-1 z-20"
            >
              <button
                type="button"
                onClick={() => {
                  onLangChange('id');
                  setIsLangOpen(false);
                }}
                className={`w-full text-left px-3.5 py-2 text-xs font-medium transition-colors cursor-pointer ${
                  lang === 'id'
                    ? 'text-[#5E5CE6] bg-[#F4F3FE] font-semibold'
                    : 'text-[#242636] hover:bg-[#F6F7FB]'
                }`}
              >
                Indonesia (ID)
              </button>
              <button
                type="button"
                onClick={() => {
                  onLangChange('en');
                  setIsLangOpen(false);
                }}
                className={`w-full text-left px-3.5 py-2 text-xs font-medium transition-colors cursor-pointer ${
                  lang === 'en'
                    ? 'text-[#5E5CE6] bg-[#F4F3FE] font-semibold'
                    : 'text-[#242636] hover:bg-[#F6F7FB]'
                }`}
              >
                English (USA)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Form Content */}
      <div className="w-full max-w-[380px] mx-auto my-auto space-y-5 sm:space-y-6">
        <h1 className="text-xl sm:text-[26px] font-bold tracking-tight text-[#1E202C]">
          {t.title}
        </h1>

        {errorMessage && (
          <div
            role="alert"
            className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-[#FEF3F2] border border-[#FCE2E0] text-xs font-medium text-[#D94F4F]"
          >
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5" noValidate>
          {/* Email Address — Minimalist Underline Input */}
          <div>
            <label htmlFor="login-email" className="sr-only">
              {t.emailPlaceholder}
            </label>
            <input
              id="login-email"
              type="email"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t.emailPlaceholder}
              disabled={isSubmitting}
              className="w-full py-2.5 bg-transparent border-b border-[#E5E7F0] focus:border-[#5E5CE6] text-sm text-[#242636] placeholder:text-[#9CA3B8] outline-none transition-colors disabled:opacity-60"
            />
          </div>

          {/* Password — Minimalist Underline Input with Eye Toggle */}
          <div className="relative">
            <label htmlFor="login-password" className="sr-only">
              {t.passwordPlaceholder}
            </label>
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t.passwordPlaceholder}
              disabled={isSubmitting}
              className="w-full py-2.5 pr-9 bg-transparent border-b border-[#E5E7F0] focus:border-[#5E5CE6] text-sm text-[#242636] placeholder:text-[#9CA3B8] outline-none transition-colors disabled:opacity-60"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? t.hidePass : t.showPass}
              className="absolute right-0 top-1/2 -translate-y-1/2 p-1.5 text-[#9CA3B8] hover:text-[#242636] transition-colors cursor-pointer"
            >
              {showPassword ? <Eye size={17} /> : <EyeOff size={17} />}
            </button>
          </div>

          {/* Checkbox & Quick Demo Fill */}
          <div className="flex items-center justify-between gap-3 pt-1">
            <label className="inline-flex items-center gap-2.5 cursor-pointer select-none group">
              <button
                type="button"
                role="checkbox"
                aria-checked={rememberMe}
                onClick={() => setRememberMe((prev) => !prev)}
                className={`w-4 h-4 rounded-[4px] flex items-center justify-center transition-colors cursor-pointer ${
                  rememberMe
                    ? 'bg-[#5E5CE6] border border-[#5E5CE6] text-white'
                    : 'bg-white border border-[#CBD0E0] text-transparent'
                }`}
              >
                <Check size={11} strokeWidth={3} />
              </button>
              <span className="text-xs text-[#757A95] group-hover:text-[#242636] transition-colors">
                {t.rememberMe}
              </span>
            </label>

            <button
              type="button"
              onClick={handleFillDemo}
              className="text-xs font-semibold text-[#5E5CE6] hover:text-[#4845C7] underline underline-offset-2 transition-colors cursor-pointer"
            >
              {t.fillDemo}
            </button>
          </div>

          {/* Pill Primary CTA Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-11 sm:h-12 rounded-full bg-[#5E5CE6] hover:bg-[#4E4BD6] active:scale-[0.99] text-white text-sm font-bold shadow-[0_10px_24px_rgba(94,92,230,0.32)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>{t.submitting}</span>
              </>
            ) : (
              <span>{t.submit}</span>
            )}
          </button>
        </form>
      </div>

      {/* Bottom Link to Register */}
      <p className="text-center text-xs text-[#8B90A7] pt-4 sm:pt-5">
        {t.noAccount}{' '}
        <Link
          href="/register"
          className="font-semibold text-[#5E5CE6] hover:text-[#4845C7] underline underline-offset-2 transition-colors"
        >
          {t.signUp}
        </Link>
      </p>
    </div>
  );
}
