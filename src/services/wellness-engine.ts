/* ============================================
   Wellness Engine — Score Calculations
   ============================================ */

import type { MoodEntry, WellnessScore, RecoverySuggestion } from '@/types';
import { RiskLevel } from '@/types';
import { clamp, generateId } from '@/lib/utils';

/**
 * Calculate the Study-Wellness Balance Score (0-100)
 * Considers: mood, sleep, stress, energy, confidence
 */
export function calculateWellnessScore(entries: MoodEntry[]): WellnessScore {
  if (entries.length === 0) {
    return {
      overall: 50,
      breakdown: {
        studyBalance: 50,
        sleepQuality: 50,
        stressManagement: 50,
        moodStability: 50,
      },
      explanation:
        "Start your first check-in to get a personalized wellness score. We'll track your progress over time.",
      date: new Date().toISOString(),
    };
  }

  // Calculate individual factors from recent entries
  const avgMood = average(entries.map((e) => e.mood));
  const avgEnergy = average(entries.map((e) => e.energy));
  const avgConfidence = average(entries.map((e) => e.confidence));
  const avgStress = average(entries.map((e) => e.stress));
  const avgSleep = average(entries.map((e) => e.sleepHours));

  // Mood Stability (0-100): based on average mood (1-5 scale) and variance
  const moodVariance = variance(entries.map((e) => e.mood));
  const moodStability = clamp(
    ((avgMood - 1) / 4) * 70 + (1 - Math.min(moodVariance, 2) / 2) * 30,
    0,
    100
  );

  // Sleep Quality (0-100): optimal at 7-8 hours
  const sleepScore = entries.map((e) => {
    if (e.sleepHours >= 7 && e.sleepHours <= 9) return 100;
    if (e.sleepHours >= 6) return 75;
    if (e.sleepHours >= 5) return 50;
    return Math.max(0, e.sleepHours * 10);
  });
  const sleepQuality = average(sleepScore);

  // Stress Management (0-100): inverse of stress (1-10 scale)
  const stressManagement = clamp(((10 - avgStress) / 9) * 100, 0, 100);

  // Study Balance (0-100): combines energy, confidence, and study hours
  const energyScore = ((avgEnergy - 1) / 4) * 100;
  const confidenceScore = (avgConfidence / 10) * 100;
  const studyBalance = (energyScore * 0.4 + confidenceScore * 0.6);

  // Overall: weighted composite
  const overall = clamp(
    Math.round(
      moodStability * 0.25 +
        sleepQuality * 0.3 +
        stressManagement * 0.25 +
        studyBalance * 0.2
    ),
    0,
    100
  );

  // Generate explanation
  const explanation = generateExplanation(overall, {
    moodStability: Math.round(moodStability),
    sleepQuality: Math.round(sleepQuality),
    stressManagement: Math.round(stressManagement),
    studyBalance: Math.round(studyBalance),
  });

  return {
    overall,
    breakdown: {
      studyBalance: Math.round(studyBalance),
      sleepQuality: Math.round(sleepQuality),
      stressManagement: Math.round(stressManagement),
      moodStability: Math.round(moodStability),
    },
    explanation,
    date: new Date().toISOString(),
  };
}

/**
 * Calculate burnout risk score from mood entries
 */
export function calculateBurnoutScore(entries: MoodEntry[]): {
  score: number;
  level: RiskLevel;
} {
  if (entries.length === 0) return { score: 0, level: RiskLevel.Low };

  const avgStress = average(entries.map((e) => e.stress));
  const avgSleep = average(entries.map((e) => e.sleepHours));
  const avgMood = average(entries.map((e) => e.mood));

  let score = 0;
  if (avgSleep < 5) score += 35;
  else if (avgSleep < 7) score += 15;
  if (avgStress > 7) score += 30;
  else if (avgStress > 5) score += 15;
  if (avgMood < 2.5) score += 25;
  else if (avgMood < 3.5) score += 10;

  score = Math.min(100, score);

  let level = RiskLevel.Low;
  if (score >= 60) level = RiskLevel.High;
  else if (score >= 30) level = RiskLevel.Moderate;

  return { score, level };
}

/**
 * Generate personalized recovery suggestions based on current state
 */
