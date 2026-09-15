import type { Metadata } from 'next';
import { headers, cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import LandingPage from '@/components/landing/LandingPage';

export const metadata: Metadata = {
  title: 'FinAI — Kelola Keuangan Lebih Cerdas dengan AI',
  description:
    'FinAI membantu kamu mencatat transaksi, mengatur anggaran, merencanakan target, dan memahami keuangan dengan bantuan AI.',
};

export default async function Home() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('finai_session')?.value;
  if (sessionToken) {
    redirect('/app');
  }

  const headerList = await headers();
  const userAgent = headerList.get('user-agent') || '';
  const isMobileApp = /wv|Android.*Version\/[0-9.]+|Capacitor/i.test(userAgent);
  if (isMobileApp) {
    redirect('/login');
  }

  return <LandingPage />;
}
