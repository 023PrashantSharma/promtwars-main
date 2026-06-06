/* ============================================
   AI Service — Mock Provider
   Provides realistic responses without API key
   ============================================ */

import type { AIProvider, BurnoutContext, BurnoutRiskAnalysis, TriggerContext } from './types';
import type { AIReflection, ChatMessage, StressTrigger, RiskLevel } from '@/types';
import { generateId } from '@/lib/utils';

const REFLECTION_RESPONSES: AIReflection[] = [
  {
    emotionalSummary:
      "You're experiencing a mix of determination and self-doubt — this is completely normal during intense preparation. Your feelings of being 'behind' don't reflect your actual progress.",
    encouragement:
      "The fact that you studied all day shows incredible dedication. Most students would have given up hours ago. You're building something powerful, even when it doesn't feel like it.",
    wellnessAdvice:
      'Consider a 10-minute walk before your next study session. Physical movement helps your brain consolidate what you learned today. Your brain processes and organizes information during rest — you earned this break.',
    practicalNextStep:
      "Tonight, write down just 3 things you learned today. No matter how small. Tomorrow, start with a quick review of those 3 points — you'll be surprised how much you retained.",
    detectedEmotions: ['determination', 'self-doubt', 'fatigue', 'anxiety'],
  },
  {
    emotionalSummary:
      "There's a strong current of anxiety running through your thoughts, but also resilience. You're carrying a heavy load, and it's okay to acknowledge that weight.",
    encouragement:
      "Remember — every expert was once a beginner who didn't quit. The subjects that feel hardest now are the ones you'll master most deeply. Struggle is not failure; it's growth in disguise.",
    wellnessAdvice:
      "Your stress levels suggest you need a recovery ritual. Try the 4-7-8 breathing technique: breathe in for 4 seconds, hold for 7, exhale for 8. Do this 3 times before your next study block.",
    practicalNextStep:
      "Break tomorrow's study plan into 25-minute focused blocks with 5-minute breaks. Start with your strongest subject to build momentum, then tackle the challenging one when you feel confident.",
    detectedEmotions: ['anxiety', 'resilience', 'overwhelm', 'hope'],
  },
  {
    emotionalSummary:
      "Your journal reflects someone who cares deeply about their future. That passion is your superpower, even when it feels like pressure. You're not just preparing for an exam — you're growing as a person.",
    encouragement:
      "You've already shown more courage than you realize. Sitting down to study when you feel overwhelmed? That's bravery. Keep going — your future self is cheering you on.",
    wellnessAdvice:
      "Adequate hydration and sleep are non-negotiable for memory retention. Tonight, aim for at least 7 hours of sleep. A well-rested mind absorbs more in 3 hours than a tired mind in 8.",
    practicalNextStep:
      "Create a 'wins journal' alongside your study notes. Every day, write one small win. 'I understood integration by parts today' counts. This builds a powerful confidence reserve.",
    detectedEmotions: ['passion', 'pressure', 'determination', 'vulnerability'],
  },
];