export function generateRecoverySuggestions(
  latestEntry?: MoodEntry
): RecoverySuggestion[] {
  const suggestions: RecoverySuggestion[] = [];

  // Always include hydration
  suggestions.push({
    id: generateId(),
    category: 'hydration',
    title: 'Hydrate Your Brain',
    description:
      'Drink a full glass of water. Dehydration reduces cognitive function by up to 25%.',
    duration: '1 min',
    icon: '💧',
  });

  if (!latestEntry) {
    // Default suggestions
    suggestions.push(
      {
        id: generateId(),
        category: 'breathing',
        title: '4-7-8 Breathing',
        description:
          'Breathe in for 4 seconds, hold for 7, exhale for 8. Repeat 3 times. This activates your parasympathetic nervous system.',
        duration: '3 min',
        icon: '🌬️',
      },
      {
        id: generateId(),
        category: 'movement',
        title: 'Quick Stretch Break',
        description:
          'Stand up, stretch your arms overhead, roll your shoulders, and do 5 gentle neck rotations each direction.',
        duration: '3 min',
        icon: '🧘',
      }
    );
    return suggestions;
  }

  // Stress-based suggestions
  if (latestEntry.stress > 6) {
    suggestions.push({
      id: generateId(),
      category: 'breathing',
      title: 'Box Breathing Exercise',
      description:
        'Breathe in for 4 counts, hold for 4, exhale for 4, hold for 4. This technique is used by Navy SEALs to stay calm under pressure.',
      duration: '5 min',
      icon: '🌬️',
    });
  }

  // Sleep-based suggestions
  if (latestEntry.sleepHours < 6) {
    suggestions.push({
      id: generateId(),
      category: 'sleep',
      title: 'Power Nap Recovery',
      description:
        'Take a 20-minute power nap to restore alertness. Set an alarm — longer naps can make you groggier.',
      duration: '20 min',
      icon: '😴',
    });
  }

  // Mood-based suggestions
  if (latestEntry.mood <= 2) {
    suggestions.push({
      id: generateId(),
      category: 'mindfulness',
      title: 'Gratitude Grounding',
      description:
        'Write down 3 things you\'re grateful for today, no matter how small. This shifts your brain from threat mode to appreciation mode.',
      duration: '5 min',
      icon: '🙏',
    });
  }

  // Energy-based suggestions
  if (latestEntry.energy <= 2) {
    suggestions.push({
      id: generateId(),
      category: 'movement',
      title: 'Energy Walk',
      description:
        'Take a brisk 10-minute walk outside. Sunlight and movement boost serotonin and reset your circadian rhythm.',
      duration: '10 min',
      icon: '🚶',
    });
  }

  // Always add mindfulness
  suggestions.push({
    id: generateId(),
    category: 'mindfulness',
    title: 'One-Minute Mindfulness',
    description:
      'Close your eyes. Focus only on your breathing for 60 seconds. When your mind wanders, gently bring it back. No judgment.',
    duration: '1 min',
    icon: '🧠',
  });

  return suggestions;
}

// --- Helper Functions ---

function average(nums: number[]): number {
  if (nums.length === 0) return 0;
  return nums.reduce((sum, n) => sum + n, 0) / nums.length;
}

function variance(nums: number[]): number {
  if (nums.length === 0) return 0;
  const avg = average(nums);
  return average(nums.map((n) => (n - avg) ** 2));
}

function generateExplanation(
  overall: number,
  breakdown: { moodStability: number; sleepQuality: number; stressManagement: number; studyBalance: number }
): string {
  if (overall >= 80) {
    return "You're doing exceptionally well! Your wellness balance is strong. Keep maintaining these healthy habits — they're fueling your preparation effectively.";
  }
  if (overall >= 60) {
    const weakest = Object.entries(breakdown).reduce((min, [key, val]) =>
      val < min[1] ? [key, val] : min
    );
    const weakArea = formatBreakdownKey(weakest[0]);
    return `Your overall balance is good, but ${weakArea} could use some attention. Small improvements here will compound into better study sessions and retention.`;
  }
  if (overall >= 40) {
    return "Your dedication is excellent, but your recovery habits need attention. Remember: a well-rested mind learns twice as fast. Consider prioritizing sleep and stress management.";
  }
  return "Your wellness indicators suggest you're pushing yourself too hard. Please take a step back and focus on self-care today. A single day of rest can dramatically improve your next week of study.";
}

function formatBreakdownKey(key: string): string {
  const map: Record<string, string> = {
    moodStability: 'mood stability',
    sleepQuality: 'sleep quality',
    stressManagement: 'stress management',
    studyBalance: 'study-energy balance',
  };
  return map[key] || key;
}
