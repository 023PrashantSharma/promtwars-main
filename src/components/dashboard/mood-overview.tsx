'use client';

/* ============================================
   Mood Overview — Last 7 Days
   ============================================ */

import { motion } from 'framer-motion';
import { AnimatedCard } from '@/components/ui/animated-card';
import { MOOD_CONFIG, type MoodEntry } from '@/types';
import { formatDate, getLastNDays } from '@/lib/utils';

interface MoodOverviewProps {
  entries: MoodEntry[];
}

export function MoodOverview({ entries }: MoodOverviewProps) {
  const last7Days = getLastNDays(7);

  return (
    <AnimatedCard className="h-full" delay={0.2} hover={false}>
      <p className="text-xs uppercase tracking-wider text-muted mb-4 font-medium">
        Mood — Last 7 Days
      </p>

      {entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="text-4xl mb-3">🌱</div>
          <p className="text-sm text-muted">
            No mood data yet. Start your first check-in to track your emotional patterns.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Bar chart */}
          <div className="flex items-end justify-between gap-2 h-32 px-2">
            {last7Days.reverse().map((date, i) => {
              const entry = entries.find((e) => e.date === date);
              const mood = entry?.mood || 0;
              const height = mood > 0 ? (mood / 5) * 100 : 5;
              const config = mood > 0 ? MOOD_CONFIG[mood as keyof typeof MOOD_CONFIG] : null;

              return (
                <div key={date} className="flex-1 flex flex-col items-center gap-1">
                  {config && (
                    <span className="text-xs" title={config.label}>
                      {config.emoji}
                    </span>
                  )}
                  <motion.div
                    className="w-full rounded-lg min-h-[4px]"
                    style={{
                      backgroundColor: config ? config.color : 'var(--border)',
                      opacity: config ? 0.8 : 0.3,
                    }}
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ duration: 0.6, delay: 0.3 + i * 0.08 }}
                  />
                  <span className="text-[10px] text-muted">
                    {new Date(date).toLocaleDateString('en', { weekday: 'short' }).slice(0, 2)}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Summary stats */}
          <div className="grid grid-cols-3 gap-3 pt-3 border-t border-border">
            <div className="text-center">
              <p className="text-lg font-semibold text-text">
                {entries.length > 0
                  ? MOOD_CONFIG[Math.round(average(entries.map((e) => e.mood))) as keyof typeof MOOD_CONFIG]?.emoji || '—'
                  : '—'}
              </p>
              <p className="text-[10px] text-muted">Avg Mood</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-text">
                {entries.length > 0
                  ? `${average(entries.map((e) => e.sleepHours)).toFixed(1)}h`
                  : '—'}
              </p>
              <p className="text-[10px] text-muted">Avg Sleep</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-text">
                {entries.length > 0
                  ? `${average(entries.map((e) => e.stress)).toFixed(1)}`
                  : '—'}
              </p>
              <p className="text-[10px] text-muted">Avg Stress</p>
            </div>
          </div>
        </div>
      )}
    </AnimatedCard>
  );
}

function average(nums: number[]): number {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}
