'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { PageTransition, AnimatedCard } from '@/components/ui/animated-card';
import {
  PageContainer,
  PageHeader,
  DashboardCard,
  SectionHeader,
} from '@/components/ui/primitives';
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
  CheckCircle,
  TrendingUp,
  Activity,
  Zap,
} from 'lucide-react';

const RISK_ICONS = {
  [RiskLevel.Low]: Shield,
  [RiskLevel.Moderate]: AlertTriangle,
  [RiskLevel.High]: AlertOctagon,
};

const RISK_COLORS = {
  [RiskLevel.Low]: '#22C55E',
  [RiskLevel.Moderate]: '#F59E0B',
  [RiskLevel.High]: '#EF4444',
};

export default function BurnoutPage() {
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [burnoutData, setBurnoutData] = useState<BurnoutRisk | null>(null);
  const [triggers, setTriggers] = useState<StressTrigger[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  const analyzeBurnout = useCallback(async (recentEntries: MoodEntry[]) => {
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
      // Fallback to local calculation
      const simple = calculateBurnoutScore(recentEntries);
      setBurnoutData({
        level: simple.level,
        score: simple.score,
        factors: [],
        explanation: 'Analysis based on your recent wellness data.',
        recommendations: ['Prioritize sleep', 'Take regular breaks', 'Practice deep breathing'],
        date: new Date().toISOString(),
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
      const recentEntries = getRecentMoodEntries(7);
      setEntries(recentEntries);
      analyzeBurnout(recentEntries);
    }, 0);
    return () => clearTimeout(timer);
  }, [analyzeBurnout]);

  if (!mounted) return null;

  return (
    <PageTransition>
      <PageContainer>
        <PageHeader
          title="Burnout Analysis"
          description="AI-driven assessment of exhaustion factors and pressure triggers."
        />

        {isLoading ? (
          <div className="py-16 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-body text-muted">Calculating cognitive exhaustion index...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 items-start">
            {/* Left Side: Score & Core Metrics Breakdown (8 Columns) */}
            <div className="lg:col-span-8">
              <div className="flex flex-col gap-6">
              
              {/* Score Visual Block */}
              {burnoutData && (
                <DashboardCard className="p-6">
                  <div className="flex flex-col md:flex-row items-center gap-8">
                    {/* Ring Dial */}
                    <div className="flex flex-col items-center shrink-0">
                      <div className="relative w-28 h-28">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="42" fill="none" stroke="var(--c-border)" strokeWidth="6" />
                          <motion.circle
                            cx="50"
                            cy="50"
                            r="42"
                            fill="none"
                            stroke={RISK_COLORS[burnoutData.level]}
                            strokeWidth="6"
                            strokeLinecap="round"
                            strokeDasharray={2 * Math.PI * 42}
                            initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                            animate={{ strokeDashoffset: (2 * Math.PI * 42) - (burnoutData.score / 100) * (2 * Math.PI * 42) }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-heading font-bold text-text">{burnoutData.score}</span>
                          <span className="text-[10px] text-muted leading-none">risk score</span>
                        </div>
                      </div>
                      <span
                        className="text-body font-semibold mt-3"
                        style={{ color: RISK_COLORS[burnoutData.level] }}
                      >
                        {burnoutData.level === RiskLevel.Low
                          ? 'Low Risk'
                          : burnoutData.level === RiskLevel.Moderate
                          ? 'Moderate Risk'
                          : 'High Risk'}
                      </span>
                    </div>

                    {/* Description */}
                    <div className="flex-1 flex flex-col gap-3">
                      <span className="text-caption font-semibold text-muted uppercase tracking-wider block">
                        Exhaustion index explanation
                      </span>
                      <p className="text-body text-text leading-relaxed">
                        {burnoutData.explanation}
                      </p>
                    </div>
                  </div>
                </DashboardCard>
              )}

              {/* Factors meters */}
              {burnoutData && burnoutData.factors.length > 0 && (
                <div className="flex flex-col gap-3">
                  <SectionHeader
                    title="Exhaustion Contributors"
                    description="Individual stress variables measured from recent wellness metrics."
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {burnoutData.factors.map((factor, i) => (
                      <DashboardCard key={i} className="p-4 flex flex-col justify-between h-[110px]">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-body font-medium text-text">{factor.name}</span>
                            <span className="text-caption text-muted">{factor.severity}%</span>
                          </div>
                          <p className="text-[11px] text-muted line-clamp-1">{factor.description}</p>
                        </div>
                        <div className="h-1.5 bg-border rounded-full overflow-hidden w-full mt-2">
                          <motion.div
                            className="h-full rounded-full"
                            style={{ backgroundColor: scoreToColor(100 - factor.severity) }}
                            initial={{ width: 0 }}
                            animate={{ width: `${factor.severity}%` }}
                            transition={{ duration: 0.8 }}
                          />
                        </div>
                      </DashboardCard>
                    ))}
                  </div>
                </div>
              )}

              {/* Stress Triggers */}
              {triggers.length > 0 && (
                <div className="flex flex-col gap-3">
                  <SectionHeader
                    title="Identified Stress Triggers"
                    description="AI detected emotional trigger points extracted from logs."
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {triggers.map((trigger, i) => (
                      <DashboardCard key={trigger.id} className="p-4 flex flex-col justify-between min-h-[120px]">
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="text-caption font-medium text-text truncate">{trigger.trigger}</span>
                            <span
                              className="text-[9px] font-semibold px-2 py-0.5 rounded-full"
                              style={{
                                backgroundColor: `${RISK_COLORS[trigger.severity]}12`,
                                color: RISK_COLORS[trigger.severity],
                                border: `1px solid ${RISK_COLORS[trigger.severity]}20`,
                              }}
                            >
                              {trigger.severity}
                            </span>
                          </div>
                          <p className="text-[11px] text-text-secondary leading-relaxed line-clamp-2">
                            {trigger.insight}
                          </p>
                        </div>
                        <span className="text-[10px] text-muted block mt-2">
                          Detected {trigger.frequency} times recently
                        </span>
                      </DashboardCard>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Side: Action Plan & Recommendations (4 Columns) */}
          <div className="lg:col-span-4">
            <div className="flex flex-col gap-3">
              {burnoutData && burnoutData.recommendations.length > 0 && (
                <DashboardCard className="flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4.5 h-4.5 text-primary shrink-0" />
                    <span className="text-caption font-semibold text-muted uppercase tracking-wider">
                      Preventative Action Plan
                    </span>
                  </div>

                  <div className="flex flex-col gap-3">
                    {burnoutData.recommendations.map((rec, i) => (
                      <div key={i} className="flex gap-3 items-start">
                        <div className="w-5 h-5 rounded-full bg-primary-soft text-primary flex items-center justify-center shrink-0 text-caption font-bold">
                          {i + 1}
                        </div>
                        <p className="text-caption text-text leading-normal pt-0.5">
                          {rec}
                        </p>
                      </div>
                    ))}
                  </div>
                </DashboardCard>
              )}

              {/* Stress Management Guide */}
              <DashboardCard className="flex flex-col gap-3 bg-surface">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-primary" />
                  <span className="text-caption font-semibold text-muted uppercase tracking-wider">
                    Cognitive Recovery
                  </span>
                </div>
                <p className="text-caption text-text-secondary leading-relaxed">
                  Managing stress is an active, daily discipline. If your score displays Moderate or High indicators, check in with an educator, counselor, or trusted individual. Focus on sleep consistency.
                </p>
              </DashboardCard>
            </div>
          </div>
        </div>
        )}
      </PageContainer>
    </PageTransition>
  );
}
