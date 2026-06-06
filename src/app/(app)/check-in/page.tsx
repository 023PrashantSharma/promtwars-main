'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { PageTransition } from '@/components/ui/animated-card';
import { MoodLevel, EnergyLevel, MOOD_CONFIG, ENERGY_CONFIG } from '@/types';
import type { MoodEntry } from '@/types';
import { generateId, getToday } from '@/lib/utils';
import { saveMoodEntry } from '@/services/storage';
import { Check, ArrowRight, ArrowLeft } from 'lucide-react';

const STEPS = ['mood', 'energy', 'confidence', 'stress', 'sleep'] as const;
type Step = (typeof STEPS)[number];

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
      id: generateId(), date: getToday(), mood, energy, confidence, stress, sleepHours,
      notes: notes || undefined, createdAt: new Date().toISOString(),
    };
    saveMoodEntry(entry);
    setSubmitted(true);
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) setCurrentStep(s => s + 1);
    else handleSubmit();
  };

  if (submitted) {
    return (
      <PageTransition>
        <div className="max-w-lg mx-auto py-12">
          <motion.div className="text-center" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring' }}>
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: 'var(--c-primary-soft)' }}>
              <Check className="w-10 h-10" style={{ color: 'var(--c-primary)' }} />
            </div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--c-text)' }}>Check-in Complete!</h2>
            <p className="mb-6" style={{ color: 'var(--c-text-muted)' }}>Your wellness data has been saved. Keep tracking daily for the best insights.</p>
            <button onClick={() => router.push('/')} className="mf-btn-primary">Back to Dashboard</button>
          </motion.div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="max-w-lg mx-auto py-4">
        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--c-text)' }}>Daily Check-in</h1>
        <p className="text-sm mb-8" style={{ color: 'var(--c-text-muted)' }}>How are you feeling today?</p>

        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {STEPS.map((_, i) => (
            <div key={i} className="h-[6px] flex-1 rounded-full transition-colors duration-300"
              style={{ background: i <= currentStep ? 'var(--c-primary)' : 'var(--c-border)' }} />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
            {step === 'mood' && (
              <div>
                <h2 className="text-lg font-semibold mb-6" style={{ color: 'var(--c-text)' }}>What&apos;s your mood?</h2>
                <div className="grid grid-cols-5 gap-3">
                  {Object.entries(MOOD_CONFIG).map(([value, config]) => {
                    const moodVal = Number(value) as MoodLevel;
                    const isSelected = mood === moodVal;
                    return (
                      <motion.button key={value} onClick={() => setMood(moodVal)}
                        className="flex flex-col items-center gap-2 p-4 rounded-2xl transition-all"
                        style={{
                          background: isSelected ? 'var(--c-primary-soft)' : 'var(--bg-card)',
                          border: isSelected ? '2px solid var(--c-primary)' : '1px solid var(--c-border)',
                          boxShadow: isSelected ? 'var(--shadow-glow)' : 'none',
                        }}
                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <span className="text-3xl">{config.emoji}</span>
                        <span className="text-[11px]" style={{ color: 'var(--c-text-muted)' }}>{config.label}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            )}

            {step === 'energy' && (
              <div>
                <h2 className="text-lg font-semibold mb-6" style={{ color: 'var(--c-text)' }}>Energy level?</h2>
                <div className="grid grid-cols-5 gap-3">
                  {Object.entries(ENERGY_CONFIG).map(([value, config]) => {
                    const energyVal = Number(value) as EnergyLevel;
                    const isSelected = energy === energyVal;
                    return (
                      <motion.button key={value} onClick={() => setEnergy(energyVal)}
                        className="flex flex-col items-center gap-2 p-4 rounded-2xl transition-all"
                        style={{
                          background: isSelected ? 'var(--c-primary-soft)' : 'var(--bg-card)',
                          border: isSelected ? '2px solid var(--c-primary)' : '1px solid var(--c-border)',
                          boxShadow: isSelected ? 'var(--shadow-glow)' : 'none',
                        }}
                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <span className="text-3xl">{config.emoji}</span>
                        <span className="text-[11px]" style={{ color: 'var(--c-text-muted)' }}>{config.label}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            )}

            {step === 'confidence' && (
              <div>
                <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--c-text)' }}>How confident do you feel about your preparation?</h2>
                <p className="text-sm mb-8" style={{ color: 'var(--c-text-muted)' }}>1 = Not at all → 10 = Very confident</p>
                <input type="range" min={1} max={10} value={confidence} onChange={e => setConfidence(Number(e.target.value))} />
                <div className="flex justify-between mt-2">
                  <span className="text-xs" style={{ color: 'var(--c-text-muted)' }}>Not confident</span>
                  <span className="text-2xl font-bold" style={{ color: 'var(--c-primary)' }}>{confidence}</span>
                  <span className="text-xs" style={{ color: 'var(--c-text-muted)' }}>Very confident</span>
                </div>
              </div>
            )}

            {step === 'stress' && (
              <div>
                <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--c-text)' }}>Stress level?</h2>
                <p className="text-sm mb-8" style={{ color: 'var(--c-text-muted)' }}>1 = Relaxed → 10 = Extremely stressed</p>
                <input type="range" min={1} max={10} value={stress} onChange={e => setStress(Number(e.target.value))} />
                <div className="flex justify-between mt-2">
                  <span className="text-xs" style={{ color: 'var(--c-text-muted)' }}>Relaxed</span>
                  <span className="text-2xl font-bold" style={{ color: stress <= 3 ? '#4ADE80' : stress <= 6 ? '#F59E0B' : '#EF4444' }}>{stress}</span>
                  <span className="text-xs" style={{ color: 'var(--c-text-muted)' }}>Very stressed</span>
                </div>
              </div>
            )}

            {step === 'sleep' && (
              <div>
                <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--c-text)' }}>Hours of sleep last night?</h2>
                <p className="text-sm mb-8" style={{ color: 'var(--c-text-muted)' }}>Getting enough sleep is crucial for memory</p>
                <input type="range" min={0} max={12} step={0.5} value={sleepHours} onChange={e => setSleepHours(Number(e.target.value))} />
                <div className="flex justify-between mt-2">
                  <span className="text-xs" style={{ color: 'var(--c-text-muted)' }}>0h</span>
                  <span className="text-2xl font-bold" style={{ color: 'var(--c-primary)' }}>{sleepHours}h</span>
                  <span className="text-xs" style={{ color: 'var(--c-text-muted)' }}>12h</span>
                </div>
                <div className="mt-8">
                  <label className="text-sm block mb-2" style={{ color: 'var(--c-text-muted)' }}>Any notes? (optional)</label>
                  <textarea value={notes} onChange={e => setNotes(e.target.value)}
                    placeholder="How was your day? Anything on your mind..."
                    className="mf-input resize-none h-24" />
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-between mt-8">
          <button onClick={() => setCurrentStep(s => Math.max(0, s - 1))}
            className={`mf-btn-ghost ${currentStep === 0 ? 'invisible' : ''}`}>
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <motion.button onClick={handleNext} disabled={!canGoNext}
            className="mf-btn-primary" style={{ opacity: canGoNext ? 1 : 0.4, cursor: canGoNext ? 'pointer' : 'not-allowed' }}
            whileHover={canGoNext ? { scale: 1.02 } : undefined} whileTap={canGoNext ? { scale: 0.98 } : undefined}>
            {currentStep === STEPS.length - 1 ? 'Submit' : 'Next'} <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </PageTransition>
  );
}
