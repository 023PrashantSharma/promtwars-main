/* ============================================
   Mock AI Provider — Unit Tests
   ============================================ */

import { describe, it, expect } from 'vitest';
import { MockAIProvider } from '../ai/mock';
import { RiskLevel } from '@/types';

describe('MockAIProvider', () => {
  const provider = new MockAIProvider();

  describe('generateReflection', () => {
    it('should return a valid AIReflection', async () => {
      const result = await provider.generateReflection(
        'I studied all day but still feel behind.'
      );

      expect(result.emotionalSummary).toBeTruthy();
      expect(result.encouragement).toBeTruthy();
      expect(result.wellnessAdvice).toBeTruthy();
      expect(result.practicalNextStep).toBeTruthy();
      expect(result.detectedEmotions).toBeInstanceOf(Array);
      expect(result.detectedEmotions.length).toBeGreaterThan(0);
    });

    it('should cycle through different responses', async () => {
      const result1 = await provider.generateReflection('Entry 1');
      const result2 = await provider.generateReflection('Entry 2');

      // They should be different (cycled)
      expect(result1.emotionalSummary).not.toBe(result2.emotionalSummary);
    });
  });

  describe('chat', () => {
    it('should return anxiety-related response for anxiety keywords', async () => {
      const result = await provider.chat([], "I'm feeling anxious about my exam");
      expect(result).toBeTruthy();
      expect(result.length).toBeGreaterThan(50);
    });

    it('should return motivation response for motivation keywords', async () => {
      const result = await provider.chat([], "I'm losing motivation");
      expect(result).toBeTruthy();
    });

    it('should return score response for score keywords', async () => {
      const result = await provider.chat([], 'I scored poorly today');
      expect(result).toBeTruthy();
    });

    it('should return default response for generic messages', async () => {
      const result = await provider.chat([], 'Hello, how are you?');
      expect(result).toBeTruthy();
    });
  });

  describe('analyzeBurnoutRisk', () => {
    it('should return low risk for good data', async () => {
      const result = await provider.analyzeBurnoutRisk({
        recentMoods: [4, 4, 5],
        recentStress: [2, 3, 2],
        recentSleep: [8, 7.5, 8],
        recentStudyHours: [6, 5, 7],
        averageMood: 4.3,
        averageStress: 2.3,
        averageSleep: 7.8,
      });

      expect(result.risk.level).toBe(RiskLevel.Low);
      expect(result.risk.score).toBeLessThan(30);
      expect(result.shouldAlert).toBe(false);
    });

    it('should return high risk for poor data', async () => {
      const result = await provider.analyzeBurnoutRisk({
        recentMoods: [1, 2, 1],
        recentStress: [9, 8, 9],
        recentSleep: [3, 4, 3],
        recentStudyHours: [12, 14, 13],
        averageMood: 1.3,
        averageStress: 8.7,
        averageSleep: 3.3,
      });

      expect(result.risk.level).toBe(RiskLevel.High);
      expect(result.risk.score).toBeGreaterThanOrEqual(60);
      expect(result.shouldAlert).toBe(true);
    });

    it('should include recommendations', async () => {
      const result = await provider.analyzeBurnoutRisk({
        recentMoods: [3, 3, 3],
        recentStress: [5, 5, 5],
        recentSleep: [6, 6, 6],
        recentStudyHours: [8, 8, 8],
        averageMood: 3,
        averageStress: 5,
        averageSleep: 6,
      });

      expect(result.risk.recommendations).toBeInstanceOf(Array);
      expect(result.risk.recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('identifyTriggers', () => {
    it('should return stress triggers', async () => {
      const result = await provider.identifyTriggers({
        journalEntries: ['I felt stressed after the mock test'],
        moodPatterns: [{ date: '2026-06-01', mood: 2, stress: 8 }],
      });

      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].trigger).toBeTruthy();
      expect(result[0].insight).toBeTruthy();
    });
  });

  describe('generateMotivation', () => {
    it('should return motivational message', async () => {
      const result = await provider.generateMotivation('JEE', 45);
      expect(result).toBeTruthy();
      expect(result.length).toBeGreaterThan(20);
    });

    it('should return urgent message for < 7 days', async () => {
      const result = await provider.generateMotivation('NEET', 5);
      expect(result).toContain('ready');
    });
  });
});
