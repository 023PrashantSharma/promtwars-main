'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkles, Brain, Heart, BookOpen, Timer, MessageCircle, Check, Calendar, Loader2 } from 'lucide-react';
import { ExamType, DEFAULT_EXAM_DATES } from '@/types';
import { savePreferences } from '@/services/storage';

const FEATURES = [
  { icon: Heart, label: 'Daily Check-ins', color: '#EF4444' },
  { icon: BookOpen, label: 'Smart Journal', color: '#8B5CF6' },
  { icon: Brain, label: 'Burnout Prediction', color: '#F59E0B' },
  { icon: MessageCircle, label: 'AI Coach', color: '#22C55E' },
  { icon: Timer, label: 'Focus Sessions', color: '#3B82F6' },
];

const EXAM_OPTIONS = Object.values(ExamType).map((exam) => ({
  value: exam,
  label: exam,
  date: DEFAULT_EXAM_DATES[exam],
}));

export default function WelcomePage() {
  const [step, setStep] = useState(1); // 1 = name, 2 = exam selection, 3 = exam date
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedExam, setSelectedExam] = useState<ExamType | null>(null);
  const [examDate, setExamDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [baseTime, setBaseTime] = useState<number>(0);
  const router = useRouter();

  useEffect(() => {
    const userId = localStorage.getItem('mindflow_user_id');
    if (userId) {
      router.replace('/dashboard');
    } else {
      const timer = setTimeout(() => {
        setCheckingAuth(false);
        setBaseTime(Date.now());
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [router]);

  const getDaysLeft = (targetDateStr: string) => {
    if (!baseTime) return 0;
    return Math.max(0, Math.ceil((new Date(targetDateStr).getTime() - baseTime) / (1000 * 60 * 60 * 24)));
  };

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    setStep(2);
  };

  const handleExamNext = () => {
    if (selectedExam) {
      setExamDate(DEFAULT_EXAM_DATES[selectedExam]);
      setStep(3);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim() }),
      });

      if (!res.ok) throw new Error('Failed to create user');

      const data = await res.json();
      localStorage.setItem('mindflow_user_id', data.userId);
      localStorage.setItem('mindflow_user_name', data.name);
      localStorage.setItem('mindflow_user_email', data.email || '');

      savePreferences({
        name: data.name,
        email: data.email || null,
        selectedExam: selectedExam,
        customExamDate: examDate || null,
        onboardingCompleted: true,
      });

      router.push('/dashboard');
    } catch {
      setError('Something went wrong. Please try again.');
      setIsLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
          <Sparkles className="w-8 h-8 text-primary" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-bg relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[radial-gradient(ellipse,rgba(34,197,94,0.04)_0%,transparent_55%)] pointer-events-none z-0" />

      <AnimatePresence mode="wait">
        {/* Step 1: Name Input */}
        {step === 1 && (
          <motion.div
            key="step1"
            className="relative z-10 w-full max-w-[440px] text-center flex flex-col gap-6"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
          >
            {/* Logo */}
            <div className="flex justify-center">
              <div className="w-14 h-14 rounded-lg overflow-hidden ring-1 ring-border shadow-md">
                <Image src="/logo.png" alt="MindFlow" width={56} height={56} className="object-cover" priority />
              </div>
            </div>

            {/* Typography */}
            <div className="flex flex-col gap-2">
              <h1 className="text-display font-semibold tracking-tight text-text">
                Welcome to <span className="text-primary font-bold">MindFlow</span>
              </h1>
              <p className="text-body text-muted leading-relaxed">
                Your AI wellness companion for exam preparation.
                <br />
                Stay balanced, focused, and motivated.
              </p>
            </div>

            {/* Feature Badges */}
            <div className="flex flex-wrap justify-center gap-1.5 py-1">
              {FEATURES.map((f) => {
                const Icon = f.icon;
                return (
                  <div
                    key={f.label}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium border"
                    style={{
                      background: `${f.color}12`,
                      color: f.color,
                      borderColor: `${f.color}20`,
                    }}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {f.label}
                  </div>
                );
              })}
            </div>

            {/* Card Form */}
            <div className="bg-surface border border-border rounded-lg p-6 text-left">
              <p className="text-body font-medium text-text mb-4 text-center">
                Let&apos;s get started
              </p>

              <form onSubmit={handleNameSubmit} className="flex flex-col gap-4">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name..."
                  autoFocus
                  maxLength={50}
                  className="mf-input h-11 text-center font-medium"
                />

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address..."
                  maxLength={100}
                  className="mf-input h-11 text-center font-medium"
                />

                <button
                  type="submit"
                  disabled={!name.trim() || !email.trim()}
                  className="w-full mf-btn-primary h-11 flex items-center justify-center gap-1.5 cursor-pointer font-medium"
                  style={{ opacity: name.trim() && email.trim() ? 1 : 0.4 }}
                >
                  Next <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* Step Indicators */}
            <div className="flex justify-center gap-1.5">
              <div className="w-6 h-1 rounded-full bg-primary" />
              <div className="w-6 h-1 rounded-full bg-border" />
              <div className="w-6 h-1 rounded-full bg-border" />
            </div>
          </motion.div>
        )}

        {/* Step 2: Exam Selection */}
        {step === 2 && (
          <motion.div
            key="step2"
            className="relative z-10 w-full max-w-[480px] text-center flex flex-col gap-6"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex flex-col gap-2">
              <span className="text-caption font-semibold uppercase tracking-wider text-primary">
                Hey {name.trim().split(' ')[0]} 👋
              </span>
              <h2 className="text-heading font-semibold text-text">
                Which exam are you preparing for?
              </h2>
              <p className="text-body text-muted leading-relaxed">
                We will personalize your countdown indicators and self-care recommendations.
              </p>
            </div>

            {/* Selection Grid */}
            <div className="grid grid-cols-2 gap-2 text-left">
              {EXAM_OPTIONS.map((exam) => {
                const isSelected = selectedExam === exam.value;
                const daysLeft = getDaysLeft(exam.date);
                return (
                  <button
                    key={exam.value}
                    onClick={() => setSelectedExam(isSelected ? null : exam.value)}
                    className="p-3.5 rounded-lg border text-left transition-all relative cursor-pointer"
                    style={{
                      background: isSelected ? 'var(--c-primary-soft)' : 'var(--c-surface)',
                      borderColor: isSelected ? 'var(--c-primary)' : 'var(--c-border)',
                      color: isSelected ? 'var(--c-primary)' : 'var(--c-text)',
                    }}
                  >
                    {isSelected && (
                      <div className="absolute top-3 right-3 w-4.5 h-4.5 rounded-full bg-primary flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                    <p className="text-body font-semibold">{exam.label}</p>
                    <p className="text-[10px] text-muted font-medium mt-0.5">{daysLeft} days remaining</p>
                  </button>
                );
              })}
            </div>

            {/* Error alerts */}
            {error && <p className="text-caption text-destructive">{error}</p>}

            {/* Navigation Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="mf-btn-ghost h-11 px-5 cursor-pointer font-medium text-caption"
              >
                Back
              </button>

              <button
                onClick={handleExamNext}
                className="flex-1 mf-btn-primary h-11 flex items-center justify-center gap-1.5 cursor-pointer font-medium text-caption"
              >
                {selectedExam ? 'Next' : 'Skip & Continue'} <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Step Indicators */}
            <div className="flex justify-center gap-1.5">
              <div className="w-6 h-1 rounded-full bg-border" />
              <div className="w-6 h-1 rounded-full bg-primary" />
              <div className="w-6 h-1 rounded-full bg-border" />
            </div>
          </motion.div>
        )}

        {/* Step 3: Custom Exam Date selection */}
        {step === 3 && (
          <motion.div
            key="step3"
            className="relative z-10 w-full max-w-[420px] text-center flex flex-col gap-6"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex justify-center">
              <div className="w-12 h-12 rounded-full bg-primary-soft text-primary flex items-center justify-center border border-border-active">
                <Calendar className="w-5 h-5" />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="text-heading font-semibold text-text">
                When is your {selectedExam} exam?
              </h2>
              <p className="text-body text-muted leading-relaxed">
                Configure your target date to calibrate your countdown metrics.
              </p>
            </div>

            {/* Form card */}
            <div className="bg-surface border border-border rounded-lg p-6">
              <input
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="mf-input h-11 text-center font-semibold text-text"
                style={{ colorScheme: 'dark' }}
              />

              {examDate && (
                <p className="text-caption text-primary font-semibold mt-3 text-center">
                  {getDaysLeft(examDate)} days from now
                </p>
              )}
            </div>

            {error && <p className="text-caption text-destructive">{error}</p>}

            {/* Navigation Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="mf-btn-ghost h-11 px-5 cursor-pointer font-medium text-caption"
              >
                Back
              </button>

              <button
                onClick={handleComplete}
                disabled={isLoading || !examDate}
                className="flex-1 mf-btn-primary h-11 flex items-center justify-center gap-1.5 cursor-pointer font-medium text-caption"
                style={{ opacity: examDate && !isLoading ? 1 : 0.4 }}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <>
                    Get Started <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            {/* Step Indicators */}
            <div className="flex justify-center gap-1.5">
              <div className="w-6 h-1 rounded-full bg-border" />
              <div className="w-6 h-1 rounded-full bg-border" />
              <div className="w-6 h-1 rounded-full bg-primary" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
