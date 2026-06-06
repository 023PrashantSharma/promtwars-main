'use client';

/* ============================================
   Recent Journals — Dashboard Widget
   ============================================ */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { AnimatedCard } from '@/components/ui/animated-card';
import { BookOpen, ArrowRight } from 'lucide-react';
import { getJournalEntries } from '@/services/storage';
import { formatRelativeTime } from '@/lib/utils';
import type { JournalEntry } from '@/types';

export function RecentJournals() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);

  useEffect(() => {
    setEntries(getJournalEntries().slice(0, 3));
  }, []);

  return (
    <AnimatedCard className="h-full" delay={0.4} hover={false}>
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs uppercase tracking-wider text-muted font-medium">
          Recent Journal
        </p>
        <Link
          href="/journal"
          className="text-xs text-primary hover:text-primary-hover transition-colors flex items-center gap-1"
        >
          View all <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <BookOpen className="w-10 h-10 text-muted/30 mb-3" />
          <p className="text-sm text-muted">No journal entries yet.</p>
          <Link
            href="/journal"
            className="text-xs text-primary hover:underline mt-2"
          >
            Write your first entry →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry, i) => (
            <motion.div
              key={entry.id}
              className="p-3 rounded-xl border border-border hover:border-primary/20 transition-all cursor-pointer"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm text-text line-clamp-2 flex-1">
                  {entry.content.slice(0, 100)}
                  {entry.content.length > 100 ? '...' : ''}
                </p>
                <span className="text-[10px] text-muted whitespace-nowrap">
                  {formatRelativeTime(entry.createdAt)}
                </span>
              </div>
              {entry.emotionTags.length > 0 && (
                <div className="flex gap-1 mt-2 flex-wrap">
                  {entry.emotionTags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </AnimatedCard>
  );
}
