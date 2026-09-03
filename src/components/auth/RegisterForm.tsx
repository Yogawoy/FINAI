'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail } from 'lucide-react';
import AuthInput from './AuthInput';
import PasswordInput from './PasswordInput';
import AuthCheckbox from './AuthCheckbox';
import AuthLoadingButton from './AuthLoadingButton';
import AuthDivider from './AuthDivider';
import SocialAuthButtons from './SocialAuthButtons';
import AuthError from './AuthError';

interface RegisterFormProps {
  onSwitchToLogin: () => void;
  className?: string;
}

export default function RegisterForm({
  onSwitchToLogin,
  className = '',
}: RegisterFormProps) {
  const router = useRouter();

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Status states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Validation errors per field
  const [errors, setErrors] = useState<{
    fullName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    terms?: string;
  }>({});

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'Nama lengkap wajib diisi';
    } else if (fullName.trim().length < 2) {
      newErrors.fullName = 'Nama minimal 2 karakter';
    }

    if (!email.trim()) {
      newErrors.email = 'Email wajib diisi';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Format email tidak valid';
    }

    if (!password) {
      newErrors.password = 'Password wajib diisi';
    } else if (password.length < 8) {
      newErrors.password = 'Password minimal 8 karakter';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Ulangi password kamu';
    } else if (confirmPassword !== password) {
      newErrors.confirmPassword = 'Password tidak cocok';
    }

    if (!agreedToTerms) {
      newErrors.terms = 'Anda harus menyetujui Syarat & Ketentuan';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: fullName.trim(),
          email: email.trim(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data?.error?.message || 'Pendaftaran gagal. Silakan coba lagi.');
        setIsLoading(false);
        return;
      }

      // Success -> Redirect to main dashboard
      router.push('/app');
      router.refresh();
    } catch (err) {
      console.error('Register submit error:', err);
      setErrorMessage('Terjadi kesalahan jaringan. Silakan coba lagi.');
      setIsLoading(false);
    }
  };

  return (
    <div className={`w-full flex flex-col justify-center px-6 sm:px-10 lg:px-12 py-5 sm:py-6 max-w-lg mx-auto ${className}`}>
      {/* Header */}
      <div className="space-y-1.5 mb-5">
        <h1 className="text-2xl sm:text-[28px] font-extrabold text-[#242636] tracking-tight">
          Buat akun baru
        </h1>
        <p className="text-xs sm:text-sm text-[#757A95]">
          Daftar dan kelola keuanganmu dengan lebih mudah.
        </p>
      </div>

      {/* Inline Global Error Alert */}
      <AuthError message={errorMessage} className="mb-4" />

      {/* Form Fields */}
      <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
        {/* Row 1: Nama Lengkap & Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <AuthInput
            label="Nama Lengkap"
            name="name"
            autoComplete="name"
            placeholder="Masukkan nama lengkap"
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value);
              if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: undefined }));
              if (errorMessage) setErrorMessage(null);
            }}
            icon={<User size={16} />}
            error={errors.fullName}
            disabled={isLoading}
          />

          <AuthInput
            label="Email"
            type="email"
            name="email"
            autoComplete="email"
            placeholder="Masukkan email kamu"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
              if (errorMessage) setErrorMessage(null);
            }}
            icon={<Mail size={16} />}
            error={errors.email}
            disabled={isLoading}
          />
        </div>

        {/* Row 2: Password & Konfirmasi Password */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <PasswordInput
            label="Password"
            name="new-password"
            autoComplete="new-password"
            placeholder="Buat password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
              if (errorMessage) setErrorMessage(null);
            }}
            error={errors.password}
            disabled={isLoading}
          />

          <PasswordInput
            label="Konfirmasi Password"
            name="confirm-password"
            autoComplete="new-password"
            placeholder="Ulangi password kamu"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
              if (errorMessage) setErrorMessage(null);
            }}
            error={errors.confirmPassword}
            disabled={isLoading}
          />
        </div>

        {/* Password Helper Text */}
        <p className="text-[11px] font-medium text-[#8A8FA8] -mt-1">
          Minimal 8 karakter dengan kombinasi huruf dan angka
        </p>

        {/* Terms and Privacy Checkbox */}
        <div className="pt-1">
          <AuthCheckbox
            id="register-terms"
            checked={agreedToTerms}
            onChange={(val) => {
              setAgreedToTerms(val);
              if (errors.terms) setErrors((prev) => ({ ...prev, terms: undefined }));
            }}
            error={errors.terms}
          >
            <span>
              Saya setuju dengan{' '}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  alert('Syarat & Ketentuan FinAI: Anda setuju menggunakan aplikasi untuk tujuan pencatatan keuangan pribadi dengan data terenkripsi lokal.');
                }}
                className="font-bold text-[#7C7CE6] hover:underline cursor-pointer"
              >
                Syarat & Ketentuan
              </button>{' '}
              dan{' '}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  alert('Kebijakan Privasi FinAI: Seluruh privasi data keuangan Anda dilindungi dengan standar keamanan fintech modern.');
                }}
                className="font-bold text-[#7C7CE6] hover:underline cursor-pointer"
              >
                Kebijakan Privasi
              </button>
            </span>
          </AuthCheckbox>
        </div>

        {/* Primary Submit Button */}
        <div className="pt-2">
          <AuthLoadingButton isLoading={isLoading} loadingText="Memproses...">
            Daftar
          </AuthLoadingButton>
        </div>

        {/* Divider */}
        <AuthDivider text="atau daftar dengan" />

        {/* Social Auth Buttons */}
        <SocialAuthButtons disabled={isLoading} />

        {/* Footer Link */}
        <div className="pt-2 text-center text-xs text-[#757A95]">
          <span>Sudah punya akun? </span>
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="font-bold text-[#7C7CE6] hover:text-[#5F5ED4] hover:underline transition-colors cursor-pointer"
          >
            Masuk sekarang
          </button>
        </div>
      </form>
    </div>
  );
}
