'use client';

/* ============================================
   Dashboard — Main Page (Wellness Redesign)
   ============================================ */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { PageTransition, AnimatedCard } from '@/components/ui/animated-card';
import { ParticleField } from '@/components/ui/particle-field';
import { getRecentMoodEntries, getPreferences, getJournalEntries, getFocusStreak } from '@/services/storage';
import { calculateWellnessScore, calculateBurnoutScore, generateRecoverySuggestions } from '@/services/wellness-engine';
import { getGreeting, scoreToColor, daysUntil } from '@/lib/utils';
import { MOOD_CONFIG, RiskLevel, ExamType, DEFAULT_EXAM_DATES, EnergyLevel } from '@/types';
import type { MoodEntry, UserPreferences, WellnessScore, JournalEntry } from '@/types';
import { savePreferences } from '@/services/storage';
import {
  Heart, BookOpen, MessageCircle, Timer, Shield, AlertTriangle,
  AlertOctagon, ArrowRight, Calendar, Sparkles, Flame, ChevronDown,
  TrendingUp, Moon as MoonIcon,
} from 'lucide-react';

export default function DashboardPage() {
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [focusStreak, setFocusStreak] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setMoodEntries(getRecentMoodEntries(7));
    setPreferences(getPreferences());
    setJournals(getJournalEntries().slice(0, 3));
    setFocusStreak(getFocusStreak());
  }, []);

  if (!mounted) return null;

  const wellnessScore = calculateWellnessScore(moodEntries);
  const burnoutRisk = calculateBurnoutScore(moodEntries);
  const greeting = getGreeting();
  const userName = preferences?.name || 'there';
  const suggestions = generateRecoverySuggestions(moodEntries[0]);
  const selectedExam = preferences?.selectedExam || null;
  const examDate = selectedExam ? (preferences?.customExamDate || DEFAULT_EXAM_DATES[selectedExam]) : null;
  const daysLeft = examDate ? daysUntil(examDate) : null;

  return (
    <PageTransition>
      <div className="relative min-h-[calc(100vh-4rem)]">
        {/* Ambient particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ borderRadius: 'var(--radius-card)' }}>
          <ParticleField particleCount={18} />
        </div>
        <div className="mf-spotlight" />

        <div className="relative z-10 space-y-8">
          {/* ===== Hero Greeting ===== */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1
              className="text-3xl md:text-4xl font-bold mb-2"
              style={{ color: 'var(--c-text)' }}
            >
              {greeting},{' '}
              <span className="text-gradient">{userName}</span>
              <span className="ml-2">✨</span>
            </h1>
            <p className="text-base" style={{ color: 'var(--c-text-secondary)' }}>
              {moodEntries.length > 0
                ? "Here's how your wellness is looking this week."
                : 'Welcome to MindFlow. Start your first check-in to unlock your wellness insights.'}
            </p>
          </motion.div>

          {/* ===== Row 1: Score, Burnout, Exam ===== */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Wellness Score Ring */}
            <AnimatedCard delay={0.1} hover={false}>
              <p className="mf-label">Wellness Score</p>
              <div className="flex flex-col items-center pt-2">
                <WellnessRing score={wellnessScore} />
                <div className="w-full mt-5 space-y-2.5">
                  {Object.entries(wellnessScore.breakdown).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-xs capitalize" style={{ color: 'var(--c-text-muted)' }}>
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-20 h-[5px] rounded-full overflow-hidden"
                          style={{ background: 'var(--c-border)' }}
                        >
                          <motion.div
                            className="h-full rounded-full"
                            style={{ backgroundColor: scoreToColor(value) }}
                            initial={{ width: 0 }}
                            animate={{ width: `${value}%` }}
                            transition={{ duration: 1, delay: 0.8 }}
                          />
                        </div>
                        <span className="text-xs w-6 text-right font-medium" style={{ color: 'var(--c-text-secondary)' }}>
                          {value}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs mt-4 text-center leading-relaxed" style={{ color: 'var(--c-text-muted)' }}>
                  {wellnessScore.explanation}
                </p>
              </div>
            </AnimatedCard>

            {/* Burnout Risk */}
            <AnimatedCard delay={0.2} hover={false}>
              <p className="mf-label">Burnout Risk</p>
              <BurnoutGauge risk={burnoutRisk} />
            </AnimatedCard>

            {/* Exam Countdown */}
            <AnimatedCard delay={0.3} hover={false}>
              <p className="mf-label">Exam Countdown</p>
              <ExamCountdown
                selectedExam={selectedExam}
                daysLeft={daysLeft}
                onSelectExam={(exam: ExamType) => {
                  savePreferences({ selectedExam: exam });
                  setPreferences({ ...preferences!, selectedExam: exam });
                }}
              />
            </AnimatedCard>
          </div>

          {/* ===== Row 2: Mood + Quick Actions ===== */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Mood Overview */}
            <AnimatedCard delay={0.2} hover={false}>
              <p className="mf-label">Mood — Last 7 Days</p>
              <MoodChart entries={moodEntries} />
            </AnimatedCard>

            {/* Quick Actions */}
            <AnimatedCard delay={0.3} hover={false}>
              <p className="mf-label">Quick Actions</p>
              <QuickActionGrid />
            </AnimatedCard>
          </div>

          {/* ===== Row 3: Journals + Recovery ===== */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Journal */}
            <AnimatedCard delay={0.4} hover={false}>
              <div className="flex items-center justify-between mb-4">
                <p className="mf-label mb-0">Recent Journal</p>
                <Link
                  href="/journal"
                  className="text-xs font-medium flex items-center gap-1"
                  style={{ color: 'var(--c-primary)' }}
                >
                  View all <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <JournalList entries={journals} />
            </AnimatedCard>

            {/* Recovery */}
            <AnimatedCard delay={0.5} hover={false}>
              <p className="mf-label">Recovery Suggestions</p>
              <RecoveryList suggestions={suggestions.slice(0, 4)} />
            </AnimatedCard>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}

/* ---- Subcomponents ---- */

function WellnessRing({ score }: { score: WellnessScore }) {
  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference - (score.overall / 100) * circumference;
  const color = scoreToColor(score.overall);

  return (
    <div className="relative w-36 h-36">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="54" fill="none" stroke="var(--c-border)" strokeWidth="8" />
        <motion.circle
          cx="60" cy="60" r="54" fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: 'easeOut', delay: 0.5 }}
        />
      </svg>
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
        <span className="text-[11px]" style={{ color: 'var(--c-text-muted)' }}>/100</span>
      </div>
    </div>
  );
}

