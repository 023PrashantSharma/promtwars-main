'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { PageTransition } from '@/components/ui/animated-card';
import {
  PageContainer,
  PageHeader,
  DashboardCard,
  EmptyState,
} from '@/components/ui/primitives';
import { MoodLevel, EnergyLevel, MOOD_CONFIG, ENERGY_CONFIG } from '@/types';
import type { MoodEntry } from '@/types';
import { generateId, getToday } from '@/lib/utils';
import { saveMoodEntry } from '@/services/storage';
import { Check, ArrowRight, ArrowLeft, Heart, Sparkles, Smile, Star, Sliders, Moon } from 'lucide-react';

const STEPS = ['mood', 'energy', 'confidence', 'stress', 'sleep'] as const;
type Step = (typeof STEPS)[number];

const STEP_META = {
  mood: { title: 'Mood Check-in', question: 'How are you feeling right now?', icon: Smile },
  energy: { title: 'Energy Check-in', question: 'What is your physical energy level?', icon: Heart },
  confidence: { title: 'Preparation Confidence', question: 'How confident do you feel about your exams?', icon: Star },
  stress: { title: 'Stress Level', question: 'How much stress are you feeling today?', icon: Sliders },
  sleep: { title: 'Sleep Quality', question: 'How many hours did you sleep last night?', icon: Moon },
};

