'use client';

/* ============================================
   Focus Sessions — Pomodoro Timer
   ============================================ */

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageTransition, AnimatedCard } from '@/components/ui/animated-card';
import { FocusMode } from '@/types';
import type { FocusSession } from '@/types';
import { generateId, getToday } from '@/lib/utils';
import { saveFocusSession, getFocusStreak, getCompletedFocusSessions } from '@/services/storage';
import { Play, Pause, Square, Flame, Trophy } from 'lucide-react';

const MODE_CONFIG = {
  [FocusMode.Short]: { label: 'Sprint', description: '25 min focused study', emoji: '⚡' },
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

  useEffect(() => {
    setMounted(true);
    setStreak(getFocusStreak());
    const today = getToday();
    setCompletedToday(
      getCompletedFocusSessions().filter((s) => s.date === today).length
    );
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
  }, [timeLeft, isRunning]);

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

  const handleComplete = useCallback(() => {
    if (sessionId) {
      const session: FocusSession = {
        id: sessionId, mode: selectedMode, startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(), completed: true, date: getToday(),
      };
      saveFocusSession(session);
    }
    setIsRunning(false);
    setIsPaused(false);
    setSessionId(null);
    setStreak(getFocusStreak());
    setCompletedToday((c) => c + 1);
  }, [sessionId, selectedMode]);

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
  const circumference = 2 * Math.PI * 120;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <PageTransition>
      <div className="max-w-lg mx-auto py-4">
        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--c-text)' }}>Focus Session</h1>
        <p className="text-sm mb-8" style={{ color: 'var(--c-text-muted)' }}>Deep work builds deep understanding.</p>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <AnimatedCard className="text-center py-4" delay={0.1}>
            <Flame className="w-5 h-5 mx-auto mb-1" style={{ color: 'var(--c-primary)' }} />
            <p className="text-2xl font-bold" style={{ color: 'var(--c-text)' }}>{streak}</p>
            <p className="text-[11px]" style={{ color: 'var(--c-text-muted)' }}>Day Streak</p>
          </AnimatedCard>
          <AnimatedCard className="text-center py-4" delay={0.2}>
            <Trophy className="w-5 h-5 mx-auto mb-1" style={{ color: 'var(--c-primary)' }} />
            <p className="text-2xl font-bold" style={{ color: 'var(--c-text)' }}>{completedToday}</p>
            <p className="text-[11px]" style={{ color: 'var(--c-text-muted)' }}>Today</p>
          </AnimatedCard>
        </div>

        {/* Mode Selector */}
        {!isRunning && (
          <div className="grid grid-cols-3 gap-3 mb-8">
            {Object.entries(MODE_CONFIG).map(([value, config]) => {
              const mode = Number(value) as FocusMode;
              const isSelected = selectedMode === mode;
              return (
                <motion.button
                  key={value}
                  onClick={() => handleModeSelect(mode)}
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl transition-all"
                  style={{
                    background: isSelected ? 'var(--c-primary-soft)' : 'var(--bg-card)',
                    border: isSelected ? '2px solid var(--c-primary)' : '1px solid var(--c-border)',
                  }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <span className="text-2xl">{config.emoji}</span>
                  <span className="text-sm font-medium" style={{ color: 'var(--c-text)' }}>{config.label}</span>
                  <span className="text-[10px]" style={{ color: 'var(--c-text-muted)' }}>{config.description}</span>
                </motion.button>
              );
            })}
          </div>
        )}

        {/* Timer Ring */}
        <div className="flex flex-col items-center">
          <div className="relative w-64 h-64 mb-8">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 260 260">
              <circle cx="130" cy="130" r="120" fill="none" stroke="var(--c-border)" strokeWidth="6" />
              <motion.circle
                cx="130" cy="130" r="120" fill="none"
                stroke="var(--c-primary)" strokeWidth="6" strokeLinecap="round"
                strokeDasharray={circumference}
                animate={{ strokeDashoffset }}
                transition={{ duration: 0.5, ease: 'linear' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-bold tabular-nums" style={{ color: 'var(--c-text)' }}>
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </span>
              <span className="text-xs mt-2" style={{ color: 'var(--c-text-muted)' }}>
                {isRunning ? (isPaused ? 'Paused' : 'Focusing...') : MODE_CONFIG[selectedMode].label}
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            {!isRunning ? (
              <motion.button
                onClick={handleStart}
                className="mf-btn-primary px-8 py-4 text-base"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Play className="w-5 h-5" /> Start Focus
              </motion.button>
            ) : (
              <>
                <motion.button
                  onClick={handlePause}
                  className="p-4 rounded-xl transition-all"
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--c-border)',
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isPaused ? (
                    <Play className="w-5 h-5" style={{ color: 'var(--c-primary)' }} />
                  ) : (
                    <Pause className="w-5 h-5" style={{ color: 'var(--c-text)' }} />
                  )}
                </motion.button>
                <motion.button
                  onClick={handleStop}
                  className="p-4 rounded-xl transition-all"
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Square className="w-5 h-5" style={{ color: '#EF4444' }} />
                </motion.button>
              </>
            )}
          </div>

          {/* Completion */}
          <AnimatePresence>
            {timeLeft === 0 && !isRunning && completedToday > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="mt-8 text-center"
              >
                <p className="text-lg font-semibold mb-1" style={{ color: 'var(--c-primary)' }}>🎉 Session Complete!</p>
                <p className="text-sm" style={{ color: 'var(--c-text-muted)' }}>Great focus. You earned this break.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PageTransition>
  );
}