function BurnoutGauge({ risk }: { risk: { score: number; level: RiskLevel } }) {
  const cfg = {
    [RiskLevel.Low]: { icon: Shield, label: 'Low Risk', color: '#4ADE80', msg: "You're doing great! Keep it up." },
    [RiskLevel.Moderate]: { icon: AlertTriangle, label: 'Moderate Risk', color: '#F59E0B', msg: 'Some areas need attention. Take a break soon.' },
    [RiskLevel.High]: { icon: AlertOctagon, label: 'High Risk', color: '#EF4444', msg: 'Please prioritize rest. Your wellbeing matters most.' },
  }[risk.level];
  const Icon = cfg.icon;

  return (
    <div className="flex flex-col items-center justify-center pt-4">
      <motion.div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
        style={{ background: `${cfg.color}15` }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', delay: 0.4 }}
      >
        <Icon className="w-8 h-8" style={{ color: cfg.color }} />
      </motion.div>
      <motion.p
        className="text-lg font-semibold mb-2"
        style={{ color: cfg.color }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        {cfg.label}
      </motion.p>
      <div className="w-full max-w-[200px] mb-3">
        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--c-border)' }}>
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: cfg.color }}
            initial={{ width: 0 }}
            animate={{ width: `${risk.score}%` }}
            transition={{ duration: 1, delay: 0.5 }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[10px]" style={{ color: 'var(--c-text-muted)' }}>Safe</span>
          <span className="text-[10px]" style={{ color: 'var(--c-text-muted)' }}>Critical</span>
        </div>
      </div>
      <p className="text-xs text-center leading-relaxed" style={{ color: 'var(--c-text-muted)' }}>{cfg.msg}</p>
    </div>
  );
}

