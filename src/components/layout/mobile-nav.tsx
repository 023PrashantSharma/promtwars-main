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
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/check-in', label: 'Check-in', icon: Heart },
  { href: '/journal', label: 'Journal', icon: BookOpen },
  { href: '/burnout', label: 'Burnout', icon: Brain },
  { href: '/coach', label: 'AI Coach', icon: MessageCircle },
  { href: '/focus', label: 'Focus', icon: Timer },
];

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  return (
    <>
      {/* Mobile Header */}
      <header
        className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 py-3.5"
        style={{
          background: 'var(--bg-surface)',
          borderBottom: '1px solid var(--c-border)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0">
            <Image src="/promwars.jpg" alt="MindFlow" width={32} height={32} className="object-cover" />
          </div>
          <span className="font-bold text-sm" style={{ color: 'var(--c-text)' }}>MindFlow</span>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-lg"
          style={{ color: 'var(--c-text)', background: 'var(--bg-elevated)' }}
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="lg:hidden fixed inset-0 z-40"
              style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              className="lg:hidden fixed left-0 top-0 bottom-0 z-50 w-72 flex flex-col mf-sidebar"
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            >
              <div className="px-5 pt-6 pb-5">
                <div className="flex items-center gap-3 p-3 rounded-2xl" style={{ background: 'var(--bg-elevated)' }}>
                  <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0">
                    <Image src="/promwars.jpg" alt="MindFlow" width={40} height={40} className="object-cover" />
                  </div>
                  <div>
                    <h1 className="text-[15px] font-bold leading-tight" style={{ color: 'var(--c-text)' }}>MindFlow</h1>
                    <p className="text-[11px] leading-tight" style={{ color: 'var(--c-text-muted)' }}>Wellness Companion</p>
                  </div>
                </div>
              </div>
              <nav className="flex-1 px-3 space-y-0.5">
                {NAV_ITEMS.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)} className="block">
                      <div className={`mf-nav-item ${isActive ? 'mf-nav-item-active' : ''}`}>
                        <Icon className="w-[18px] h-[18px]" /> <span>{item.label}</span>
                      </div>
                    </Link>
                  );
                })}
              </nav>
              <div className="px-3 pb-5 pt-2">
                <div className="h-px mb-3" style={{ background: 'var(--c-border)' }} />
                <button onClick={toggleTheme} className="mf-nav-item w-full">
                  {theme === 'dark' ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
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
