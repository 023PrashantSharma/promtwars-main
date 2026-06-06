'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { PageTransition, AnimatedCard } from '@/components/ui/animated-card';
import { ParticleField } from '@/components/ui/particle-field';
import { getRecentMoodEntries, getPreferences, getJournalEntries, getFocusStreak, getChatHistory } from '@/services/storage';
import { calculateWellnessScore, calculateBurnoutScore, generateRecoverySuggestions } from '@/services/wellness-engine';
import { getGreeting, scoreToColor, daysUntil } from '@/lib/utils';
import { MOOD_CONFIG, RiskLevel, ExamType, DEFAULT_EXAM_DATES } from '@/types';
import type { MoodEntry, UserPreferences, WellnessScore, JournalEntry, ChatMessage } from '@/types';
import { savePreferences } from '@/services/storage';
import {
  Heart, BookOpen, MessageCircle, Timer, Shield, AlertTriangle,
  AlertOctagon, ArrowRight, ChevronRight, TrendingUp, Moon as MoonIcon,
  Smile, Bell, Mic, Send, Droplets, Wind, Footprints, Battery,
} from 'lucide-react';

export default function DashboardPage() {
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [focusStreak, setFocusStreak] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [chatPreview, setChatPreview] = useState<ChatMessage[]>([]);

  useEffect(() => {
    setMounted(true);
    setMoodEntries(getRecentMoodEntries(7));
    setPreferences(getPreferences());
    setJournals(getJournalEntries().slice(0, 3));
    setFocusStreak(getFocusStreak());
    setChatPreview(getChatHistory().slice(-2));
  }, []);

  if (!mounted) return null;

  const wellnessScore = calculateWellnessScore(moodEntries);
  const burnoutRisk = calculateBurnoutScore(moodEntries);
  const greeting = getGreeting();
  const userName = preferences?.name || 'Prashant';
  const suggestions = generateRecoverySuggestions(moodEntries[0]);
  const latestMood = moodEntries[0];
  const avgSleep = moodEntries.length > 0
    ? (moodEntries.reduce((a, e) => a + e.sleepHours, 0) / moodEntries.length).toFixed(1)
    : '—';
  const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  // Mood label
  const moodLabel = latestMood
    ? MOOD_CONFIG[latestMood.mood as keyof typeof MOOD_CONFIG]?.label || 'Okay'
    : '—';
  const moodEmoji = latestMood
    ? MOOD_CONFIG[latestMood.mood as keyof typeof MOOD_CONFIG]?.emoji || '😐'
    : '😐';

  return (
    <PageTransition>
      <div className="relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <ParticleField particleCount={12} />
        </div>
        <div className="mf-spotlight" />

        <div className="relative z-10 space-y-5">
          {/* ===== HEADER ===== */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--c-text)' }}>
                {greeting}, {userName} <span>👋</span>
              </h1>
              <p className="text-sm" style={{ color: 'var(--c-text-muted)' }}>
                You&apos;ve got this. Small steps, every day.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs px-3 py-1.5 rounded-lg" style={{ background: 'var(--bg-card)', border: '1px solid var(--c-border)', color: 'var(--c-text-secondary)' }}>
                {today}
              </span>
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--c-border)' }}>
                <Bell className="w-4 h-4" style={{ color: 'var(--c-text-muted)' }} />
              </div>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'var(--c-primary-soft)', color: 'var(--c-primary)' }}>
                {userName.charAt(0)}
              </div>
            </div>
          </div>

          {/* ===== ROW 1: 4 STAT CARDS ===== */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Wellness Score"
              value={<>{wellnessScore.overall}<span className="text-sm font-normal" style={{ color: 'var(--c-text-muted)' }}>/100</span></>}
              sub={moodEntries.length > 1 ? 'Better than yesterday' : 'Start tracking'}
              trend={moodEntries.length > 1 ? '+12%' : undefined}
              delay={0.1}
            />
            <StatCard
              label="Burnout Risk"
              value={<span style={{ color: burnoutRisk.level === RiskLevel.Low ? 'var(--c-primary)' : burnoutRisk.level === RiskLevel.Moderate ? '#F59E0B' : '#EF4444' }}>
                {burnoutRisk.level === RiskLevel.Low ? '● Low' : burnoutRisk.level === RiskLevel.Moderate ? '● Moderate' : '● High'}
              </span>}
              sub={burnoutRisk.level === RiskLevel.Low ? "You're doing good. Keep it up!" : 'Take some breaks'}
              icon={<Shield className="w-4 h-4" style={{ color: 'var(--c-primary)' }} />}
              delay={0.15}
            />
            <StatCard
              label="Mood"
              value={<span className="flex items-center gap-1.5">{moodEmoji} {moodLabel}</span>}
              sub={moodEntries.length > 0 ? 'More positive than usual' : 'No data yet'}
              delay={0.2}
            />
            <StatCard
              label="Sleep"
              value={<span className="flex items-center gap-1.5"><MoonIcon className="w-4 h-4" style={{ color: '#818CF8' }} /> {avgSleep} hrs</span>}
              sub={Number(avgSleep) >= 7 ? 'Great sleep quality' : 'Needs a little improvement'}
              delay={0.25}
            />
          </div>

          {/* ===== ROW 2: CHART + BALANCE + QUICK ACTIONS ===== */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Wellness Overview — span 5 */}
            <div className="lg:col-span-5">
              <AnimatedCard delay={0.15} hover={false}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--c-text)' }}>Wellness Overview</p>
                    <p className="text-[11px]" style={{ color: 'var(--c-text-muted)' }}>Your trends from the last 7 days</p>
                  </div>
                  <span className="text-[11px] px-2 py-1 rounded-md" style={{ background: 'var(--bg-elevated)', color: 'var(--c-text-muted)' }}>7 Days</span>
                </div>
                {/* Legend */}
                <div className="flex items-center gap-4 mb-3">
                  <span className="flex items-center gap-1 text-[11px]" style={{ color: 'var(--c-text-muted)' }}>
                    <span className="w-2 h-2 rounded-full" style={{ background: '#4ADE80' }} /> Mood
                  </span>
                  <span className="flex items-center gap-1 text-[11px]" style={{ color: 'var(--c-text-muted)' }}>
                    <span className="w-2 h-2 rounded-full" style={{ background: '#F59E0B' }} /> Stress
                  </span>
                  <span className="flex items-center gap-1 text-[11px]" style={{ color: 'var(--c-text-muted)' }}>
                    <span className="w-2 h-2 rounded-full" style={{ background: '#818CF8' }} /> Energy
                  </span>
                </div>
                <MiniChart entries={moodEntries} />
              </AnimatedCard>
            </div>

            {/* Study-Wellness Balance — span 3 */}
            <div className="lg:col-span-3">
              <AnimatedCard delay={0.2} hover={false}>
                <p className="text-sm font-semibold mb-4" style={{ color: 'var(--c-text)' }}>Study · Wellness Balance</p>
                <div className="flex flex-col items-center">
                  <WellnessRing score={wellnessScore} />
                  <p className="text-sm font-semibold mt-3" style={{ color: 'var(--c-primary)' }}>
                    {wellnessScore.overall >= 70 ? 'Great balance!' : wellnessScore.overall >= 50 ? 'Getting there' : 'Needs attention'}
                  </p>
                  <p className="text-[11px] text-center mt-1" style={{ color: 'var(--c-text-muted)' }}>
                    Keep maintaining your study and self-care harmony.
                  </p>
                </div>
              </AnimatedCard>
            </div>

            {/* Quick Actions — span 4 */}
            <div className="lg:col-span-4">
              <AnimatedCard delay={0.25} hover={false}>
                <p className="text-sm font-semibold mb-3" style={{ color: 'var(--c-text)' }}>Quick Actions</p>
                <div className="space-y-1">
                  {ACTIONS.map((a, i) => {
                    const Icon = a.icon;
                    return (
                      <Link key={a.href} href={a.href} className="mf-action-row">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: a.bg }}>
                          <Icon className="w-4 h-4" style={{ color: a.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-medium" style={{ color: 'var(--c-text)' }}>{a.label}</p>
                          <p className="text-[11px]" style={{ color: 'var(--c-text-muted)' }}>{a.desc}</p>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--c-text-muted)' }} />
                      </Link>
                    );
                  })}
                </div>
              </AnimatedCard>
            </div>
          </div>

          {/* ===== ROW 3: JOURNAL + RECOVERY + AI COACH ===== */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Recent Journal */}
            <AnimatedCard delay={0.3} hover={false}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold" style={{ color: 'var(--c-text)' }}>Recent Journal</p>
                <Link href="/journal" className="text-[11px] font-medium" style={{ color: 'var(--c-text-muted)' }}>View all</Link>
              </div>
              {journals.length === 0 ? (
                <div className="flex flex-col items-center py-6 text-center">
                  <BookOpen className="w-8 h-8 mb-2" style={{ color: 'var(--c-text-muted)', opacity: 0.3 }} />
                  <p className="text-xs mb-1" style={{ color: 'var(--c-text-muted)' }}>No journal entries yet</p>
                  <p className="text-[11px] mb-3" style={{ color: 'var(--c-text-muted)' }}>Start writing to receive AI-powered reflections.</p>
                  <Link href="/journal" className="mf-btn-primary text-xs px-4 py-2">Write your first entry</Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {journals.map((entry) => (
                    <div key={entry.id} className="flex items-start gap-3 p-2.5 rounded-lg" style={{ background: 'var(--bg-elevated)' }}>
                      <div className="text-lg flex-shrink-0">📝</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs line-clamp-1 font-medium" style={{ color: 'var(--c-text)' }}>
                          {entry.content.slice(0, 60)}{entry.content.length > 60 ? '...' : ''}
                        </p>
                        <p className="text-[10px]" style={{ color: 'var(--c-text-muted)' }}>
                          {new Date(entry.createdAt).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                      {entry.emotionTags[0] && <span className="mf-badge text-[10px]">{entry.emotionTags[0]}</span>}
                    </div>
                  ))}
                </div>
              )}
            </AnimatedCard>

            {/* Recovery Suggestions */}
            <AnimatedCard delay={0.35} hover={false}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold" style={{ color: 'var(--c-text)' }}>Recovery Suggestions</p>
                <span className="text-[11px] font-medium" style={{ color: 'var(--c-text-muted)' }}>View all</span>
              </div>
              <div className="space-y-2">
                {suggestions.slice(0, 4).map((s) => (
                  <div key={s.id} className="mf-action-row py-2">
                    <div className="text-lg flex-shrink-0">{s.icon}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium" style={{ color: 'var(--c-text)' }}>{s.title}</p>
                      <p className="text-[10px] line-clamp-1" style={{ color: 'var(--c-text-muted)' }}>{s.description}</p>
                    </div>
                    {s.duration && <span className="mf-badge text-[10px]">{s.duration}</span>}
                  </div>
                ))}
              </div>
            </AnimatedCard>

            {/* AI Coach Preview */}
            <AnimatedCard delay={0.4} hover={false}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold" style={{ color: 'var(--c-text)' }}>AI Coach</p>
                <Link href="/coach" className="text-[11px] font-medium" style={{ color: 'var(--c-text-muted)' }}>View all</Link>
              </div>
              <div className="space-y-3 mb-4">
                {chatPreview.length > 0 ? (
                  chatPreview.map(msg => (
                    <div key={msg.id} className={msg.role === 'user' ? 'mf-bubble-user text-xs' : 'mf-bubble-ai text-xs'}>
                      {msg.content.slice(0, 120)}{msg.content.length > 120 ? '...' : ''}
                    </div>
                  ))
                ) : (
                  <div className="mf-bubble-ai text-xs">
                    <div className="flex items-start gap-2">
                      <span className="text-base">🌱</span>
                      <p>It&apos;s okay to have tough days. Progress isn&apos;t always linear. You&apos;re showing up, and that matters a lot.</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <input
                  className="mf-input text-xs py-2"
                  placeholder="Ask anything..."
                  readOnly
                  onClick={() => window.location.href = '/coach'}
                />
                <Link href="/coach" className="p-2 rounded-lg flex-shrink-0" style={{ background: 'var(--c-primary)' }}>
                  <Send className="w-4 h-4" style={{ color: '#0B0B0F' }} />
                </Link>
              </div>
            </AnimatedCard>
          </div>

          {/* ===== FOOTER ===== */}
          <div className="text-center pt-4 pb-2">
            <p className="text-[11px] italic" style={{ color: 'var(--c-text-muted)', opacity: 0.6 }}>
              MindFlow is not a substitute for professional medical advice.<br />
              If you&apos;re in crisis, please reach out to a trusted adult or helpline.
            </p>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}

/* ========== Sub Components ========== */

function StatCard({ label, value, sub, trend, icon, delay }: {
  label: string; value: React.ReactNode; sub: string;
  trend?: string; icon?: React.ReactNode; delay: number;
}) {
  return (
    <AnimatedCard delay={delay} hover={false}>
      <p className="text-[11px] font-medium mb-2" style={{ color: 'var(--c-text-muted)' }}>{label}</p>
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-xl font-bold" style={{ color: 'var(--c-text)' }}>{value}</span>
        {trend && (
          <span className="flex items-center gap-0.5 text-[11px] font-medium" style={{ color: 'var(--c-primary)' }}>
            <TrendingUp className="w-3 h-3" /> {trend}
          </span>
        )}
      </div>
      <p className="text-[11px]" style={{ color: 'var(--c-text-muted)' }}>{sub}</p>
    </AnimatedCard>
  );
}

function WellnessRing({ score }: { score: WellnessScore }) {
  const r = 50; const c = 2 * Math.PI * r;
  const offset = c - (score.overall / 100) * c;
  const color = scoreToColor(score.overall);
  return (
    <div className="relative w-32 h-32">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} fill="none" stroke="var(--c-border)" strokeWidth="7" />
        <motion.circle cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth="7" strokeLinecap="round"
          strokeDasharray={c} initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.5 }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold" style={{ color: 'var(--c-text)' }}>{score.overall}</span>
        <span className="text-[10px]" style={{ color: 'var(--c-text-muted)' }}>/100</span>
      </div>
    </div>
  );
}

