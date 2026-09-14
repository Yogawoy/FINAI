import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { AuthProvider } from '@/context/AuthContext';
import './globals.css';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#7C7CE6',
};

export const metadata: Metadata = {
  title: 'FinAI — Kelola Keuangan Pribadi Lebih Jelas & Cerdas',
  description: 'Aplikasi pengelolaan keuangan pribadi modern dengan visualisasi jernih, pos anggaran, target impian, dan asisten FinAI.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={plusJakarta.variable}>
      <body className={`${plusJakarta.className} antialiased bg-[#F6F7FB] text-[#242636] min-h-screen selection:bg-[#E4E2FB] selection:text-[#7C7CE6]`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
