import type { Metadata } from 'next';
import AuthLayout from '@/components/auth/AuthLayout';

export const metadata: Metadata = {
  title: 'Daftar Akun — FinAI Spatial Finance',
  description: 'Buat akun FinAI baru dan mulai perjalanan finansial yang lebih tertata dan terencana.',
};

export default function RegisterPage() {
  return <AuthLayout initialMode="register" />;
}
