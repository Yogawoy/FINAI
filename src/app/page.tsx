import type { Metadata } from 'next';
import LandingPage from '@/components/landing/LandingPage';

export const metadata: Metadata = {
  title: 'FinAI — Kelola Keuangan Lebih Cerdas dengan AI',
  description:
    'FinAI membantu kamu mencatat transaksi, mengatur anggaran, merencanakan target, dan memahami keuangan dengan bantuan AI.',
};

export default function Home() {
  return <LandingPage />;
}
