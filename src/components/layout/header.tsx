'use client';

import { useRouter } from 'next/navigation';
import { useSyncExternalStore } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/providers/theme-provider';
import { getPreferences } from '@/services/storage';
import { Sun, Moon, Bell, LogOut, User } from 'lucide-react';

const emptySubscribe = () => () => {};

function useIsMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

export function Header() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const mounted = useIsMounted();

  if (!mounted) return null;

  const p = getPreferences();
  const storedName = typeof window !== 'undefined' ? localStorage.getItem('mindflow_user_name') : null;
  const userName = p.name || storedName || 'User';
  const initials = userName.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();

  const handleLogout = () => {
    localStorage.removeItem('mindflow_user_id');
    localStorage.removeItem('mindflow_user_name');
    router.push('/');
  };

  return (
    <header
      className="fixed top-0 right-0 h-[48px] bg-surface/80 backdrop-blur-md border-b border-border flex items-center justify-end gap-2"
      style={{ left: 'var(--sidebar-w)', zIndex: 35, paddingLeft: 24, paddingRight: 24 }}
    >
      {/* Notifications */}
      <button
        className="p-1.5 rounded-md text-muted hover:text-text hover:bg-card-hover transition-colors cursor-pointer"
        title="Notifications"
      >
        <Bell className="w-4 h-4" />
      </button>

      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="p-1.5 rounded-md text-muted hover:text-text hover:bg-card-hover transition-colors cursor-pointer"
        title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </button>

      {/* Divider */}
      <div className="w-px h-4 bg-border mx-1" />

      {/* Profile */}
      <div className="flex items-center gap-2 px-1.5 py-1 rounded-md hover:bg-card-hover transition-colors cursor-pointer group">
        <div className="w-6 h-6 rounded-full bg-primary-soft text-primary flex items-center justify-center text-[10px] font-bold shrink-0">
          {initials}
        </div>
        <span className="text-[12px] font-medium text-text-secondary group-hover:text-text transition-colors">
          {userName}
        </span>
      </div>
    </header>
  );
}
