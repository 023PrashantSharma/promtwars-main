/* ============================================
   Utility Helpers — Unit Tests
   ============================================ */

import { describe, it, expect } from 'vitest';
import {
  cn,
  generateId,
  clamp,
  getToday,
  getLastNDays,
  formatDuration,
  scoreToColor,
} from '../utils';

describe('Utility Helpers Unit Tests', () => {
  describe('clamp', () => {
    it('should clamp values below minimum', () => {
      expect(clamp(5, 10, 20)).toBe(10);
    });

    it('should clamp values above maximum', () => {
      expect(clamp(25, 10, 20)).toBe(20);
    });

    it('should return value if within range', () => {
      expect(clamp(15, 10, 20)).toBe(15);
    });
  });

  describe('formatDuration', () => {
    it('should format durations under an hour', () => {
      expect(formatDuration(45)).toBe('45min');
    });

    it('should format exact hour durations', () => {
      expect(formatDuration(120)).toBe('2h');
    });

    it('should format hour and minute durations', () => {
      expect(formatDuration(75)).toBe('1h 15m');
    });
  });

  describe('getToday', () => {
    it('should return date in YYYY-MM-DD format', () => {
      const today = getToday();
      expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('getLastNDays', () => {
    it('should return exact number of days requested', () => {
      const days = getLastNDays(5);
      expect(days.length).toBe(5);
      days.forEach((day) => {
        expect(day).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      });
    });
  });

  describe('generateId', () => {
    it('should generate a unique non-empty string', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
      expect(id1.length).toBeGreaterThan(5);
    });
  });

  describe('cn', () => {
    it('should merge tailwind classes correctly', () => {
      expect(cn('px-2', 'py-2')).toContain('px-2 py-2');
      expect(cn('px-2 py-2', 'px-4')).toBe('py-2 px-4');
    });
  });

  describe('scoreToColor', () => {
    it('should return valid hex colors for scores', () => {
      expect(scoreToColor(0)).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(scoreToColor(50)).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(scoreToColor(100)).toMatch(/^#[0-9a-fA-F]{6}$/);
    });
  });
});
