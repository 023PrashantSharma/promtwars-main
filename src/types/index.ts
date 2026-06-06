/* ============================================
   MindFlow — Core Type Definitions
   ============================================ */

// --- Enums ---

export enum MoodLevel {
  Terrible = 1,
  Bad = 2,
  Okay = 3,
  Good = 4,
  Amazing = 5,
}

export enum EnergyLevel {
  Exhausted = 1,
  Low = 2,
  Moderate = 3,
  High = 4,
  Energized = 5,
}

export enum ExamType {
  JEE = 'JEE',
  NEET = 'NEET',
  UPSC = 'UPSC',
  CAT = 'CAT',
  GATE = 'GATE',
  CUET = 'CUET',
  BoardExams = 'Board Exams',
}

export enum RiskLevel {
  Low = 'low',
  Moderate = 'moderate',
  High = 'high',
}

export enum FocusMode {
  Short = 25,
  Medium = 45,
  Long = 90,
}

// --- Mood Labels & Icons ---

export const MOOD_CONFIG: Record<MoodLevel, { label: string; emoji: string; color: string }> = {
  [MoodLevel.Terrible]: { label: 'Terrible', emoji: '😞', color: '#EF4444' },
  [MoodLevel.Bad]: { label: 'Bad', emoji: '😔', color: '#F59E0B' },
  [MoodLevel.Okay]: { label: 'Okay', emoji: '😐', color: '#94A3B8' },
  [MoodLevel.Good]: { label: 'Good', emoji: '😊', color: '#4ADE80' },
  [MoodLevel.Amazing]: { label: 'Amazing', emoji: '🤩', color: '#22C55E' },
};

export const ENERGY_CONFIG: Record<EnergyLevel, { label: string; emoji: string }> = {
  [EnergyLevel.Exhausted]: { label: 'Exhausted', emoji: '🪫' },
  [EnergyLevel.Low]: { label: 'Low', emoji: '😴' },
  [EnergyLevel.Moderate]: { label: 'Moderate', emoji: '⚡' },
  [EnergyLevel.High]: { label: 'High', emoji: '🔋' },
  [EnergyLevel.Energized]: { label: 'Energized', emoji: '⚡️' },
};

// --- Data Models ---

export interface MoodEntry {
  id: string;
  date: string; // ISO date string
  mood: MoodLevel;
  energy: EnergyLevel;
  confidence: number; // 1-10
  stress: number; // 1-10
  sleepHours: number; // 0-12
  studyHours?: number; // 0-16
  notes?: string;
  createdAt: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  content: string; // markdown content
  audioUrl?: string; // voice recording blob URL
  transcription?: string;
  aiReflection?: AIReflection;
  emotionTags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AIReflection {
  emotionalSummary: string;
  encouragement: string;
  wellnessAdvice: string;
  practicalNextStep: string;
  detectedEmotions: string[];
}

export interface WellnessScore {
  overall: number; // 0-100
  breakdown: {
    studyBalance: number;
    sleepQuality: number;
    stressManagement: number;
    moodStability: number;
  };
  explanation: string;
  date: string;
}

export interface BurnoutRisk {
  level: RiskLevel;
  score: number; // 0-100
  factors: BurnoutFactor[];
  explanation: string;
  recommendations: string[];
  date: string;
}

export interface BurnoutFactor {
  name: string;
  severity: number; // 0-100
  description: string;
}

export interface StressTrigger {
  id: string;
  trigger: string;
  frequency: number; // how often detected
  severity: RiskLevel;
  insight: string; // natural language explanation
  firstDetected: string;
  lastDetected: string;
}

export interface FocusSession {
  id: string;
  mode: FocusMode;
  startedAt: string;
  completedAt?: string;
  completed: boolean;
  date: string;
}

export interface ExamCountdown {
  examType: ExamType;
  examDate: string;
  daysRemaining: number;
  motivationalInsight: string;
}

export interface RecoverySuggestion {
  id: string;
  category: 'hydration' | 'breathing' | 'sleep' | 'movement' | 'mindfulness';
  title: string;
  description: string;
  duration?: string; // e.g., "5 min"
  icon: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

// --- Exam Dates (Default Approximate) ---

export const DEFAULT_EXAM_DATES: Record<ExamType, string> = {
  [ExamType.JEE]: '2027-01-25',
  [ExamType.NEET]: '2027-05-04',
  [ExamType.UPSC]: '2026-10-12',
  [ExamType.CAT]: '2026-11-24',
  [ExamType.GATE]: '2027-02-08',
  [ExamType.CUET]: '2027-05-20',
  [ExamType.BoardExams]: '2027-03-01',
};

// --- User Preferences ---

export interface UserPreferences {
  selectedExam: ExamType | null;
  customExamDate: string | null;
  theme: 'dark' | 'light';
  name: string;
  email: string | null;
  focusStreak: number;
  onboardingCompleted: boolean;
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  selectedExam: null,
  customExamDate: null,
  theme: 'dark',
  name: '',
  email: null,
  focusStreak: 0,
  onboardingCompleted: false,
};
