import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/providers/theme-provider';
import { AppShell } from '@/components/layout/app-shell';

const poppins = Poppins({
  variable: '--font-poppins',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'MindFlow — AI Wellness Companion for Students',
  description:
    'MindFlow helps students navigate exam preparation with AI-powered emotional check-ins, journaling, burnout prediction, and personalized wellness guidance. Supporting JEE, NEET, UPSC, CAT, GATE, CUET, and Board Exams.',
  keywords: [
    'wellness',
    'student',
    'exam preparation',
    'mental health',
    'AI companion',
    'JEE',
    'NEET',
    'UPSC',
    'burnout prevention',
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${poppins.variable} h-full`} suppressHydrationWarning>
      <body className="min-h-full font-sans antialiased">
        <ThemeProvider>
          <AppShell>{children}</AppShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
