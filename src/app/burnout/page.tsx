'use client';

/* ============================================
   Burnout Analysis Page
   ============================================ */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PageTransition, AnimatedCard } from '@/components/ui/animated-card';
import { getRecentMoodEntries } from '@/services/storage';
import { getAIProvider } from '@/services/ai/provider';
import { calculateBurnoutScore } from '@/services/wellness-engine';
import { RiskLevel } from '@/types';
import type { MoodEntry, BurnoutRisk, StressTrigger } from '@/types';
import { scoreToColor } from '@/lib/utils';
import {
  Brain,
  Shield,
  AlertTriangle,
  AlertOctagon,
  Loader2,
  TrendingUp,
  Target,
  Zap,
} from 'lucide-react';

const RISK_ICONS = {
  [RiskLevel.Low]: Shield,
  [RiskLevel.Moderate]: AlertTriangle,
  [RiskLevel.High]: AlertOctagon,
};

const RISK_COLORS = {
  [RiskLevel.Low]: '#4ADE80',
  [RiskLevel.Moderate]: '#F59E0B',
  [RiskLevel.High]: '#EF4444',
};

export default function BurnoutPage() {
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [burnoutData, setBurnoutData] = useState<BurnoutRisk | null>(null);
  const [triggers, setTriggers] = useState<StressTrigger[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const recentEntries = getRecentMoodEntries(7);
    setEntries(recentEntries);
    analyzeBurnout(recentEntries);
  }, []);

  const analyzeBurnout = async (recentEntries: MoodEntry[]) => {
    setIsLoading(true);
    try {
      const provider = getAIProvider();

      if (recentEntries.length === 0) {
        const simple = calculateBurnoutScore(recentEntries);
        setBurnoutData({
          level: simple.level,
          score: simple.score,
          factors: [],
          explanation: 'Complete your first check-in to get a burnout risk assessment.',
          recommendations: ['Start your daily check-in', 'Track your mood regularly'],
          date: new Date().toISOString(),
        });
        setIsLoading(false);
        return;
      }

      const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;

      const result = await provider.analyzeBurnoutRisk({
        recentMoods: recentEntries.map((e) => e.mood),
        recentStress: recentEntries.map((e) => e.stress),
        recentSleep: recentEntries.map((e) => e.sleepHours),
        recentStudyHours: recentEntries.map((e) => e.studyHours || 0),
        averageMood: avg(recentEntries.map((e) => e.mood)),
        averageStress: avg(recentEntries.map((e) => e.stress)),
        averageSleep: avg(recentEntries.map((e) => e.sleepHours)),
      });

      setBurnoutData(result.risk);

      // Get stress triggers
      const triggerResult = await provider.identifyTriggers({
        journalEntries: [],
        moodPatterns: recentEntries.map((e) => ({
          date: e.date,
          mood: e.mood,
          stress: e.stress,
          notes: e.notes,
        })),
      });
      setTriggers(triggerResult);
    } catch (error) {
      console.error('Burnout analysis failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <PageTransition>
      <div className="max-w-3xl mx-auto py-4">
        <h1 className="text-2xl font-bold text-text mb-2 flex items-center gap-2">
          <Brain className="w-6 h-6 text-primary" />
          Burnout Analysis
        </h1>
        <p className="text-muted text-sm mb-8">
          AI-powered analysis of your burnout risk based on your wellness data.
        </p>

        {isLoading ? (
          <AnimatedCard className="text-center py-16" hover={false}>
            <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
            <p className="text-muted">Analyzing your wellness patterns...</p>
          </AnimatedCard>
        ) : (
          <div className="space-y-6">
            {/* Risk Score */}
            {burnoutData && (
              <AnimatedCard hover={false}>
                <div className="flex flex-col md:flex-row items-center gap-6">
                  {/* Risk Gauge */}
                  <div className="flex flex-col items-center">
                    <motion.div
                      className="w-24 h-24 rounded-full flex items-center justify-center"
                      style={{
                        backgroundColor: `${RISK_COLORS[burnoutData.level]}15`,
                        border: `2px solid ${RISK_COLORS[burnoutData.level]}40`,
                      }}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', delay: 0.3 }}
                    >
                      {(() => {
                        const Icon = RISK_ICONS[burnoutData.level];
                        return (
                          <Icon
                            className="w-10 h-10"
                            style={{ color: RISK_COLORS[burnoutData.level] }}
                          />
                        );
                      })()}
                    </motion.div>
                    <p
                      className="text-lg font-bold mt-3"
                      style={{ color: RISK_COLORS[burnoutData.level] }}
                    >
                      {burnoutData.level === RiskLevel.Low
                        ? 'Low Risk'
                        : burnoutData.level === RiskLevel.Moderate
                        ? 'Moderate Risk'
                        : 'High Risk'}
                    </p>
                    <p className="text-xs text-muted">Score: {burnoutData.score}/100</p>
                  </div>

                  {/* Explanation */}
                  <div className="flex-1">
                    <p className="text-sm text-text leading-relaxed mb-4">
                      {burnoutData.explanation}
                    </p>

                    {/* Factors */}
                    {burnoutData.factors.length > 0 && (
                      <div className="space-y-2">
                        {burnoutData.factors.map((factor, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-3 p-3 rounded-xl bg-surface border border-border"
                          >
                            <div className="w-2 h-2 rounded-full" style={{
                              backgroundColor: scoreToColor(100 - factor.severity)
                            }} />
                            <div className="flex-1">
                              <p className="text-xs font-medium text-text">{factor.name}</p>
                              <p className="text-[11px] text-muted">{factor.description}</p>
                            </div>
                            <div className="w-12 h-1.5 bg-border rounded-full overflow-hidden">
                              <motion.div
                                className="h-full rounded-full"
                                style={{ backgroundColor: scoreToColor(100 - factor.severity) }}
                                initial={{ width: 0 }}
                                animate={{ width: `${factor.severity}%` }}
                                transition={{ duration: 0.8, delay: 0.5 + i * 0.1 }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </AnimatedCard>
            )}

            {/* Recommendations */}
            {burnoutData && burnoutData.recommendations.length > 0 && (
              <AnimatedCard hover={false} delay={0.2}>
                <div className="flex items-center gap-2 mb-4">
                  <Target className="w-4 h-4 text-primary" />
                  <p className="text-xs uppercase tracking-wider text-muted font-medium">
                    Recommendations
                  </p>
                </div>
                <div className="space-y-3">
                  {burnoutData.recommendations.map((rec, i) => (
                    <motion.div
                      key={i}
                      className="flex items-start gap-3 p-3 rounded-xl bg-surface border border-border"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + i * 0.1 }}
                    >
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs text-primary font-medium">{i + 1}</span>
                      </div>
                      <p className="text-sm text-text">{rec}</p>
                    </motion.div>
                  ))}
                </div>
              </AnimatedCard>
            )}

            {/* Stress Triggers */}
            {triggers.length > 0 && (
              <AnimatedCard hover={false} delay={0.3}>
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="w-4 h-4 text-warning" />
                  <p className="text-xs uppercase tracking-wider text-muted font-medium">
                    Identified Stress Triggers
                  </p>
                </div>
                <div className="space-y-3">
                  {triggers.map((trigger, i) => (
                    <motion.div
                      key={trigger.id}
                      className="p-4 rounded-xl border border-border"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + i * 0.1 }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-text">{trigger.trigger}</p>
                        <span
                          className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                          style={{
                            backgroundColor: `${RISK_COLORS[trigger.severity]}15`,
                            color: RISK_COLORS[trigger.severity],
                          }}
                        >
                          {trigger.severity}
                        </span>
                      </div>
                      <p className="text-xs text-muted leading-relaxed">{trigger.insight}</p>
                      <p className="text-[10px] text-muted/60 mt-2">
                        Detected {trigger.frequency} times
                      </p>
                    </motion.div>
                  ))}
                </div>
              </AnimatedCard>
            )}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
