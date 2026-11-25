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
    title: 'Buat Akun FinAI',
    namePlaceholder: 'Nama Lengkap',
    emailPlaceholder: 'Alamat Email',
    passwordPlaceholder: 'Kata Sandi (min. 8 karakter)',
    agreePrefix: 'Saya menyetujui',
    termsLabel: 'syarat layanan',
    agreeAnd: 'dan',
    privacyLabel: 'kebijakan privasi',
    termsAlert: 'Dengan mendaftar, Anda setuju data keuangan Anda disimpan secara aman untuk fitur pencatatan & asisten AI FinAI.',
    submit: 'Daftar',
    submitting: 'Mendaftarkan...',
    showPass: 'Tampilkan kata sandi',
    hidePass: 'Sembunyikan kata sandi',
    haveAccount: 'Sudah punya akun?',
    signIn: 'Masuk',
    requiredError: 'Nama lengkap, email, dan kata sandi wajib diisi.',
    nameLengthError: 'Nama lengkap minimal 2 karakter.',
    passwordLengthError: 'Kata sandi minimal 8 karakter.',
    termsError: 'Centang persetujuan syarat layanan dan kebijakan privasi terlebih dahulu.',
    networkError: 'Gagal terhubung ke server. Coba lagi sesaat lagi.',
    defaultError: 'Pendaftaran gagal. Periksa kembali data yang dimasukkan.',
  },
  en: {
    langLabel: 'English (USA)',
    title: 'Create Account',
    namePlaceholder: 'Full Name',
    emailPlaceholder: 'Email Address',
    passwordPlaceholder: 'Password (min. 8 chars)',
    agreePrefix: 'I agree to the',
    termsLabel: 'terms of service',
    agreeAnd: 'and',
    privacyLabel: 'privacy policy',
    termsAlert: 'By registering, you agree to securely store your financial records for FinAI tracking and AI assistance.',
    submit: 'Sign Up',
    submitting: 'Creating account...',
    showPass: 'Show password',
    hidePass: 'Hide password',
    haveAccount: 'Already have an account?',
    signIn: 'Sign in',
    requiredError: 'Full name, email, and password are required.',
    nameLengthError: 'Full name must be at least 2 characters.',
    passwordLengthError: 'Password must be at least 8 characters.',
    termsError: 'Please agree to the terms of service and privacy policy.',
    networkError: 'Unable to reach server. Please try again.',
    defaultError: 'Registration failed. Please check your details.',
  },
} as const;

interface RegisterFormCardProps {
  lang: Lang;
  onLangChange: (lang: Lang) => void;
}

export default function RegisterFormCard({ lang, onLangChange }: RegisterFormCardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser } = useAuth();
  const t = COPY[lang];

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreedTerms, setAgreedTerms] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName || !trimmedEmail || !password) {
      setErrorMessage(t.requiredError);
      return;
    }

    if (trimmedName.length < 2) {
      setErrorMessage(t.nameLengthError);
      return;
    }

    if (password.length < 8) {
      setErrorMessage(t.passwordLengthError);
      return;
    }

    if (!agreedTerms) {
      setErrorMessage(t.termsError);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: trimmedName,
          email: trimmedEmail,
          password,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.success) {
        setErrorMessage(data?.error?.message || t.defaultError);
        return;
      }

      await refreshUser();

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
      <div className="w-full max-w-[380px] mx-auto my-auto space-y-4 sm:space-y-5">
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

        <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4.5" noValidate>
          {/* Full Name — Minimalist Underline Input */}
          <div>
            <label htmlFor="register-name" className="sr-only">
              {t.namePlaceholder}
            </label>
            <input
              id="register-name"
              type="text"
              name="name"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.namePlaceholder}
              disabled={isSubmitting}
              className="w-full py-2.5 bg-transparent border-b border-[#E5E7F0] focus:border-[#5E5CE6] text-sm text-[#242636] placeholder:text-[#9CA3B8] outline-none transition-colors disabled:opacity-60"
            />
          </div>

          {/* Email Address — Minimalist Underline Input */}
          <div>
            <label htmlFor="register-email" className="sr-only">
              {t.emailPlaceholder}
            </label>
            <input
              id="register-email"
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
            <label htmlFor="register-password" className="sr-only">
              {t.passwordPlaceholder}
            </label>
            <input
              id="register-password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              autoComplete="new-password"
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

          {/* Terms Checkbox */}
          <div className="flex items-start gap-2.5 pt-1">
            <button
              id="register-terms"
              type="button"
              role="checkbox"
              aria-checked={agreedTerms}
              onClick={() => setAgreedTerms((prev) => !prev)}
              className={`mt-0.5 w-4 h-4 rounded-[4px] shrink-0 flex items-center justify-center transition-colors cursor-pointer ${
                agreedTerms
                  ? 'bg-[#5E5CE6] border border-[#5E5CE6] text-white'
                  : 'bg-white border border-[#CBD0E0] text-transparent'
              }`}
            >
              <Check size={11} strokeWidth={3} />
            </button>
            <label
              htmlFor="register-terms"
              className="text-xs text-[#757A95] leading-relaxed select-none cursor-pointer"
            >
              {t.agreePrefix}{' '}
              <button
                type="button"
                onClick={() => alert(t.termsAlert)}
                className="text-[#5E5CE6] hover:text-[#4845C7] underline underline-offset-2 cursor-pointer"
              >
                {t.termsLabel}
              </button>{' '}
              {t.agreeAnd}{' '}
              <button
                type="button"
                onClick={() => alert(t.termsAlert)}
                className="text-[#5E5CE6] hover:text-[#4845C7] underline underline-offset-2 cursor-pointer"
              >
                {t.privacyLabel}
              </button>
            </label>
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

      {/* Bottom Link to Login */}
      <p className="text-center text-xs text-[#8B90A7] pt-4 sm:pt-5">
        {t.haveAccount}{' '}
        <Link
          href="/login"
          className="font-semibold text-[#5E5CE6] hover:text-[#4845C7] underline underline-offset-2 transition-colors"
        >
          {t.signIn}
        </Link>
      </p>
    </div>
  );
}
