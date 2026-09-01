'use client';

import React, { useState } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';
import AuthInput from './AuthInput';

interface PasswordInputProps {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  helperText?: string;
  topRightAction?: React.ReactNode;
  autoComplete?: string;
  name?: string;
  disabled?: boolean;
}

export default function PasswordInput({
  label,
  placeholder = 'Masukkan password kamu',
  value,
  onChange,
  error,
  helperText,
  topRightAction,
  autoComplete = 'current-password',
  name = 'password',
  disabled = false,
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <AuthInput
      label={label}
      type={showPassword ? 'text' : 'password'}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      error={error}
      helperText={helperText}
      topRightAction={topRightAction}
      autoComplete={autoComplete}
      name={name}
      disabled={disabled}
      icon={<Lock size={16} />}
      rightElement={
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="p-1 rounded-lg text-[#757A95] hover:text-[#242636] hover:bg-black/[0.04] transition-colors cursor-pointer"
          title={showPassword ? 'Sembunyikan password' : 'Lihat password'}
          tabIndex={-1}
        >
          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      }
    />
  );
}
