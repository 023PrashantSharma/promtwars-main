'use client';

/* ============================================
   Recovery Panel — Personalized Suggestions
   ============================================ */

import { motion } from 'framer-motion';
import { AnimatedCard } from '@/components/ui/animated-card';
import { generateRecoverySuggestions } from '@/services/wellness-engine';
import type { MoodEntry } from '@/types';

interface RecoveryPanelProps {
  latestEntry?: MoodEntry;
}

export function RecoveryPanel({ latestEntry }: RecoveryPanelProps) {
  const suggestions = generateRecoverySuggestions(latestEntry);

  return (
    <AnimatedCard className="h-full" delay={0.5} hover={false}>
      <p className="text-xs uppercase tracking-wider text-muted mb-4 font-medium">
        Recovery Suggestions
      </p>

      <div className="space-y-3">
        {suggestions.slice(0, 4).map((suggestion, i) => (
          <motion.div
            key={suggestion.id}
            className="flex items-start gap-3 p-3 rounded-xl border border-border
              hover:border-primary/20 transition-all"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 + i * 0.1 }}
          >
            <div className="text-2xl flex-shrink-0">{suggestion.icon}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-text">{suggestion.title}</p>
                {suggestion.duration && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary whitespace-nowrap">
                    {suggestion.duration}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted mt-1 leading-relaxed">
                {suggestion.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </AnimatedCard>
  );
}
