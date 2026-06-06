'use client';

import Image from 'next/image';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTheme } from '@/providers/theme-provider';
import {
  LayoutDashboard,
  Heart,
  BookOpen,
  Brain,
  MessageCircle,
  Timer,
  Sun,
  Moon,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/check-in', label: 'Check-in', icon: Heart },
  { href: '/journal', label: 'Journal', icon: BookOpen },
  { href: '/burnout', label: 'Burnout', icon: Brain },
  { href: '/coach', label: 'AI Coach', icon: MessageCircle },
  { href: '/focus', label: 'Focus', icon: Timer },
];

export function Sidebar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  return (
    <aside
      className="mf-sidebar fixed left-0 top-0 bottom-0 z-40 flex flex-col"
      style={{ width: 'var(--sidebar-w)' }}
    >
      {/* Logo */}
      <div className="px-5 pt-6 pb-5">
        <div
          className="flex items-center gap-3 p-3 rounded-2xl"
          style={{ background: 'var(--bg-elevated)' }}
        >
          <div className="relative w-10 h-10 rounded-xl overflow-hidden flex-shrink-0">
            <Image
              src="/promwars.jpg"
              alt="MindFlow Logo"
              width={40}
              height={40}
              className="object-cover"
              priority
            />
          </div>
          <div className="min-w-0">
            <h1
              className="text-[15px] font-bold leading-tight truncate"
              style={{ color: 'var(--c-text)' }}
            >
              MindFlow
            </h1>
            <p
              className="text-[11px] leading-tight truncate"
              style={{ color: 'var(--c-text-muted)' }}
            >
              Wellness Companion
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
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
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: 3,
                      height: 18,
                      borderRadius: '0 6px 6px 0',
                      background: 'var(--c-primary)',
                    }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon className="w-[18px] h-[18px] flex-shrink-0" />
                <span>{item.label}</span>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom — Theme Toggle */}
      <div className="px-3 pb-5 pt-2">
        <div
          className="h-px mb-3"
          style={{ background: 'var(--c-border)' }}
        />
        <motion.button
          onClick={toggleTheme}
          className="mf-nav-item w-full"
          whileHover={{ x: 2 }}
          whileTap={{ scale: 0.98 }}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
        >
          {theme === 'dark' ? (
            <Sun className="w-[18px] h-[18px] flex-shrink-0" />
          ) : (
            <Moon className="w-[18px] h-[18px] flex-shrink-0" />
          )}
          <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
        </motion.button>
      </div>
    </aside>
  );
}
