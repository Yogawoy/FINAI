import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'FinAI — Your Money. Understandable.',
  description: 'A soft, spatial personal finance experience powered by visual clarity and intuitive 3D perception.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={plusJakarta.variable}>
      <body className={`${plusJakarta.className} antialiased bg-[#F6F7FB] text-[#242636] min-h-screen selection:bg-[#E4E2FB] selection:text-[#7C7CE6]`}>
        {children}
      </body>
    </html>
  );
}
