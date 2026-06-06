'use client';

/* ============================================
   Exam Countdown Card
   ============================================ */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { AnimatedCard } from '@/components/ui/animated-card';
import { Calendar, ChevronDown } from 'lucide-react';
import { daysUntil } from '@/lib/utils';
import { ExamType, DEFAULT_EXAM_DATES, type UserPreferences } from '@/types';
import { savePreferences } from '@/services/storage';

interface ExamCountdownCardProps {
  preferences: UserPreferences | null;
}

export function ExamCountdownCard({ preferences }: ExamCountdownCardProps) {
  const [selectedExam, setSelectedExam] = useState<ExamType | null>(
    preferences?.selectedExam || null
  );
  const [showSelector, setShowSelector] = useState(false);

  const examDate = selectedExam
    ? preferences?.customExamDate || DEFAULT_EXAM_DATES[selectedExam]
    : null;
  const remaining = examDate ? daysUntil(examDate) : null;

  const handleSelectExam = (exam: ExamType) => {
    setSelectedExam(exam);
    setShowSelector(false);
    savePreferences({ selectedExam: exam });
  };

  return (
    <AnimatedCard className="h-full flex flex-col" delay={0.3}>
      <p className="text-xs uppercase tracking-wider text-muted mb-4 font-medium">
        Exam Countdown
      </p>

      {selectedExam && remaining !== null ? (
        <div className="flex-1 flex flex-col items-center justify-center">
          <button
            onClick={() => setShowSelector(!showSelector)}
            className="flex items-center gap-1 text-xs text-muted hover:text-text transition-colors mb-3"
          >
            <Calendar className="w-3.5 h-3.5" />
            {selectedExam}
            <ChevronDown className="w-3 h-3" />
          </button>

          <motion.div
            className="text-5xl font-bold text-gradient mb-1"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', delay: 0.5 }}
          >
            {remaining}
          </motion.div>
          <p className="text-sm text-muted mb-4">days remaining</p>

          <p className="text-xs text-muted text-center leading-relaxed italic">
            &ldquo;Every day of preparation is an investment in your future.&rdquo;
          </p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center">
          <Calendar className="w-10 h-10 text-muted/40 mb-3" />
          <p className="text-sm text-muted mb-4 text-center">Select your exam to see countdown</p>
        </div>
      )}

      {/* Exam Selector */}
      {(showSelector || !selectedExam) && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="grid grid-cols-2 gap-2 mt-2"
        >
          {Object.values(ExamType).map((exam) => (
            <button
              key={exam}
              onClick={() => handleSelectExam(exam)}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-all
                ${selectedExam === exam
                  ? 'bg-primary/20 text-primary border border-primary/30'
                  : 'bg-card border border-border hover:border-primary/30 text-muted hover:text-text'
                }`}
            >
              {exam}
            </button>
          ))}
        </motion.div>
      )}
    </AnimatedCard>
  );
}