const COACH_RESPONSES: Record<string, string[]> = {
  anxiety: [
    "I hear you, and what you're feeling is completely valid. Anxiety before exams is your brain's way of saying 'this matters to me.' Let's work with that energy rather than against it.\n\nHere's what I'd suggest right now:\n\n1. **Ground yourself** — Name 5 things you can see, 4 you can touch, 3 you can hear. This brings you back to the present.\n\n2. **Reframe the thought** — Instead of 'I might fail,' try 'I'm preparing because I want to succeed.'\n\n3. **Take one small action** — Open your weakest subject for just 10 minutes. Often, starting is the hardest part.\n\nYou've got this. What specific topic is worrying you the most?",
    "Anxiety is actually a sign of intelligence — your brain is trying to protect you by anticipating challenges. The key is channeling it productively.\n\nTry this **5-minute reset**:\n- Close your eyes\n- Take 3 deep breaths\n- Visualize yourself calmly working through a problem\n- Open your eyes and start with something easy\n\nWhat would make you feel even 10% better right now?",
  ],
  motivation: [
    "Losing motivation doesn't mean you've lost your dream — it means you're human. Even Olympic athletes have days where they don't want to train.\n\nHere's the truth: **motivation follows action, not the other way around.** You don't need to feel motivated to start. Start small, and the motivation catches up.\n\n**Your challenge for the next 30 minutes:**\n- Pick your favorite topic\n- Study for just 15 minutes\n- Reward yourself with something you enjoy\n\nConsistency > intensity. A little every day beats a lot sometimes.",
    "I understand that feeling. When you've been grinding for weeks, it's natural for the spark to dim. But here's what I want you to remember:\n\n**You started this journey for a reason.** Close your eyes and remember that moment when you first decided to aim for this exam. That version of you is still here.\n\n**Practical step:** Change your environment. Study in a different room, a café, or even outside. A new setting can reboot your mental energy.",
  ],
  score: [
    "One score does not define your entire journey. I know it stings — and that's okay. Feel the disappointment, but don't let it write the story of your future.\n\n**Let's analyze, not agonize:**\n- What went well in the test?\n- What topics tripped you up?\n- Were you well-rested and calm during the test?\n\nEvery 'failure' is data. Use this score as a map that shows you exactly where to focus next. That's a gift, not a punishment.\n\nWhat subject are you most worried about?",
  ],
  default: [
    "Thank you for sharing that with me. Your feelings are valid, and it takes courage to express them.\n\nHere's what I want you to know: **you are more than your study hours, your scores, and your preparation level.** You are a whole person who is working incredibly hard.\n\nTake a moment right now to appreciate how far you've come. Then, let's figure out one small thing we can do to make today better. What would help you most right now?",
    "I'm here for you. Let's take this one step at a time.\n\nRemember: **progress isn't always visible.** The understanding building in your mind, the neural connections forming with each study session — these are real, even when you can't see them.\n\nWhat's the one thing weighing on you most right now? Let's tackle it together.",
  ],
};

const MOTIVATIONAL_INSIGHTS: string[] = [
  'Every day of preparation is an investment in your future. Stay consistent, stay confident.',
  "The countdown isn't a threat — it's a roadmap. You know exactly how much time you have. Use it wisely.",
  'Thousands of students before you felt exactly this way and succeeded. You are capable of the same.',
  "Focus on progress, not perfection. You don't need to know everything — you need to know enough.",
  "Your preparation today shapes your confidence tomorrow. Trust the process you've committed to.",
];

export class MockAIProvider implements AIProvider {
  private responseIndex = 0;

  async generateReflection(_journalContent: string): Promise<AIReflection> {
    // Simulate API delay
    await this.simulateDelay();
    const response = REFLECTION_RESPONSES[this.responseIndex % REFLECTION_RESPONSES.length];
    this.responseIndex++;
    return response;
  }

  async chat(_messages: ChatMessage[], userMessage: string): Promise<string> {
    await this.simulateDelay();

    const lower = userMessage.toLowerCase();
    let category = 'default';

    if (lower.includes('anxious') || lower.includes('anxiety') || lower.includes('nervous') || lower.includes('scared') || lower.includes('worried')) {
      category = 'anxiety';
    } else if (lower.includes('motivat') || lower.includes('giving up') || lower.includes('can\'t do') || lower.includes('losing hope')) {
      category = 'motivation';
    } else if (lower.includes('score') || lower.includes('failed') || lower.includes('poorly') || lower.includes('marks')) {
      category = 'score';
    }

    const responses = COACH_RESPONSES[category] || COACH_RESPONSES.default;
    return responses[Math.floor(Math.random() * responses.length)];
  }

