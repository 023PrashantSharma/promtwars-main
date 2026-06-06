'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageTransition, AnimatedCard } from '@/components/ui/animated-card';
import {
  PageContainer,
  PageHeader,
  DashboardCard,
  SectionHeader,
} from '@/components/ui/primitives';
import { FocusMode } from '@/types';
import type { FocusSession } from '@/types';
import { generateId, getToday } from '@/lib/utils';
import { saveFocusSession, getFocusStreak, getCompletedFocusSessions } from '@/services/storage';
import { Play, Pause, Square, Flame, Trophy, Calendar, Sparkles, Timer } from 'lucide-react';

const MODE_CONFIG = {
  [FocusMode.Short]: { label: 'Sprint', description: '25 min study', emoji: '⚡' },
  [FocusMode.Medium]: { label: 'Flow', description: '45 min deep work', emoji: '🌊' },
  [FocusMode.Long]: { label: 'Marathon', description: '90 min intensive', emoji: '🏔️' },
};

export default function FocusPage() {
  const [selectedMode, setSelectedMode] = useState<FocusMode>(FocusMode.Short);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timeLeft, setTimeLeft] = useState(FocusMode.Short * 60);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [streak, setStreak] = useState(0);
  const [completedToday, setCompletedToday] = useState(0);
  const [mounted, setMounted] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleComplete = useCallback(() => {
    if (sessionId) {
      const session: FocusSession = {
        id: sessionId, mode: selectedMode, startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(), completed: true, date: getToday(),
      };
      saveFocusSession(session);
    }
    setTimeout(() => {
      setIsRunning(false);
      setIsPaused(false);
      setSessionId(null);
      setStreak(getFocusStreak());
      setCompletedToday((c) => c + 1);
    }, 0);
  }, [sessionId, selectedMode]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
      setStreak(getFocusStreak());
      const today = getToday();
      setCompletedToday(
        getCompletedFocusSessions().filter((s) => s.date === today).length
      );
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isRunning && !isPaused && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((t) => t - 1);
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, isPaused, timeLeft]);

  useEffect(() => {
    if (timeLeft === 0 && isRunning) {
      handleComplete();
    }
  }, [timeLeft, isRunning, handleComplete]);

  const handleStart = () => {
    const id = generateId();
    setSessionId(id);
    setTimeLeft(selectedMode * 60);
    setIsRunning(true);
    setIsPaused(false);
    const session: FocusSession = {
      id, mode: selectedMode, startedAt: new Date().toISOString(), completed: false, date: getToday(),
    };
    saveFocusSession(session);
  };

  const handleStop = () => {
    setIsRunning(false);
    setIsPaused(false);
    setTimeLeft(selectedMode * 60);
    setSessionId(null);
  };

  const handlePause = () => setIsPaused(!isPaused);

  const handleModeSelect = (mode: FocusMode) => {
    if (isRunning) return;
    setSelectedMode(mode);
    setTimeLeft(mode * 60);
  };

  if (!mounted) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = 1 - timeLeft / (selectedMode * 60);
  const circumference = 2 * Math.PI * 110;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <PageTransition>
      <PageContainer>
        <PageHeader
          title="Focus Session"
          description="Pomodoro deep-work timer structured to build learning habits."
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 items-start">
          {/* Left Column: Timer Dial & Controls (8 Columns) */}
          <div className="lg:col-span-8 flex flex-col items-center">
            <DashboardCard className="w-full flex flex-col items-center py-12 px-6">
              <div className="relative w-64 h-64 mb-8">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 240 240">
                  <circle cx="120" cy="120" r="110" fill="none" stroke="var(--c-border)" strokeWidth="4" />
                  <motion.circle
                    cx="120"
                    cy="120"
                    r="110"
                    fill="none"
                    stroke="var(--c-primary)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 0.5, ease: 'linear' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[48px] font-bold tracking-tight text-text tabular-nums leading-none">
                    {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                  </span>
                  <span className="text-caption text-muted mt-2 uppercase tracking-wider font-semibold">
                    {isRunning ? (isPaused ? 'Paused' : 'Focusing...') : MODE_CONFIG[selectedMode].label}
                  </span>
                </div>
              </div>

              {/* Action Controls */}
              <div className="flex items-center gap-4 shrink-0">
                {!isRunning ? (
                  <button
                    onClick={handleStart}
                    className="mf-btn-primary px-8 h-11 text-body font-medium flex items-center gap-2 cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-white" /> Start Timer
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handlePause}
                      className="mf-btn-ghost h-11 px-6 flex items-center justify-center cursor-pointer"
                    >
                      {isPaused ? <Play className="w-4 h-4 text-primary fill-primary" /> : <Pause className="w-4 h-4 text-text" />}
                    </button>
                    <button
                      onClick={handleStop}
                      className="bg-destructive/10 border border-destructive/20 hover:bg-destructive/20 text-destructive h-11 px-6 rounded-md transition-colors cursor-pointer flex items-center justify-center"
                    >
                      <Square className="w-4 h-4 fill-destructive" />
                    </button>
                  </>
                )}
              </div>

              {/* Completion Message */}
              <AnimatePresence>
                {timeLeft === 0 && !isRunning && completedToday > 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="mt-6 text-center"
                  >
                    <p className="text-body font-semibold text-primary">🎉 Study Session Completed!</p>
                    <p className="text-caption text-muted">Great focus. Take a 5-minute breather.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </DashboardCard>
          </div>

          {/* Right Column: Mode Select, Streaks & Insights (4 Columns) */}
          <div className="lg:col-span-4 flex flex-col gap-3">
            
            {/* Mode selection */}
            {!isRunning && (
              <div className="flex flex-col gap-2">
                <span className="text-caption font-semibold text-muted uppercase tracking-wider block">
                  Select Focus Mode
                </span>
                <div className="grid grid-cols-1 gap-2">
                  {Object.entries(MODE_CONFIG).map(([value, config]) => {
                    const mode = Number(value) as FocusMode;
                    const isSelected = selectedMode === mode;
                    return (
                      <button
                        key={value}
                        onClick={() => handleModeSelect(mode)}
                        className="flex items-center gap-3 p-3.5 rounded-lg border text-left transition-all cursor-pointer"
                        style={{
                          background: isSelected ? 'var(--c-primary-soft)' : 'var(--c-surface)',
                          borderColor: isSelected ? 'var(--c-primary)' : 'var(--c-border)',
                        }}
                      >
                        <span className="text-2xl filter saturate-[0.8]">{config.emoji}</span>
                        <div>
                          <p className="text-body font-medium text-text">{config.label}</p>
                          <p className="text-[11px] text-muted">{config.description}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Streak & Stats */}
            <div className="grid grid-cols-2 gap-3">
              <DashboardCard className="p-4 text-center">
                <Flame className="w-5 h-5 mx-auto mb-1 text-primary" />
                <span className="text-heading font-bold text-text block leading-normal">{streak}</span>
                <span className="text-caption text-muted block">Day Streak</span>
              </DashboardCard>
              
              <DashboardCard className="p-4 text-center">
                <Trophy className="w-5 h-5 mx-auto mb-1 text-primary" />
                <span className="text-heading font-bold text-text block leading-normal">{completedToday}</span>
                <span className="text-caption text-muted block">Sessions Today</span>
              </DashboardCard>
            </div>

            {/* Motivational Insight card */}
            <DashboardCard className="space-y-3 bg-surface">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-caption font-semibold text-muted uppercase tracking-wider">
                  Motivational Insight
                </span>
              </div>
              <p className="text-caption text-text-secondary leading-relaxed">
                Consistency is key. Raycast focus models prove that studying in blocks of 25 or 45 minutes with planned offsets optimizes knowledge retention and controls burnout progression.
              </p>
            </DashboardCard>
          </div>
        </div>
      </PageContainer>
    </PageTransition>
  );
}
