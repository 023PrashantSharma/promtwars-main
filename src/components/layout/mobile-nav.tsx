'use client';

import { useState } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/providers/theme-provider';
import {
  LayoutDashboard, Heart, BookOpen, Brain, MessageCircle, Timer,
  Sun, Moon, Menu, X,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/check-in', label: 'Check-in', icon: Heart },
  { href: '/journal', label: 'Journal', icon: BookOpen },
  { href: '/coach', label: 'AI Coach', icon: MessageCircle },
  { href: '/burnout', label: 'Burnout', icon: Brain },
  { href: '/focus', label: 'Focus', icon: Timer },
];

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  return (
    <>
      {/* Top bar */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-[56px] z-50 flex items-center justify-between px-4 bg-surface border-b border-border">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md overflow-hidden ring-1 ring-border">
            <Image src="/logo.png" alt="MindFlow" width={28} height={28} className="object-cover" />
          </div>
          <span className="font-bold text-[14px] text-text tracking-tight">MindFlow</span>
        </Link>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-1.5 rounded-md text-muted hover:text-text hover:bg-card-hover transition-colors cursor-pointer"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              className="lg:hidden fixed inset-0 z-40 bg-black/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />
            {/* Drawer panel */}
            <motion.div
              className="lg:hidden fixed left-0 top-0 bottom-0 z-50 w-64 flex flex-col bg-sidebar border-r border-border"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            >
              {/* Logo */}
              <div className="px-4 h-[72px] flex items-center gap-2 border-b border-border shrink-0">
                <div className="w-7 h-7 rounded-md overflow-hidden ring-1 ring-border">
                  <Image src="/logo.png" alt="MindFlow" width={28} height={28} className="object-cover" />
                </div>
                <div>
                  <p className="text-[13px] font-bold text-text leading-tight tracking-tight">MindFlow</p>
                  <p className="text-[10px] text-muted leading-tight mt-0.5">Wellness Companion</p>
                </div>
              </div>

              {/* Nav */}
              <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
                {NAV_ITEMS.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)} className="block relative">
                      <div
                        className="flex items-center gap-2 px-3 h-[40px] rounded-md transition-colors duration-150 text-[14px]"
                        style={{
                          background: isActive ? 'rgba(34, 197, 94, 0.08)' : 'transparent',
                          color: isActive ? 'var(--c-primary)' : 'var(--c-text-secondary)',
                        }}
                      >
                        {isActive && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-[16px] bg-primary rounded-r" />
                        )}
                        <Icon className="w-4 h-4 shrink-0" />
                        <span>{item.label}</span>
                      </div>
                    </Link>
                  );
                })}
              </nav>

              {/* Theme Switcher Footer */}
              <div className="p-4 border-t border-border bg-sidebar shrink-0">
                <button
                  onClick={() => {
                    toggleTheme();
                    setIsOpen(false);
                  }}
                  className="flex items-center gap-2 px-3 h-[40px] w-full rounded-md text-muted hover:text-text hover:bg-card-hover transition-colors text-[14px] cursor-pointer"
                >
                  {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
