import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import NextTopLoader from 'nextjs-toploader';
import './globals.css';
import { ThemeProvider } from '@/providers/theme-provider';

const geist = Geist({
  variable: '--font-geist',
  subsets: ['latin'],
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
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geist.variable} h-full`} suppressHydrationWarning>
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
