'use client';

/* ============================================
   Quick Actions — Dashboard Shortcuts
   ============================================ */

import Link from 'next/link';
import { motion } from 'framer-motion';
import { AnimatedCard } from '@/components/ui/animated-card';
import { Heart, BookOpen, MessageCircle, Timer } from 'lucide-react';

const ACTIONS = [
  {
    href: '/check-in',
    label: 'Daily Check-in',
    description: 'Record your mood & energy',
    icon: Heart,
    color: '#EF4444',
    bgColor: 'bg-red-500/10',
  },
  {
    href: '/journal',
    label: 'Write Journal',
    description: 'Reflect on your day',
    icon: BookOpen,
    color: '#8B5CF6',
    bgColor: 'bg-purple-500/10',
  },
  {
    href: '/coach',
    label: 'AI Coach',
    description: 'Talk to your wellness coach',
    icon: MessageCircle,
    color: '#4ADE80',
    bgColor: 'bg-green-500/10',
  },
  {
    href: '/focus',
    label: 'Focus Session',
    description: 'Start a focused study timer',
    icon: Timer,
    color: '#F59E0B',
    bgColor: 'bg-yellow-500/10',
  },
];

export function QuickActions() {
  return (
    <AnimatedCard className="h-full" delay={0.3} hover={false}>
      <p className="text-xs uppercase tracking-wider text-muted mb-4 font-medium">
        Quick Actions
      </p>

      <div className="grid grid-cols-2 gap-3">
        {ACTIONS.map((action, i) => {
          const Icon = action.icon;
          return (
            <Link key={action.href} href={action.href}>
              <motion.div
                className="p-4 rounded-2xl border border-border bg-surface/50 hover:border-primary/30
                  transition-all duration-200 cursor-pointer group"
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
              >
                <div
                  className={`w-10 h-10 rounded-xl ${action.bgColor} flex items-center justify-center mb-3`}
                >
                  <Icon className="w-5 h-5" style={{ color: action.color }} />
                </div>
                <p className="text-sm font-medium text-text group-hover:text-primary transition-colors">
                  {action.label}
                </p>
                <p className="text-[11px] text-muted mt-0.5">{action.description}</p>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </AnimatedCard>
  );
}