  async analyzeBurnoutRisk(context: BurnoutContext): Promise<BurnoutRiskAnalysis> {
    await this.simulateDelay();

    const { averageMood, averageStress, averageSleep } = context;

    let score = 0;
    const factors = [];

    // Sleep factor
    if (averageSleep < 5) {
      score += 35;
      factors.push({
        name: 'Sleep Deprivation',
        severity: 80,
        description: `You're averaging only ${averageSleep.toFixed(1)} hours of sleep. This significantly impairs memory consolidation and cognitive function.`,
      });
    } else if (averageSleep < 7) {
      score += 15;
      factors.push({
        name: 'Insufficient Sleep',
        severity: 45,
        description: `Your average ${averageSleep.toFixed(1)} hours is below the recommended 7-8 hours for optimal brain function.`,
      });
    }

    // Stress factor
    if (averageStress > 7) {
      score += 30;
      factors.push({
        name: 'High Sustained Stress',
        severity: 75,
        description: 'Your stress levels have been consistently elevated. Chronic stress reduces study effectiveness.',
      });
    } else if (averageStress > 5) {
      score += 15;
      factors.push({
        name: 'Moderate Stress',
        severity: 40,
        description: 'Your stress is noticeable. Regular breaks and relaxation techniques can help manage it.',
      });
    }

    // Mood factor
    if (averageMood < 2.5) {
      score += 25;
      factors.push({
        name: 'Low Mood',
        severity: 65,
        description: 'Your overall mood has been low recently. This can affect motivation and retention.',
      });
    } else if (averageMood < 3.5) {
      score += 10;
      factors.push({
        name: 'Fluctuating Mood',
        severity: 30,
        description: 'Your mood varies day to day. Establishing consistent routines can help stabilize it.',
      });
    }

    score = Math.min(100, score);

    let level: RiskLevel;
    let explanation: string;
    const recommendations: string[] = [];

    if (score < 30) {
      level = 'low' as RiskLevel;
      explanation = "You're managing your wellness well. Keep up the good balance between study and recovery.";
      recommendations.push(
        'Continue your current routine — it seems to be working well',
        'Consider adding a short mindfulness session before bed',
        'Stay hydrated throughout your study sessions'
      );
    } else if (score < 60) {
      level = 'moderate' as RiskLevel;
      explanation = "There are some warning signs that deserve attention. With small adjustments, you can prevent burnout.";
      recommendations.push(
        'Prioritize getting at least 7 hours of sleep tonight',
        'Take a 15-minute walk between study sessions',
        'Practice the 4-7-8 breathing technique when stress spikes',
        'Consider reducing study hours slightly for better quality sessions'
      );
    } else {
      level = 'high' as RiskLevel;
      explanation = "Your current patterns suggest a high risk of burnout. It's important to take immediate steps to protect your wellbeing.";
      recommendations.push(
        'Take today off or significantly reduce study hours',
        'Get at least 8 hours of sleep for the next 3 days',
        'Talk to someone you trust about how you\'re feeling',
        'Break your study schedule into smaller, manageable blocks',
        'Include at least 30 minutes of physical activity tomorrow'
      );
    }

    return {
      risk: {
        level,
        score,
        factors,
        explanation,
        recommendations,
        date: new Date().toISOString(),
      },
      shouldAlert: score >= 60,
    };
  }

  async identifyTriggers(_context: TriggerContext): Promise<StressTrigger[]> {
    await this.simulateDelay();

    return [
      {
        id: generateId(),
        trigger: 'Mock Test Performance',
        frequency: 5,
        severity: 'moderate' as RiskLevel,
        insight: 'Your stress tends to spike after mock tests. Remember, mocks are diagnostic tools, not verdicts. Use results to identify weak areas, not to measure your worth.',
        firstDetected: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        lastDetected: new Date().toISOString(),
      },
      {
        id: generateId(),
        trigger: 'Late Night Study Sessions',
        frequency: 8,
        severity: 'high' as RiskLevel,
        insight: 'Studying past midnight correlates with lower mood the next day. Your brain consolidates memories during sleep — late nights may actually hurt retention.',
        firstDetected: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
        lastDetected: new Date().toISOString(),
      },
      {
        id: generateId(),
        trigger: 'Peer Comparison',
        frequency: 3,
        severity: 'moderate' as RiskLevel,
        insight: "Mentions of other students' progress often appear alongside lower confidence entries. Remember: everyone has a different journey and timeline.",
        firstDetected: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        lastDetected: new Date().toISOString(),
      },
    ];
  }

  async generateMotivation(_examName: string, daysRemaining: number): Promise<string> {
    await this.simulateDelay();
    if (daysRemaining <= 7) {
      return "The finish line is in sight. You've prepared for this moment. Trust your hard work, stay calm, and give your best. You're ready.";
    }
    if (daysRemaining <= 30) {
      return "The final stretch is here. This is where consistent revision beats new topics. Focus on strengthening what you know. You've built a strong foundation.";
    }
    return MOTIVATIONAL_INSIGHTS[Math.floor(Math.random() * MOTIVATIONAL_INSIGHTS.length)];
  }

  private async simulateDelay(): Promise<void> {
    const delay = 500 + Math.random() * 1000;
    return new Promise((resolve) => setTimeout(resolve, delay));
  }
}