function ExamCountdown({ selectedExam, daysLeft, onSelectExam }: {
  selectedExam: ExamType | null;
  daysLeft: number | null;
  onSelectExam: (exam: ExamType) => void;
}) {
  const [showPicker, setShowPicker] = useState(!selectedExam);

  if (selectedExam && daysLeft !== null && !showPicker) {
    return (
      <div className="flex flex-col items-center justify-center pt-4">
        <button onClick={() => setShowPicker(true)} className="flex items-center gap-1 text-xs mb-3" style={{ color: 'var(--c-text-muted)' }}>
          <Calendar className="w-3.5 h-3.5" /> {selectedExam} <ChevronDown className="w-3 h-3" />
        </button>
        <motion.div
          className="text-5xl font-bold text-gradient mb-1"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', delay: 0.5 }}
        >
          {daysLeft}
        </motion.div>
        <p className="text-sm mb-4" style={{ color: 'var(--c-text-muted)' }}>days remaining</p>
        <p className="text-xs text-center italic leading-relaxed" style={{ color: 'var(--c-text-muted)' }}>
          &ldquo;Every day of preparation is an investment in your future.&rdquo;
        </p>
      </div>
    );
  }

  return (
    <div>
      {!selectedExam && (
        <div className="flex flex-col items-center py-4 mb-4">
          <Calendar className="w-10 h-10 mb-2" style={{ color: 'var(--c-text-muted)', opacity: 0.4 }} />
          <p className="text-sm text-center" style={{ color: 'var(--c-text-muted)' }}>
            Select your exam
          </p>
        </div>
      )}
      <div className="grid grid-cols-2 gap-2">
        {Object.values(ExamType).map((exam) => (
          <motion.button
            key={exam}
            onClick={() => { onSelectExam(exam); setShowPicker(false); }}
            className="px-3 py-2.5 rounded-xl text-xs font-medium transition-all"
            style={{
              background: selectedExam === exam ? 'var(--c-primary-soft)' : 'var(--bg-elevated)',
              color: selectedExam === exam ? 'var(--c-primary)' : 'var(--c-text-muted)',
              border: selectedExam === exam ? '1px solid var(--c-border-active)' : '1px solid var(--c-border)',
            }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            {exam}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

function MoodChart({ entries }: { entries: MoodEntry[] }) {
  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="text-4xl mb-3">🌱</div>
        <p className="text-sm" style={{ color: 'var(--c-text-muted)' }}>
          No mood data yet. Start your first check-in to track your emotional patterns.
        </p>
      </div>
    );
  }

  const avg = (arr: number[]) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);
  const last7 = [...entries].slice(0, 7).reverse();

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-3 h-28 px-2">
        {last7.map((entry, i) => {
          const height = (entry.mood / 5) * 100;
          const config = MOOD_CONFIG[entry.mood as keyof typeof MOOD_CONFIG];
          return (
            <div key={entry.id} className="flex-1 flex flex-col items-center gap-1">
              {config && <span className="text-xs" title={config.label}>{config.emoji}</span>}
              <motion.div
                className="w-full rounded-lg"
                style={{ backgroundColor: config?.color || 'var(--c-border)', opacity: 0.8, minHeight: 4 }}
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{ duration: 0.6, delay: 0.3 + i * 0.08 }}
              />
              <span className="text-[10px]" style={{ color: 'var(--c-text-muted)' }}>
                {new Date(entry.date).toLocaleDateString('en', { weekday: 'short' }).slice(0, 2)}
              </span>
            </div>
          );
        })}
      </div>
      <div className="grid grid-cols-3 gap-3 pt-3" style={{ borderTop: '1px solid var(--c-border)' }}>
        <div className="text-center">
          <p className="text-lg font-semibold" style={{ color: 'var(--c-text)' }}>
            {entries.length > 0 ? MOOD_CONFIG[Math.round(avg(entries.map(e => e.mood))) as keyof typeof MOOD_CONFIG]?.emoji || '—' : '—'}
          </p>
          <p className="text-[10px]" style={{ color: 'var(--c-text-muted)' }}>Avg Mood</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold" style={{ color: 'var(--c-text)' }}>
            {entries.length > 0 ? `${avg(entries.map(e => e.sleepHours)).toFixed(1)}h` : '—'}
          </p>
          <p className="text-[10px]" style={{ color: 'var(--c-text-muted)' }}>Avg Sleep</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold" style={{ color: 'var(--c-text)' }}>
            {entries.length > 0 ? avg(entries.map(e => e.stress)).toFixed(1) : '—'}
          </p>
          <p className="text-[10px]" style={{ color: 'var(--c-text-muted)' }}>Avg Stress</p>
        </div>
      </div>
    </div>
  );
}

const ACTIONS = [
  { href: '/check-in', label: 'Daily Check-in', desc: 'Record your mood & energy', icon: Heart, color: '#EF4444', bg: '#EF444415' },
  { href: '/journal', label: 'Write Journal', desc: 'Reflect on your day', icon: BookOpen, color: '#8B5CF6', bg: '#8B5CF615' },
  { href: '/coach', label: 'AI Coach', desc: 'Talk to your wellness coach', icon: MessageCircle, color: '#4ADE80', bg: '#4ADE8015' },
  { href: '/focus', label: 'Focus Session', desc: 'Start a focused study timer', icon: Timer, color: '#F59E0B', bg: '#F59E0B15' },
];

function QuickActionGrid() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {ACTIONS.map((action, i) => {
        const Icon = action.icon;
        return (
          <Link key={action.href} href={action.href}>
            <motion.div
              className="p-4 rounded-2xl transition-all cursor-pointer group"
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--c-border)',
              }}
              whileHover={{ y: -2, scale: 1.02, borderColor: 'var(--c-border-active)' }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                style={{ background: action.bg }}
              >
                <Icon className="w-5 h-5" style={{ color: action.color }} />
              </div>
              <p className="text-sm font-medium" style={{ color: 'var(--c-text)' }}>
                {action.label}
              </p>
              <p className="text-[11px] mt-0.5" style={{ color: 'var(--c-text-muted)' }}>{action.desc}</p>
            </motion.div>
          </Link>
        );
      })}
    </div>
  );
}

