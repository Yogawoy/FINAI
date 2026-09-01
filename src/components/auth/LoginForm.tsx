'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail } from 'lucide-react';
import AuthInput from './AuthInput';
import PasswordInput from './PasswordInput';
import AuthCheckbox from './AuthCheckbox';
import AuthLoadingButton from './AuthLoadingButton';
import AuthDivider from './AuthDivider';
import SocialAuthButtons from './SocialAuthButtons';
import AuthError from './AuthError';

interface LoginFormProps {
  onSwitchToRegister: () => void;
  onForgotPassword?: () => void;
  className?: string;
}

export default function LoginForm({
  onSwitchToRegister,
  onForgotPassword,
  className = '',
}: LoginFormProps) {
  const router = useRouter();

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Status states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Field validation errors
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = 'Email wajib diisi';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Format email tidak valid';
    }

    if (!password) {
      newErrors.password = 'Password wajib diisi';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!validateForm()) return;

    setIsLoading(true);

    // Simulate authentication processing
    setTimeout(() => {
      setIsLoading(false);
      // Redirect to main app dashboard
      router.push('/app');
    }, 650);
  };

  return (
    <div className={`w-full flex flex-col justify-center px-6 sm:px-10 lg:px-12 py-8 max-w-md mx-auto ${className}`}>
      {/* Header */}
      <div className="space-y-1.5 mb-6">
        <h1 className="text-2xl sm:text-[28px] font-extrabold text-[#242636] tracking-tight">
          Selamat datang kembali!
        </h1>
        <p className="text-xs sm:text-sm text-[#757A95]">
          Masuk untuk melanjutkan perjalanan finansialmu.
        </p>
      </div>

      {/* Inline Global Error Alert */}
      <AuthError message={errorMessage} className="mb-4" />

      {/* Form Fields */}
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Email */}
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
          }}
          icon={<Mail size={16} />}
          error={errors.email}
          disabled={isLoading}
        />

        {/* Password */}
        <PasswordInput
          label="Password"
          name="password"
          autoComplete="current-password"
          placeholder="Masukkan password kamu"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
          }}
          error={errors.password}
          disabled={isLoading}
          topRightAction={
            <button
              type="button"
              onClick={onForgotPassword || (() => alert('Fitur reset kata sandi telah dikirim ke email Anda.'))}
              className="text-xs font-semibold text-[#7C7CE6] hover:text-[#5F5ED4] transition-colors cursor-pointer"
            >
              Lupa password?
            </button>
          }
        />

        {/* Remember Me */}
        <div className="pt-1">
          <AuthCheckbox
            id="remember-me"
            checked={rememberMe}
            onChange={setRememberMe}
            label="Ingat saya"
          />
        </div>

        {/* Primary Submit Button */}
        <div className="pt-2">
          <AuthLoadingButton isLoading={isLoading} loadingText="Memproses...">
            Masuk
          </AuthLoadingButton>
        </div>

        {/* Divider */}
        <AuthDivider text="atau masuk dengan" />

        {/* Social Auth Buttons */}
        <SocialAuthButtons disabled={isLoading} />

        {/* Footer Link */}
        <div className="pt-3 text-center text-xs text-[#757A95]">
          <span>Belum punya akun? </span>
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="font-bold text-[#7C7CE6] hover:text-[#5F5ED4] hover:underline transition-colors cursor-pointer"
          >
            Daftar sekarang
          </button>
        </div>
      </form>
    </div>
  );
}
