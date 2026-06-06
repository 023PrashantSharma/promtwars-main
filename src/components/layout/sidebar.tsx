'use client';

import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/providers/theme-provider';
import { getPreferences, savePreferences } from '@/services/storage';
import { daysUntil } from '@/lib/utils';
import { ExamType, DEFAULT_EXAM_DATES } from '@/types';
import type { UserPreferences } from '@/types';
import {
  LayoutDashboard, Heart, BookOpen, Brain, MessageCircle,
  Timer, Sun, Moon, ChevronRight, LogOut, Flame,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/check-in', label: 'Check-in', icon: Heart },
  { href: '/journal', label: 'Journal', icon: BookOpen },
  { href: '/coach', label: 'AI Coach', icon: MessageCircle },
  { href: '/burnout', label: 'Burnout', icon: Brain },
  { href: '/focus', label: 'Focus', icon: Timer },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [prefs, setPrefs] = useState<UserPreferences | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const p = getPreferences();
    // Read name from localStorage (set during onboarding)
    const storedName = localStorage.getItem('mindflow_user_name');
    if (storedName && !p.name) {
      p.name = storedName;
    }
    setPrefs(p);
  }, []);

  if (!mounted) return null;

  const userName = prefs?.name || localStorage.getItem('mindflow_user_name') || 'User';
  const initials = userName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  const selectedExam = prefs?.selectedExam || null;
  const examDate = selectedExam ? DEFAULT_EXAM_DATES[selectedExam] : null;
  const daysLeft = examDate ? daysUntil(examDate) : null;
  const showCountdown = selectedExam && daysLeft !== null && daysLeft > 0;

  const motivations = [
    'Stay consistent, success is closer than you think.',
    'Every hour of study is an investment in yourself.',
    'Believe in the process. You\'ve got this!',
  ];
  const motivation = motivations[Math.floor(Date.now() / 86400000) % motivations.length];

  const handleLogout = () => {
    localStorage.removeItem('mindflow_user_id');
    localStorage.removeItem('mindflow_user_name');
    router.push('/');
  };

  return (
    <aside className="bg-surface border-r border-border fixed left-0 top-0 bottom-0 z-40 flex flex-col w-[250px]">
      {/* ──── Logo ──── */}
      <div className="px-5 pt-5 pb-4">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="relative w-9 h-9 rounded-xl overflow-hidden shrink-0 ring-1 ring-border group-hover:ring-primary/30 transition-all">
            <Image src="/promwars.jpg" alt="MindFlow" width={36} height={36} className="object-cover" priority />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-text leading-tight">MindFlow</h1>
            <p className="text-[11px] text-muted leading-tight">Wellness Companion</p>
          </div>
        </Link>
      </div>

      {/* ──── Navigation ──── */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className="block">
              <motion.div
                className={`mf-nav-item ${isActive ? 'mf-nav-item-active' : ''}`}
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-pill"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-r-sm bg-primary"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon className="w-[17px] h-[17px] shrink-0" />
                <span>{item.label}</span>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* ──── Exam Countdown ──── */}
      <div className="px-4 py-3">
        <div className="mf-divider" />

        {showCountdown ? (
          <div className="pt-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-medium text-muted uppercase tracking-wider">Exam Countdown</span>
              <ChevronRight className="w-3.5 h-3.5 text-muted" />
            </div>
            <p className="text-xs font-semibold text-text-secondary mb-2">{selectedExam}</p>

            <div className="flex items-baseline gap-1 mb-0.5">
              <span className="text-3xl font-bold text-text tabular-nums">{daysLeft}</span>
            </div>
            <p className="text-[11px] text-muted mb-3">days remaining</p>

            {/* Progress bar */}
            <div className="h-1 bg-border rounded-full overflow-hidden mb-3">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, Math.max(5, 100 - (daysLeft! / 365) * 100))}%` }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
              />
            </div>

            <div className="flex items-start gap-2">
              <Flame className="w-3 h-3 text-warning shrink-0 mt-0.5" />
              <p className="text-[10.5px] text-muted italic leading-snug">{motivation}</p>
            </div>
          </div>
        ) : (
          <div className="pt-3">
            <span className="text-[11px] font-medium text-muted uppercase tracking-wider block mb-2.5">
              Select Your Exam
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {Object.values(ExamType).map((exam) => (
                <motion.button
                  key={exam}
                  onClick={() => {
                    savePreferences({ selectedExam: exam, customExamDate: null });
                    setPrefs({ ...prefs!, selectedExam: exam, customExamDate: null });
                  }}
                  className="text-[11px] font-medium px-2.5 py-2 rounded-lg text-left text-muted bg-elevated border border-border hover:border-primary/30 hover:text-text hover:bg-card transition-all cursor-pointer"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {exam}
                </motion.button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ──── User Profile + Theme ──── */}
      <div className="px-3 pb-4 pt-1">
        <div className="mf-divider" />

        <div className="flex items-center gap-2.5 px-2 py-2.5 mt-1.5 rounded-lg hover:bg-elevated transition-colors cursor-pointer group">
          <div className="w-8 h-8 rounded-full bg-primary-soft text-primary flex items-center justify-center text-xs font-bold shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-text truncate">{userName}</p>
            <p className="text-[10px] text-muted group-hover:text-primary transition-colors">View profile</p>
          </div>
        </div>

        {/* Theme + Logout */}
        <div className="flex items-center gap-1 px-1 mt-1.5">
          <motion.button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-elevated text-muted hover:text-text hover:bg-card-hover transition-all cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </motion.button>
          <motion.button
            onClick={handleLogout}
            className="p-2 rounded-lg text-muted hover:text-destructive hover:bg-destructive/10 transition-all cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </aside>
  );
}
