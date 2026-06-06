/* ============================================
   Wellness Engine — Unit Tests
   ============================================ */

import { describe, it, expect } from 'vitest';
import {
  calculateWellnessScore,
  calculateBurnoutScore,
  generateRecoverySuggestions,
} from '../wellness-engine';
import { MoodLevel, EnergyLevel, RiskLevel } from '@/types';
import type { MoodEntry } from '@/types';

function createMoodEntry(overrides: Partial<MoodEntry> = {}): MoodEntry {
  return {
    id: `test-${Date.now()}`,
    date: new Date().toISOString().split('T')[0],
    mood: MoodLevel.Good,
    energy: EnergyLevel.High,
    confidence: 7,
    stress: 3,
    sleepHours: 8,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

describe('calculateWellnessScore', () => {
  it('should return default score of 50 for empty entries', () => {
    const result = calculateWellnessScore([]);
    expect(result.overall).toBe(50);
    expect(result.explanation).toContain('first check-in');
  });

  it('should return high score for positive entries', () => {
    const entries = Array.from({ length: 7 }, (_, i) =>
      createMoodEntry({
        id: `good-${i}`,
        mood: MoodLevel.Amazing,
        energy: EnergyLevel.Energized,
        confidence: 9,
        stress: 2,
        sleepHours: 8,
        date: new Date(Date.now() - i * 86400000).toISOString().split('T')[0],
      })
    );
    const result = calculateWellnessScore(entries);
    expect(result.overall).toBeGreaterThan(70);
  });

  it('should return low score for negative entries', () => {
    const entries = Array.from({ length: 7 }, (_, i) =>
      createMoodEntry({
        id: `bad-${i}`,
        mood: MoodLevel.Terrible,
        energy: EnergyLevel.Exhausted,
        confidence: 2,
        stress: 9,
        sleepHours: 3,
        date: new Date(Date.now() - i * 86400000).toISOString().split('T')[0],
      })
    );
    const result = calculateWellnessScore(entries);
    expect(result.overall).toBeLessThan(40);
  });

  it('should have all breakdown values between 0 and 100', () => {
    const entries = [
      createMoodEntry({ mood: MoodLevel.Okay, stress: 5, sleepHours: 6 }),
    ];
    const result = calculateWellnessScore(entries);
    Object.values(result.breakdown).forEach((value) => {
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(100);
    });
  });

  it('should weight sleep quality highest', () => {
    // Same mood but different sleep
    const goodSleep = [createMoodEntry({ sleepHours: 8, stress: 5, mood: MoodLevel.Okay })];
    const badSleep = [createMoodEntry({ sleepHours: 3, stress: 5, mood: MoodLevel.Okay })];

    const goodResult = calculateWellnessScore(goodSleep);
    const badResult = calculateWellnessScore(badSleep);

    expect(goodResult.overall).toBeGreaterThan(badResult.overall);
  });
});

describe('calculateBurnoutScore', () => {
  it('should return low risk for empty entries', () => {
    const result = calculateBurnoutScore([]);
    expect(result.score).toBe(0);
    expect(result.level).toBe(RiskLevel.Low);
  });

  it('should return low risk for healthy patterns', () => {
    const entries = [
      createMoodEntry({
        mood: MoodLevel.Good,
        stress: 3,
        sleepHours: 8,
      }),
    ];
    const result = calculateBurnoutScore(entries);
    expect(result.level).toBe(RiskLevel.Low);
    expect(result.score).toBeLessThan(30);
  });

  it('should return high risk for poor sleep + high stress + low mood', () => {
    const entries = Array.from({ length: 5 }, (_, i) =>
      createMoodEntry({
        id: `burnout-${i}`,
        mood: MoodLevel.Terrible,
        stress: 9,
        sleepHours: 3,
      })
    );
    const result = calculateBurnoutScore(entries);
    expect(result.level).toBe(RiskLevel.High);
    expect(result.score).toBeGreaterThanOrEqual(60);
  });

  it('should return moderate risk for mixed signals', () => {
    const entries = [
      createMoodEntry({
        mood: MoodLevel.Okay,
        stress: 6,
        sleepHours: 5.5,
      }),
    ];
    const result = calculateBurnoutScore(entries);
    expect(result.level).toBe(RiskLevel.Moderate);
  });
});

describe('generateRecoverySuggestions', () => {
  it('should always include hydration suggestion', () => {
    const suggestions = generateRecoverySuggestions();
    const hydration = suggestions.find((s) => s.category === 'hydration');
    expect(hydration).toBeDefined();
  });

  it('should include breathing for high stress', () => {
    const entry = createMoodEntry({ stress: 8 });
    const suggestions = generateRecoverySuggestions(entry);
    const breathing = suggestions.find((s) => s.category === 'breathing');
    expect(breathing).toBeDefined();
  });

  it('should include sleep recovery for low sleep', () => {
    const entry = createMoodEntry({ sleepHours: 4 });
    const suggestions = generateRecoverySuggestions(entry);
    const sleep = suggestions.find((s) => s.category === 'sleep');
    expect(sleep).toBeDefined();
  });

  it('should include mindfulness for low mood', () => {
    const entry = createMoodEntry({ mood: MoodLevel.Terrible });
    const suggestions = generateRecoverySuggestions(entry);
    const mindfulness = suggestions.find((s) => s.category === 'mindfulness');
    expect(mindfulness).toBeDefined();
  });

  it('should include movement for low energy', () => {
    const entry = createMoodEntry({ energy: EnergyLevel.Exhausted });
    const suggestions = generateRecoverySuggestions(entry);
    const movement = suggestions.find((s) => s.category === 'movement');
    expect(movement).toBeDefined();
  });
});
