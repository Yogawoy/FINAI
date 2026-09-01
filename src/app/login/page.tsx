import type { Metadata } from 'next';
import AuthLayout from '@/components/auth/AuthLayout';

export const metadata: Metadata = {
  title: 'Masuk — FinAI Spatial Finance',
  description: 'Masuk ke akun FinAI untuk melanjutkan pengelolaan dan perencanaan keuangan pribadimu.',
};

export default function LoginPage() {
  return <AuthLayout initialMode="login" />;
}