export default function CheckInPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [mood, setMood] = useState<MoodLevel | null>(null);
  const [energy, setEnergy] = useState<EnergyLevel | null>(null);
  const [confidence, setConfidence] = useState(5);
  const [stress, setStress] = useState(5);
  const [sleepHours, setSleepHours] = useState(7);
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const step = STEPS[currentStep];
  const canGoNext =
    (step === 'mood' && mood !== null) ||
    (step === 'energy' && energy !== null) ||
    step === 'confidence' || step === 'stress' || step === 'sleep';

  const handleSubmit = () => {
    if (!mood || !energy) return;
    const entry: MoodEntry = {
      id: generateId(),
      date: getToday(),
      mood,
      energy,
      confidence,
      stress,
      sleepHours,
      notes: notes || undefined,
      createdAt: new Date().toISOString(),
    };
    saveMoodEntry(entry);
    setSubmitted(true);
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) setCurrentStep(s => s + 1);
    else handleSubmit();
  };

  const handleBack = () => {
    setCurrentStep(s => Math.max(0, s - 1));
  };

  if (submitted) {
    return (
      <PageTransition>
        <PageContainer className="max-w-xl">
          <div className="py-12">
            <EmptyState
              icon={
                <div className="w-16 h-16 rounded-full bg-primary-soft text-primary flex items-center justify-center mx-auto">
                  <Check className="w-8 h-8" />
                </div>
              }
              title="Check-in Complete!"
              description="Your wellness log has been successfully saved. Consistent logging unlocks detailed AI insights."
              action={
                <button onClick={() => router.push('/dashboard')} className="mf-btn-primary">
                  Go to Dashboard
                </button>
              }
            />
          </div>
        </PageContainer>
      </PageTransition>
    );
  }

  const meta = STEP_META[step];
  const StepIcon = meta.icon;

  return (
    <PageTransition>
      <PageContainer className="max-w-xl">
        <PageHeader
          title="Daily Check-in"
          description="A mindful check-in to track and align your exam preparation wellness."
        />

        {/* Progress Bar */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-caption text-muted">
            <span>Progress</span>
            <span>Step {currentStep + 1} of {STEPS.length}</span>
          </div>
          <div className="h-1 bg-border rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Wizard Container */}
        <DashboardCard className="min-h-[340px] flex flex-col justify-between">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col justify-center py-4"
            >
              <div className="flex items-center gap-2 mb-4">
                <StepIcon className="w-5 h-5 text-primary shrink-0" />
                <span className="text-caption font-semibold uppercase tracking-wider text-muted">
                  {meta.title}
                </span>
              </div>

              <h2 className="text-title font-medium text-text mb-6">
                {meta.question}
              </h2>

              {/* Step 1: Mood */}
              {step === 'mood' && (
                <div className="grid grid-cols-5 gap-2.5">
                  {Object.entries(MOOD_CONFIG).map(([value, config]) => {
                    const moodVal = Number(value) as MoodLevel;
                    const isSelected = mood === moodVal;
                    return (
                      <button
                        key={value}
                        onClick={() => setMood(moodVal)}
                        className="flex flex-col items-center justify-center gap-2 p-3 rounded-lg border transition-all duration-150 cursor-pointer"
                        style={{
                          background: isSelected ? 'var(--c-primary-soft)' : 'var(--c-surface)',
                          borderColor: isSelected ? 'var(--c-primary)' : 'var(--c-border)',
                        }}
                      >
                        <span className="text-3xl filter saturate-[0.85]">{config.emoji}</span>
                        <span className="text-[11px] font-medium text-text-secondary">{config.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Step 2: Energy */}
              {step === 'energy' && (
                <div className="grid grid-cols-5 gap-2.5">
                  {Object.entries(ENERGY_CONFIG).map(([value, config]) => {
                    const energyVal = Number(value) as EnergyLevel;
                    const isSelected = energy === energyVal;
                    return (
                      <button
                        key={value}
                        onClick={() => setEnergy(energyVal)}
                        className="flex flex-col items-center justify-center gap-2 p-3 rounded-lg border transition-all duration-150 cursor-pointer"
                        style={{
                          background: isSelected ? 'var(--c-primary-soft)' : 'var(--c-surface)',
                          borderColor: isSelected ? 'var(--c-primary)' : 'var(--c-border)',
                        }}
                      >
                        <span className="text-3xl filter saturate-[0.85]">{config.emoji}</span>
                        <span className="text-[11px] font-medium text-text-secondary">{config.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Step 3: Confidence */}
              {step === 'confidence' && (
                <div className="flex flex-col gap-6 px-2">
                  <div className="flex justify-between items-baseline">
                    <span className="text-caption text-muted">Less Confident</span>
                    <span className="text-[32px] font-bold text-primary tabular-nums">{confidence}</span>
                    <span className="text-caption text-muted">Highly Confident</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={confidence}
                    onChange={e => setConfidence(Number(e.target.value))}
                    className="w-full accent-primary h-1 bg-border rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              )}

              {/* Step 4: Stress */}
              {step === 'stress' && (
                <div className="flex flex-col gap-6 px-2">
                  <div className="flex justify-between items-baseline">
                    <span className="text-caption text-muted">Relaxed</span>
                    <span
                      className="text-[32px] font-bold tabular-nums"
                      style={{ color: stress <= 3 ? 'var(--c-primary)' : stress <= 6 ? 'var(--color-warning)' : 'var(--color-destructive)' }}
                    >
                      {stress}
                    </span>
                    <span className="text-caption text-muted">Stressed</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={stress}
                    onChange={e => setStress(Number(e.target.value))}
                    className="w-full accent-primary h-1 bg-border rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              )}

              {/* Step 5: Sleep */}
              {step === 'sleep' && (
                <div className="flex flex-col gap-4 px-2">
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="text-caption text-muted">Mins / Hours</span>
                    <span className="text-[32px] font-bold text-primary tabular-nums">{sleepHours} hrs</span>
                    <span className="text-caption text-muted">12+ Hours</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={12}
                    step={0.5}
                    value={sleepHours}
                    onChange={e => setSleepHours(Number(e.target.value))}
                    className="w-full accent-primary h-1 bg-border rounded-lg appearance-none cursor-pointer"
                  />

                  <div className="mt-6">
                    <label className="text-caption font-semibold uppercase tracking-wider text-muted block mb-2">
                      Notes (Optional)
                    </label>
                    <textarea
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      placeholder="I studied complex math problems... or today felt very slow..."
                      className="mf-input resize-none h-20"
                    />
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-border mt-6 shrink-0">
            <button
              onClick={handleBack}
              disabled={currentStep === 0}
              className="mf-btn-ghost hover:bg-card-hover disabled:opacity-0 flex items-center gap-1 cursor-pointer h-9 px-3 text-caption font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>

            <button
              onClick={handleNext}
              disabled={!canGoNext}
              className="mf-btn-primary flex items-center gap-1 cursor-pointer h-9 px-4 text-caption font-medium"
              style={{ opacity: canGoNext ? 1 : 0.4 }}
            >
              {currentStep === STEPS.length - 1 ? 'Complete Check-in' : 'Next'} <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </DashboardCard>
      </PageContainer>
    </PageTransition>
  );
}