function JournalList({ entries }: { entries: JournalEntry[] }) {
  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <BookOpen className="w-10 h-10 mb-3" style={{ color: 'var(--c-text-muted)', opacity: 0.3 }} />
        <p className="text-sm" style={{ color: 'var(--c-text-muted)' }}>No journal entries yet.</p>
        <Link href="/journal" className="text-xs mt-2" style={{ color: 'var(--c-primary)' }}>
          Write your first entry →
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {entries.map((entry, i) => (
        <motion.div
          key={entry.id}
          className="p-3 rounded-xl transition-all"
          style={{ border: '1px solid var(--c-border)' }}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 + i * 0.1 }}
        >
          <p className="text-sm line-clamp-2" style={{ color: 'var(--c-text)' }}>
            {entry.content.slice(0, 100)}{entry.content.length > 100 ? '...' : ''}
          </p>
          {entry.emotionTags.length > 0 && (
            <div className="flex gap-1 mt-2 flex-wrap">
              {entry.emotionTags.slice(0, 3).map(tag => (
                <span key={tag} className="mf-badge">{tag}</span>
              ))}
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}

function RecoveryList({ suggestions }: { suggestions: ReturnType<typeof generateRecoverySuggestions> }) {
  return (
    <div className="space-y-3">
      {suggestions.map((s, i) => (
        <motion.div
          key={s.id}
          className="flex items-start gap-3 p-3 rounded-xl"
          style={{ border: '1px solid var(--c-border)' }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 + i * 0.1 }}
        >
          <div className="text-2xl flex-shrink-0">{s.icon}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium" style={{ color: 'var(--c-text)' }}>{s.title}</p>
              {s.duration && (
                <span className="mf-badge whitespace-nowrap">{s.duration}</span>
              )}
            </div>
            <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--c-text-muted)' }}>
              {s.description}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
