'use client';

import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSyncExternalStore } from 'react';
import { motion } from 'framer-motion';
import { getPreferences } from '@/services/storage';
import { daysUntil } from '@/lib/utils';
import { DEFAULT_EXAM_DATES } from '@/types';
import { useTheme } from '@/providers/theme-provider';
import {
  LayoutDashboard, Heart, BookOpen, Brain, MessageCircle,
  Timer, Flame, Sun, Moon, LogOut
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/check-in', label: 'Check-in', icon: Heart },
  { href: '/journal', label: 'Journal', icon: BookOpen },
  { href: '/coach', label: 'AI Coach', icon: MessageCircle },
  { href: '/burnout', label: 'Burnout', icon: Brain },
  { href: '/focus', label: 'Focus', icon: Timer },
];

const MOTIVATIONS = [
  'Stay consistent, success is closer than you think.',
  'Every hour of study is an investment in yourself.',
  'Believe in the process. You\'ve got this!',
  'Small steps daily lead to big results.',
  'Your future self will thank you.',
];

const emptySubscribe = () => () => {};
const dayIndex = typeof window !== 'undefined' ? Math.floor(Date.now() / 86400000) % MOTIVATIONS.length : 0;

function useIsMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const mounted = useIsMounted();
  const { theme, toggleTheme } = useTheme();

  // Read preferences only on client after mount
  const prefs = mounted ? getPreferences() : null;
  const selectedExam = prefs?.selectedExam || null;
  const examDate = selectedExam ? (prefs?.customExamDate || DEFAULT_EXAM_DATES[selectedExam]) : null;
  const daysLeft = examDate ? daysUntil(examDate) : null;
  const showCountdown = mounted && selectedExam && daysLeft !== null && daysLeft > 0;
  const motivation = MOTIVATIONS[dayIndex];

  const userName = (mounted && typeof window !== 'undefined' ? localStorage.getItem('mindflow_user_name') : null) || prefs?.name || 'User';
  const initials = userName.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();

  const handleLogout = () => {
    localStorage.removeItem('mindflow_user_id');
    localStorage.removeItem('mindflow_user_name');
    router.push('/');
  };

  return (
    <aside className="bg-sidebar border-r border-border fixed left-0 top-0 bottom-0 z-40 flex flex-col w-[280px]">
      {/* ──── Logo Section (72px height) ──── */}
      <div className="h-[48px] px-5 flex items-center border-b border-border shrink-0">
        <Link href="/dashboard" className="flex items-center gap-3.5 group">
          <div className="relative w-8 h-8 rounded-md overflow-hidden shrink-0 ring-1 ring-border group-hover:ring-primary/30 transition-all">
            <Image src="/logo.png" alt="MindFlow" width={32} height={32} className="object-cover" priority />
          </div>
          <div className="min-w-0">
            <h1 className="text-[14px] font-bold text-text leading-snug tracking-tight">MindFlow</h1>
            <p className="text-[11px] text-muted leading-snug mt-0.25">Wellness Companion</p>
          </div>
        </Link>
      </div>

      {/* ──── Navigation (40px item height) ──── */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className="block relative">
              <div
                className="flex items-center gap-2 px-3 h-[40px] rounded-md transition-colors duration-150 text-[14px] font-normal"
                style={{
                  background: isActive ? 'rgba(34, 197, 94, 0.08)' : 'transparent',
                  color: isActive ? 'var(--c-primary)' : 'var(--c-text-secondary)',
                }}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-[18px] bg-primary rounded-r" />
                )}
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* ──── Exam Countdown Card ──── */}
      {showCountdown && (
        <div className="px-4 pb-4 shrink-0">
          <div className="bg-surface border border-border rounded-lg p-3.5">
            <div className="flex items-baseline justify-between mb-1">
              <span className="text-[10px] font-semibold text-muted uppercase tracking-wider">
                Countdown
              </span>
              <span className="text-[11px] font-medium text-text-secondary">{selectedExam}</span>
            </div>

            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-display font-semibold text-text tabular-nums">{daysLeft}</span>
              <span className="text-caption text-muted">days left</span>
            </div>

            {/* Progress bar */}
            <div className="h-1 bg-border rounded-full overflow-hidden mb-3">
              <div
                className="h-full bg-primary rounded-full"
                style={{ width: `${Math.min(100, Math.max(5, 100 - (daysLeft! / 365) * 100))}%` }}
              />
            </div>

            <div className="flex items-start gap-1.5">
              <Flame className="w-3 h-3 text-warning shrink-0 mt-0.5" />
              <p className="text-[10px] text-muted italic leading-snug">{motivation}</p>
            </div>
          </div>
        </div>
      )}

      {/* ──── Footer (Profile, Theme Switch - unified clean section pinned bottom) ──── */}
      <div className="p-4 border-t border-border bg-sidebar shrink-0">
        <div className="flex items-center justify-between gap-2">
          {/* User profile info */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-full bg-primary-soft text-primary flex items-center justify-center text-[11px] font-bold shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-[12px] font-medium text-text truncate leading-tight">{userName}</p>
              <button onClick={handleLogout} className="text-[10px] text-muted hover:text-destructive transition-colors flex items-center gap-1 mt-0.5">
                <LogOut className="w-2.5 h-2.5" />
                Sign out
              </button>
            </div>
          </div>

          {/* Theme switcher */}
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-md text-muted hover:text-text hover:bg-card-hover transition-colors shrink-0 cursor-pointer"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </aside>
  );
}
