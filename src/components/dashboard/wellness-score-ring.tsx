'use client';

/* ============================================
   Wellness Score Ring — Animated Circular Gauge
   ============================================ */

import { motion } from 'framer-motion';
import { AnimatedCard } from '@/components/ui/animated-card';
import { scoreToColor } from '@/lib/utils';
import type { WellnessScore } from '@/types';

interface WellnessScoreRingProps {
  score: WellnessScore;
}

export function WellnessScoreRing({ score }: WellnessScoreRingProps) {
  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference - (score.overall / 100) * circumference;
  const color = scoreToColor(score.overall);

  return (
    <AnimatedCard className="flex flex-col items-center text-center h-full" delay={0.1}>
      <p className="text-xs uppercase tracking-wider text-muted mb-4 font-medium">
        Wellness Score
      </p>

      {/* Ring */}
      <div className="relative w-32 h-32 mb-4">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          {/* Background ring */}
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke="var(--border)"
            strokeWidth="8"
          />
          {/* Score ring */}
          <motion.circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: 'easeOut', delay: 0.5 }}
          />
        </svg>

        {/* Score number */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="text-3xl font-bold"
            style={{ color }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            {score.overall}
          </motion.span>
          <span className="text-xs text-muted">/100</span>
        </div>
      </div>

      {/* Breakdown */}
      <div className="w-full space-y-2">
        {Object.entries(score.breakdown).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between text-xs">
            <span className="text-muted capitalize">
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </span>
            <div className="flex items-center gap-2">
              <div className="w-16 h-1.5 bg-border rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: scoreToColor(value) }}
                  initial={{ width: 0 }}
                  animate={{ width: `${value}%` }}
                  transition={{ duration: 1, delay: 0.8 }}
                />
              </div>
              <span className="text-text-secondary w-6 text-right">{value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Explanation */}
      <p className="text-xs text-muted mt-4 leading-relaxed">{score.explanation}</p>
    </AnimatedCard>
  );
}
