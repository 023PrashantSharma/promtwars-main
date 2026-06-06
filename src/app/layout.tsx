import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import NextTopLoader from 'nextjs-toploader';
import './globals.css';
import { ThemeProvider } from '@/providers/theme-provider';

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
        <NextTopLoader
          color="#4ADE80"
          height={3}
          showSpinner={false}
          shadow="0 0 10px rgba(74,222,128,0.4), 0 0 5px rgba(74,222,128,0.2)"
        />
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
