/* ============================================
   AI Service — OpenAI Provider
   ============================================ */

import type { AIProvider, AIConfig, BurnoutContext, BurnoutRiskAnalysis, TriggerContext } from './types';
import type { AIReflection, ChatMessage, StressTrigger, RiskLevel } from '@/types';
import { generateId } from '@/lib/utils';

export class OpenAIProvider implements AIProvider {
  private apiKey: string;
  private model: string;
  private temperature: number;
  private maxTokens: number;

  constructor(config: AIConfig) {
    this.apiKey = config.apiKey || '';
    this.model = config.model || 'gpt-4o-mini';
    this.temperature = config.temperature || 0.7;
    this.maxTokens = config.maxTokens || 1000;
  }

  private async callOpenAI(
    systemPrompt: string,
    userPrompt: string,
    options?: { temperature?: number; maxTokens?: number }
  ): Promise<string> {
    const response = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: options?.temperature ?? this.temperature,
        max_tokens: options?.maxTokens ?? this.maxTokens,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI request failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.content;
  }

  async generateReflection(journalContent: string): Promise<AIReflection> {
    const systemPrompt = `You are a warm, empathetic AI wellness companion for students preparing for competitive exams (JEE, NEET, UPSC, etc.).

Your role is to analyze journal entries and provide supportive, actionable reflections. You are NOT a therapist or medical professional.

RESPOND ONLY IN VALID JSON with this exact structure:
{
  "emotionalSummary": "A 2-3 sentence empathetic summary of their emotional state",
  "encouragement": "A genuine, specific encouragement (not generic positivity)",
  "wellnessAdvice": "One concrete wellness tip relevant to their situation",
  "practicalNextStep": "One specific, actionable step they can take right now",
  "detectedEmotions": ["emotion1", "emotion2", "emotion3"]
}

Be warm, human, and supportive. Never be robotic. Never give medical advice.`;

    const result = await this.callOpenAI(systemPrompt, journalContent);
    try {
      return JSON.parse(result) as AIReflection;
    } catch {
      return {
        emotionalSummary: result,
        encouragement: 'Keep going — your effort matters more than you know.',
        wellnessAdvice: 'Take a short break and practice deep breathing.',
        practicalNextStep: 'Write down one thing you learned today.',
        detectedEmotions: ['determined'],
      };
    }
  }

  async chat(messages: ChatMessage[], userMessage: string): Promise<string> {
    const systemPrompt = `You are MindFlow, a warm and empathetic AI wellness coach for students preparing for competitive exams.

Guidelines:
- Be supportive, understanding, and encouraging
- Provide practical, actionable advice
- NEVER give medical or psychiatric advice
- NEVER be dismissive of feelings
- Keep responses concise but meaningful (2-3 paragraphs max)
- Use formatting (bold, lists) when it helps clarity
- If a student seems in crisis, gently suggest speaking with a trusted adult or calling a helpline`;

    const formattedMessages = [
      { role: 'system' as const, content: systemPrompt },
      ...messages.map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
      { role: 'user' as const, content: userMessage },
    ];

    const response = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.model,
        messages: formattedMessages,
        temperature: this.temperature,
        max_tokens: this.maxTokens,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI request failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.content;
  }

  async analyzeBurnoutRisk(context: BurnoutContext): Promise<BurnoutRiskAnalysis> {
    const systemPrompt = `You are an AI wellness analyzer for students. Analyze the following wellness data and assess burnout risk.

RESPOND ONLY IN VALID JSON:
{
  "level": "low" | "moderate" | "high",
  "score": 0-100,
  "factors": [{"name": "factor name", "severity": 0-100, "description": "brief explanation"}],
  "explanation": "2-3 sentence summary",
  "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"]
}`;

    const userPrompt = `Student wellness data (last 7 days):
- Average mood: ${context.averageMood}/5
- Average stress: ${context.averageStress}/10
- Average sleep: ${context.averageSleep} hours
- Recent mood trend: [${context.recentMoods.join(', ')}]
- Recent stress trend: [${context.recentStress.join(', ')}]
- Recent sleep trend: [${context.recentSleep.join(', ')}]`;

    const result = await this.callOpenAI(systemPrompt, userPrompt);
    try {
      const parsed = JSON.parse(result);
      return {
        risk: { ...parsed, date: new Date().toISOString() },
        shouldAlert: parsed.score >= 60,
      };
    } catch {
      // Fallback to deterministic calculation
      return this.fallbackBurnoutAnalysis(context);
    }
  }

  async identifyTriggers(context: TriggerContext): Promise<StressTrigger[]> {
    const systemPrompt = `You are an AI that identifies stress triggers from student journal entries and mood data.

RESPOND ONLY IN VALID JSON as an array:
[{
  "trigger": "trigger name",
  "frequency": number,
  "severity": "low" | "moderate" | "high",
  "insight": "empathetic explanation in 1-2 sentences"
}]

Identify 2-4 triggers maximum. Be specific and empathetic.`;

    const userPrompt = `Journal entries:\n${context.journalEntries.join('\n---\n')}\n\nMood patterns:\n${JSON.stringify(context.moodPatterns)}`;

    const result = await this.callOpenAI(systemPrompt, userPrompt);
    try {
      const parsed = JSON.parse(result);
      return parsed.map((t: { trigger: string; frequency: number; severity: RiskLevel; insight: string }) => ({
        id: generateId(),
        trigger: t.trigger,
        frequency: t.frequency,
        severity: t.severity,
        insight: t.insight,
        firstDetected: new Date().toISOString(),
        lastDetected: new Date().toISOString(),
      }));
    } catch {
      return [];
    }
  }

  async generateMotivation(examName: string, daysRemaining: number): Promise<string> {
    const systemPrompt = 'Generate a brief (1-2 sentences), warm motivational message for a student. Be specific to their exam and timeline. No clichés.';
    return this.callOpenAI(
      systemPrompt,
      `Student is preparing for ${examName}. ${daysRemaining} days remaining.`
    );
  }

  private fallbackBurnoutAnalysis(context: BurnoutContext): BurnoutRiskAnalysis {
    const { averageMood, averageStress, averageSleep } = context;
    let score = 0;

    if (averageSleep < 5) score += 35;
    else if (averageSleep < 7) score += 15;

    if (averageStress > 7) score += 30;
    else if (averageStress > 5) score += 15;

    if (averageMood < 2.5) score += 25;
    else if (averageMood < 3.5) score += 10;

    score = Math.min(100, score);

    let level: RiskLevel = 'low' as RiskLevel;
    if (score >= 60) level = 'high' as RiskLevel;
    else if (score >= 30) level = 'moderate' as RiskLevel;

    return {
      risk: {
        level,
        score,
        factors: [],
        explanation: 'Analysis based on your recent wellness data.',
        recommendations: ['Prioritize sleep', 'Take regular breaks', 'Practice deep breathing'],
        date: new Date().toISOString(),
      },
      shouldAlert: score >= 60,
    };
  }
}