function MiniChart({ entries }: { entries: MoodEntry[] }) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const last7 = [...entries].slice(0, 7).reverse();

  if (last7.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <p className="text-xs" style={{ color: 'var(--c-text-muted)' }}>No data yet. Complete a check-in to see trends.</p>
      </div>
    );
  }

  // SVG line chart
  const h = 120; const w = 300;
  const padX = 30; const padY = 15;
  const chartW = w - padX * 2;
  const chartH = h - padY * 2;

  const toPoints = (data: number[], max: number) =>
    data.map((v, i) => ({
      x: padX + (i / Math.max(data.length - 1, 1)) * chartW,
      y: padY + chartH - (v / max) * chartH,
    }));

  const moodPts = toPoints(last7.map(e => e.mood), 5);
  const stressPts = toPoints(last7.map(e => e.stress), 10);
  const energyPts = toPoints(last7.map(e => e.energy), 5);

  const toPath = (pts: { x: number; y: number }[]) =>
    pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  return (
    <div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: 140 }}>
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map(pct => {
          const y = padY + chartH - (pct / 100) * chartH;
          return <line key={pct} x1={padX} y1={y} x2={w - padX} y2={y} stroke="var(--c-border)" strokeWidth="0.5" />;
        })}
        {/* Y-axis labels */}
        {[0, 25, 50, 75, 100].map(pct => {
          const y = padY + chartH - (pct / 100) * chartH;
          return <text key={pct} x={padX - 8} y={y + 3} textAnchor="end" fontSize="8" fill="var(--c-text-muted)">{pct}</text>;
        })}
        {/* Lines */}
        <motion.path d={toPath(moodPts)} fill="none" stroke="#4ADE80" strokeWidth="2" strokeLinecap="round"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, delay: 0.5 }} />
        <motion.path d={toPath(stressPts)} fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, delay: 0.6 }} />
        <motion.path d={toPath(energyPts)} fill="none" stroke="#818CF8" strokeWidth="2" strokeLinecap="round"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, delay: 0.7 }} />
        {/* Dots */}
        {moodPts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="3" fill="#4ADE80" />)}
        {/* X-axis */}
        {last7.map((e, i) => {
          const x = padX + (i / Math.max(last7.length - 1, 1)) * chartW;
          const d = new Date(e.date);
          return <text key={e.id} x={x} y={h - 2} textAnchor="middle" fontSize="8" fill="var(--c-text-muted)">
            {d.toLocaleDateString('en', { month: 'short', day: 'numeric' })}
          </text>;
        })}
      </svg>
    </div>
  );
}

const ACTIONS = [
  { href: '/check-in', label: 'Daily Check-in', desc: 'How are you feeling today?', icon: Heart, color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
  { href: '/journal', label: 'Write Journal', desc: 'Reflect and express', icon: BookOpen, color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)' },
  { href: '/coach', label: 'AI Coach', desc: 'Talk to your coach', icon: MessageCircle, color: '#4ADE80', bg: 'rgba(74,222,128,0.1)' },
  { href: '/focus', label: 'Focus Session', desc: 'Deep work time', icon: Timer, color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
  { href: '/journal', label: 'Voice Journal', desc: 'Speak your thoughts', icon: Mic, color: '#818CF8', bg: 'rgba(129,140,248,0.1)' },
];
