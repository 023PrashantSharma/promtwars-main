/* ============================================
   AI Service — Type Definitions
   ============================================ */

import type { AIReflection, ChatMessage, BurnoutRisk, StressTrigger } from '@/types';

/**
 * Abstract AI Provider interface.
 * All AI providers must implement this contract.
 * This enables swapping OpenAI for any other provider
 * without changing UI code.
 */
export interface AIProvider {
  /**
   * Generate a reflection based on journal content
   */
  generateReflection(journalContent: string): Promise<AIReflection>;

  /**
   * Chat with the AI wellness coach
   */
  chat(messages: ChatMessage[], userMessage: string): Promise<string>;

  /**
   * Analyze burnout risk from recent mood data
   */
  analyzeBurnoutRisk(context: BurnoutContext): Promise<BurnoutRiskAnalysis>;

  /**
   * Identify stress triggers from journal and mood entries
   */
  identifyTriggers(context: TriggerContext): Promise<StressTrigger[]>;

  /**
   * Generate motivational insight for exam countdown
   */
  generateMotivation(examName: string, daysRemaining: number): Promise<string>;
}

export interface BurnoutContext {
  recentMoods: number[];
  recentStress: number[];
  recentSleep: number[];
  recentStudyHours: number[];
  averageMood: number;
  averageStress: number;
  averageSleep: number;
}

export interface BurnoutRiskAnalysis {
  risk: BurnoutRisk;
  shouldAlert: boolean;
}

export interface TriggerContext {
  journalEntries: string[];
  moodPatterns: Array<{ date: string; mood: number; stress: number; notes?: string }>;
}

export interface AIConfig {
  apiKey?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}
