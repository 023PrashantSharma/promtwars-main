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
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 bg-surface border-b border-border">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg overflow-hidden">
            <Image src="/promwars.jpg" alt="MindFlow" width={28} height={28} className="object-cover" />
          </div>
          <span className="font-bold text-sm text-text">MindFlow</span>
        </Link>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-1.5 rounded-lg bg-elevated text-text cursor-pointer"
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
              className="lg:hidden fixed left-0 top-0 bottom-0 z-50 w-64 flex flex-col bg-surface border-r border-border"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            >
              {/* Logo */}
              <div className="px-4 pt-5 pb-4 flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl overflow-hidden">
                  <Image src="/promwars.jpg" alt="MindFlow" width={32} height={32} className="object-cover" />
                </div>
                <div>
                  <p className="text-sm font-bold text-text">MindFlow</p>
                  <p className="text-[10px] text-muted">Wellness Companion</p>
                </div>
              </div>

              {/* Nav */}
              <nav className="flex-1 px-3 space-y-0.5">
                {NAV_ITEMS.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)} className="block">
                      <div className={`mf-nav-item ${isActive ? 'mf-nav-item-active' : ''}`}>
                        <Icon className="w-[17px] h-[17px]" />
                        <span>{item.label}</span>
                      </div>
                    </Link>
                  );
                })}
              </nav>

              {/* Theme */}
              <div className="px-3 pb-4">
                <div className="mf-divider" />
                <button
                  onClick={toggleTheme}
                  className="mf-nav-item w-full mt-1 cursor-pointer"
                >
                  {theme === 'dark' ? <Sun className="w-[17px] h-[17px]" /> : <Moon className="w-[17px] h-[17px]" />}
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
