'use client';

import Image from 'next/image';
import { usePathname } from 'next/navigation';
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
  Timer, Settings, Sun, Moon, ChevronRight,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/check-in', label: 'Check-in', icon: Heart },
  { href: '/journal', label: 'Journal', icon: BookOpen },
  { href: '/coach', label: 'AI Coach', icon: MessageCircle },
  { href: '/burnout', label: 'Burnout', icon: Brain },
  { href: '/focus', label: 'Focus', icon: Timer },
];

export function Sidebar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [prefs, setPrefs] = useState<UserPreferences | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const p = getPreferences();
    // Auto-set name if empty
    if (!p.name) {
      savePreferences({ name: 'Prashant Sharma' });
      p.name = 'Prashant Sharma';
    }
    setPrefs(p);
  }, []);

  if (!mounted) return null;

  const selectedExam = prefs?.selectedExam || null;
  // Always use DEFAULT_EXAM_DATES (not stored customExamDate) so dates stay current
  const examDate = selectedExam ? DEFAULT_EXAM_DATES[selectedExam] : null;
  const daysLeft = examDate ? daysUntil(examDate) : null;
  // If exam date has passed (0 days), auto-clear
  const showCountdown = selectedExam && daysLeft !== null && daysLeft > 0;

  const motivations = [
    'Stay consistent, success is closer than you think.',
    'Every hour of study is an investment in yourself.',
    'Believe in the process. You\'ve got this!',
  ];
  const motivation = motivations[Math.floor(Date.now() / 86400000) % motivations.length];

  return (
    <aside
      className="mf-sidebar fixed left-0 top-0 bottom-0 z-40 flex flex-col"
      style={{ width: 'var(--sidebar-w)' }}
    >
      {/* Logo */}
      <div className="px-4 pt-5 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="relative w-9 h-9 rounded-xl overflow-hidden flex-shrink-0">
            <Image src="/promwars.jpg" alt="MindFlow" width={36} height={36} className="object-cover" priority />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-bold leading-tight" style={{ color: 'var(--c-text)' }}>MindFlow</h1>
            <p className="text-[11px] leading-tight" style={{ color: 'var(--c-text-muted)' }}>Wellness Companion</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5">
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
                    layoutId="nav-pill"
                    style={{
                      position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                      width: 3, height: 16, borderRadius: '0 4px 4px 0', background: 'var(--c-primary)',
                    }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon className="w-[17px] h-[17px] flex-shrink-0" />
                <span>{item.label}</span>
              </motion.div>
            </Link>
          );
        })}

        <Link href="#" className="block">
          <div className="mf-nav-item">
            <Settings className="w-[17px] h-[17px] flex-shrink-0" />
            <span>Settings</span>
          </div>
        </Link>
      </nav>

      {/* Exam Countdown */}
      <div className="px-4 py-3">
        <div className="mf-divider" />
        {showCountdown ? (
          <div className="pt-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-medium" style={{ color: 'var(--c-text-muted)' }}>Exam Countdown</span>
              <ChevronRight className="w-3.5 h-3.5" style={{ color: 'var(--c-text-muted)' }} />
            </div>
            <p className="text-xs font-semibold mb-2" style={{ color: 'var(--c-text-secondary)' }}>{selectedExam}</p>
            <p className="text-3xl font-bold leading-none mb-0.5" style={{ color: 'var(--c-text)' }}>{daysLeft}</p>
            <p className="text-[11px] mb-3" style={{ color: 'var(--c-text-muted)' }}>days remaining</p>
            <div className="h-1 rounded-full overflow-hidden mb-2" style={{ background: 'var(--c-border)' }}>
              <div className="h-full rounded-full" style={{ background: 'var(--c-primary)', width: `${Math.min(100, Math.max(5, 100 - (daysLeft! / 365) * 100))}%` }} />
            </div>
            <p className="text-[10.5px] italic leading-snug" style={{ color: 'var(--c-text-muted)' }}>{motivation}</p>
          </div>
        ) : (
          <div className="pt-3">
            <span className="text-[11px] font-medium block mb-2" style={{ color: 'var(--c-text-muted)' }}>Exam Countdown</span>
            <div className="grid grid-cols-2 gap-1.5">
              {Object.values(ExamType).map((exam) => (
                <button
                  key={exam}
                  onClick={() => {
                    savePreferences({ selectedExam: exam, customExamDate: null });
                    setPrefs({ ...prefs!, selectedExam: exam, customExamDate: null });
                  }}
                  className="text-[11px] px-2 py-1.5 rounded-md text-left transition-all"
                  style={{
                    background: 'var(--bg-elevated)',
                    color: 'var(--c-text-muted)',
                    border: '1px solid var(--c-border)',
                  }}
                >
                  {exam}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* User + Theme */}
      <div className="px-3 pb-4 pt-1">
        <div className="mf-divider" />
        <div className="flex items-center gap-2.5 px-2 py-2.5 mt-1">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
            style={{ background: 'var(--c-primary-soft)', color: 'var(--c-primary)' }}
          >
            PS
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate" style={{ color: 'var(--c-text)' }}>{prefs?.name || 'Prashant Sharma'}</p>
            <p className="text-[10px]" style={{ color: 'var(--c-text-muted)' }}>View profile</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-1 mt-1">
          <motion.button
            onClick={toggleTheme}
            className="p-2 rounded-lg transition-all"
            style={{ background: 'var(--bg-elevated)', color: 'var(--c-text-muted)' }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </motion.button>
        </div>
      </div>
    </aside>
  );
}
