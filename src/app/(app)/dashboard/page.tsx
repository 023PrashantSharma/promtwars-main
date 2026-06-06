'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { PageTransition, AnimatedCard } from '@/components/ui/animated-card';
import { ParticleField } from '@/components/ui/particle-field';
import {
  PageContainer,
  PageHeader,
  DashboardCard,
  StatCard,
  SectionHeader,
  CommandAction,
} from '@/components/ui/primitives';
import {
  getRecentMoodEntries,
  getPreferences,
  getJournalEntries,
  getFocusStreak,
  getChatHistory,
  syncUserData,
} from '@/services/storage';
import {
  calculateWellnessScore,
  calculateBurnoutScore,
  generateRecoverySuggestions,
} from '@/services/wellness-engine';
import { getGreeting, scoreToColor, daysUntil } from '@/lib/utils';
import { MOOD_CONFIG, RiskLevel, ExamType, DEFAULT_EXAM_DATES } from '@/types';
import type { MoodEntry, UserPreferences, WellnessScore, JournalEntry, ChatMessage } from '@/types';
import {
  Heart,
  BookOpen,
  MessageCircle,
  Timer,
  Shield,
  TrendingUp,
  Moon as MoonIcon,
  Bell,
  Mic,
  Send,
  Zap,
  Flame,
  Calendar,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [focusStreak, setFocusStreak] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [chatPreview, setChatPreview] = useState<ChatMessage[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
      setMoodEntries(getRecentMoodEntries(7));
      setPreferences(getPreferences());
      setJournals(getJournalEntries().slice(0, 3));
      setFocusStreak(getFocusStreak());
      setChatPreview(getChatHistory().slice(-2));

      syncUserData()
        .then(() => {
          setMoodEntries(getRecentMoodEntries(7));
          setPreferences(getPreferences());
          setJournals(getJournalEntries().slice(0, 3));
          setFocusStreak(getFocusStreak());
          setChatPreview(getChatHistory().slice(-2));
        })
        .catch((err) => console.error('Sync failed:', err));
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) return null;

  const wellnessScore = calculateWellnessScore(moodEntries);
  const burnoutRisk = calculateBurnoutScore(moodEntries);
  const greeting = getGreeting();
  const userName = (typeof window !== 'undefined' && localStorage.getItem('mindflow_user_name')) || preferences?.name || 'there';
  const suggestions = generateRecoverySuggestions(moodEntries[0]);
  const latestMood = moodEntries[0];
  const avgSleep = moodEntries.length > 0
    ? (moodEntries.reduce((a, e) => a + e.sleepHours, 0) / moodEntries.length).toFixed(1)
    : '—';

  // Mood label
  const moodLabel = latestMood
    ? MOOD_CONFIG[latestMood.mood as keyof typeof MOOD_CONFIG]?.label || 'Okay'
    : '—';
  const moodEmoji = latestMood
    ? MOOD_CONFIG[latestMood.mood as keyof typeof MOOD_CONFIG]?.emoji || '😐'
    : '😐';

  // Countdown calculations
  const selectedExam = preferences?.selectedExam || null;
  const examDate = selectedExam ? (preferences?.customExamDate || DEFAULT_EXAM_DATES[selectedExam]) : null;
  const daysLeft = examDate ? daysUntil(examDate) : null;

  // Chart data formatting
  const chartData = [...moodEntries].slice(0, 7).reverse().map(e => {
    const d = new Date(e.date);
    return {
      name: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      Mood: e.mood * 20, // scale to 100
      Stress: e.stress * 10, // scale to 100
      Energy: e.energy * 20, // scale to 100
    };
  });

  return (
    <PageTransition>
      <PageContainer>
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <ParticleField particleCount={8} />
        </div>
        
        {/* ===== TOP NAVIGATION BAR VIEWPORT ANSWERS ===== */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 z-10">
          <div>
            <h1 className="text-display font-semibold tracking-tight text-text">
              {greeting}, {userName}
            </h1>
            <p className="text-body text-muted mt-1">
              Here is your wellness and preparation overview.
            </p>
          </div>
        </div>

        {/* ===== ROW 1: 4 STAT CARDS (Answers 3 core questions immediately) ===== */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 z-10">
          <StatCard
            label="How am I doing?"
            value={`${wellnessScore.overall}/100`}
            sub={
              <span className="flex items-center gap-1">
                Mood: {moodEmoji} {moodLabel}
              </span>
            }
            icon={<TrendingUp className="w-4 h-4 text-primary" />}
          />
          <StatCard
            label="What requires attention?"
            value={
              <span
                style={{
                  color:
                    burnoutRisk.level === RiskLevel.Low
                      ? 'var(--c-primary)'
                      : burnoutRisk.level === RiskLevel.Moderate
                      ? 'var(--color-warning)'
                      : 'var(--color-destructive)',
                }}
              >
                {burnoutRisk.level === RiskLevel.Low
                  ? 'Low Risk'
                  : burnoutRisk.level === RiskLevel.Moderate
                  ? 'Mod Risk'
                  : 'High Risk'}
              </span>
            }
            sub={`Burnout risk is ${burnoutRisk.level.toLowerCase()}`}
            icon={<Shield className="w-4 h-4 text-primary" />}
          />
          <StatCard
            label="Exam Countdown"
            value={daysLeft !== null && daysLeft > 0 ? `${daysLeft} days` : 'No Exam'}
            sub={selectedExam ? `${selectedExam} preparation` : 'Set exam in Check-in'}
            icon={<Calendar className="w-4 h-4 text-primary" />}
          />
          <StatCard
            label="Focus Streak"
            value={`${focusStreak} days`}
            sub={`Completed ${avgSleep} hrs avg sleep`}
            icon={<Flame className="w-4 h-4 text-warning" />}
          />
        </div>

        {/* ===== ROW 2: CHART (7 Cols) + RING (2 Cols) + ACTIONS (3 Cols) ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 z-10 items-stretch">
          {/* Wellness Chart - 7 Columns */}
          <div className="lg:col-span-7 flex flex-col">
            <DashboardCard className="flex-1 flex flex-col justify-between">
              <div>
                <SectionHeader
                  title="Wellness Trend"
                  description="Mood, Stress, and Energy metrics scaled to 100"
                />
                <div className="flex items-center gap-4 mb-4">
                  <span className="flex items-center gap-1.5 text-caption text-muted">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary" /> Mood
                  </span>
                  <span className="flex items-center gap-1.5 text-caption text-muted">
                    <span className="w-2.5 h-2.5 rounded-full bg-warning" /> Stress
                  </span>
                  <span className="flex items-center gap-1.5 text-caption text-muted">
                    <span className="w-2.5 h-2.5 rounded-full bg-info" /> Energy
                  </span>
                </div>
              </div>

              <div className="h-[200px] w-full mt-2">
                {chartData.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-caption text-muted">
                    Complete your daily check-in to generate trends.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                      <CartesianGrid vertical={false} stroke="var(--c-border)" strokeDasharray="3 3" />
                      <XAxis dataKey="name" stroke="var(--c-text-muted)" fontSize={11} tickLine={false} />
                      <YAxis domain={[0, 100]} stroke="var(--c-text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                      <Tooltip
                        contentStyle={{
                          background: 'var(--c-surface)',
                          borderColor: 'var(--c-border)',
                          borderRadius: '8px',
                          color: 'var(--c-text)',
                          fontSize: '12px',
                        }}
                      />
                      <Line type="monotone" dataKey="Mood" stroke="#22C55E" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                      <Line type="monotone" dataKey="Stress" stroke="#F59E0B" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                      <Line type="monotone" dataKey="Energy" stroke="#3B82F6" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </DashboardCard>
          </div>

          {/* Study Wellness Balance - 2 Columns */}
          <div className="lg:col-span-2 flex flex-col">
            <DashboardCard className="flex-1 flex flex-col justify-between items-center text-center">
              <span className="text-caption font-semibold text-muted uppercase tracking-wider block mb-2 w-full text-left">
                Balance
              </span>
              <div className="my-auto flex flex-col items-center">
                <WellnessRing score={wellnessScore} />
                <p className="text-body font-semibold mt-3 text-primary">
                  {wellnessScore.overall >= 70
                    ? 'Balanced'
                    : wellnessScore.overall >= 50
                    ? 'Moderate'
                    : 'Needs Focus'}
                </p>
              </div>
            </DashboardCard>
          </div>

          {/* Quick Actions - 3 Columns */}
          <div className="lg:col-span-3 flex flex-col">
            <DashboardCard className="flex-1 flex flex-col justify-between">
              <span className="text-caption font-semibold text-muted uppercase tracking-wider block mb-2">
                Quick Actions
              </span>
              <div className="flex-1 flex flex-col justify-center gap-1">
                {ACTIONS.map(a => (
                  <CommandAction
                    key={a.href}
                    href={a.href}
                    label={a.label}
                    description={a.desc}
                    icon={<a.icon className="w-4 h-4" style={{ color: a.color }} />}
                  />
                ))}
              </div>
            </DashboardCard>
          </div>
        </div>

        {/* ===== ROW 3: SUMMARY (1/3) + SUGGESTIONS (1/3) + AI COACH (1/3) (Equal Heights) ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 z-10 items-stretch">
          {/* Today's Wellness Summary & AI Insight */}
          <DashboardCard className="flex flex-col justify-between min-h-[260px]">
            <div>
              <SectionHeader title="Wellness Summary" />
              <p className="text-body text-text leading-relaxed">
                {moodEntries.length > 0
                  ? `You logged a ${moodLabel.toLowerCase()} mood today with an average sleep of ${avgSleep} hours. Wellness levels are sitting at ${wellnessScore.overall}%.`
                  : "You haven't completed your daily check-in yet. Logging your mood provides custom wellness metrics."}
              </p>
            </div>
            
            <div className="p-3.5 bg-card-hover border border-border rounded-lg flex gap-3.5 items-start mt-4">
              <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <div className="min-w-0">
                <span className="text-[11px] font-semibold text-muted uppercase tracking-wider block mb-0.5">
                  AI Insight of the Day
                </span>
                <p className="text-caption text-text-secondary leading-normal">
                  {wellnessScore.overall >= 70
                    ? "Your study and self-care balance is excellent. Maintain this routine to keep peak cognitive performance."
                    : "Small micro-breaks of 5 minutes during long study sprints will help reset your mental bandwidth."}
                </p>
              </div>
            </div>
          </DashboardCard>

          {/* Recovery Recommendations & Recommended Action */}
          <DashboardCard className="flex flex-col justify-between min-h-[260px]">
            <div>
              <SectionHeader title="Recovery Suggestions" />
              <div className="flex flex-col gap-2 mt-2">
                {suggestions.slice(0, 3).map((s) => (
                  <div key={s.id} className="flex items-center justify-between p-2 rounded-md hover:bg-card-hover transition-colors">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-base shrink-0">{s.icon}</span>
                      <div className="min-w-0">
                        <p className="text-caption font-medium text-text truncate">{s.title}</p>
                        <p className="text-[10px] text-muted truncate">{s.description}</p>
                      </div>
                    </div>
                    {s.duration && (
                      <span className="text-[10px] bg-primary-soft text-primary px-1.5 py-0.5 rounded-full shrink-0">
                        {s.duration}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
              <div>
                <span className="text-[10px] font-medium text-muted block">Recommended Action</span>
                <span className="text-body font-semibold text-text">
                  {suggestions[0]?.title || 'Daily Wellness Check-in'}
                </span>
              </div>
              <Link
                href={suggestions[0] ? '/dashboard' : '/check-in'}
                className="text-caption text-primary font-medium hover:underline flex items-center gap-1"
              >
                Start now →
              </Link>
            </div>
          </DashboardCard>

          {/* AI Coach Preview */}
          <DashboardCard className="flex flex-col justify-between min-h-[260px]">
            <div>
              <SectionHeader title="AI Coach" />
              <div className="flex flex-col gap-2 my-auto">
                {chatPreview.length > 0 ? (
                  chatPreview.map(msg => (
                    <div key={msg.id} className={msg.role === 'user' ? 'mf-bubble-user text-[12px] py-1.5 px-3' : 'mf-bubble-ai text-[12px] py-1.5 px-3'}>
                      <p className="line-clamp-2 leading-relaxed">{msg.content}</p>
                    </div>
                  ))
                ) : (
                  <div className="p-3.5 bg-card-hover border border-border rounded-lg text-caption text-text-secondary leading-normal flex items-start gap-2">
                    <span className="text-sm shrink-0">🌱</span>
                    <p>
                      It&apos;s okay to have tough days. Progress isn&apos;t always linear. How can I support your study focus today?
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border">
              <input
                className="mf-input text-caption py-1.5 h-8"
                placeholder="Ask anything..."
                readOnly
                onClick={() => router.push('/coach')}
              />
              <button
                onClick={() => router.push('/coach')}
                className="p-1.5 bg-primary rounded-md shrink-0 flex items-center justify-center h-8 w-8 hover:bg-primary-hover transition-colors"
              >
                <Send className="w-4.5 h-4.5 text-white" />
              </button>
            </div>
          </DashboardCard>
        </div>

        {/* ===== MOCK FOOTER ===== */}
        <div className="text-center pt-4 opacity-50">
          <p className="text-caption italic text-muted">
            MindFlow is not a substitute for professional medical advice. If you are in crisis, please seek immediate help.
          </p>
        </div>
      </PageContainer>
    </PageTransition>
  );
}

/* ========== Ring Component ========== */
function WellnessRing({ score }: { score: WellnessScore }) {
  const r = 40;
  const c = 2 * Math.PI * r;
  const offset = c - (score.overall / 100) * c;
  const color = scoreToColor(score.overall);
  return (
    <div className="relative w-24 h-24">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} fill="none" stroke="var(--c-border)" strokeWidth="6" />
        <motion.circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[18px] font-bold text-text">{score.overall}</span>
        <span className="text-[10px] text-muted leading-none">/100</span>
      </div>
    </div>
  );
}

const ACTIONS = [
  { href: '/check-in', label: 'Daily Check-in', desc: 'Log mood', icon: Heart, color: '#EF4444' },
  { href: '/journal', label: 'Write Journal', desc: 'Reflect', icon: BookOpen, color: '#8B5CF6' },
  { href: '/coach', label: 'AI Coach', desc: 'Talk to AI', icon: MessageCircle, color: '#22C55E' },
  { href: '/focus', label: 'Focus Session', desc: 'Timer', icon: Timer, color: '#F59E0B' },
  { href: '/journal', label: 'Voice Journal', desc: 'Record', icon: Mic, color: '#3B82F6' },
];
