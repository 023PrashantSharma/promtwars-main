/* ============================================
   Storage Service — localStorage Abstraction
   ============================================ */

import type {
  MoodEntry,
  JournalEntry,
  FocusSession,
  UserPreferences,
  ChatMessage,
} from '@/types';

const STORAGE_KEYS = {
  MOOD_ENTRIES: 'mindflow_mood_entries',
  JOURNAL_ENTRIES: 'mindflow_journal_entries',
  FOCUS_SESSIONS: 'mindflow_focus_sessions',
  CHAT_HISTORY: 'mindflow_chat_history',
  PREFERENCES: 'mindflow_preferences',
} as const;

/**
 * Type-safe localStorage wrapper with JSON serialization
 */
function getItem<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw) as T;
  } catch {
    return defaultValue;
  }
}

function setItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Failed to save to localStorage: ${key}`, error);
  }
}

// --- Mood Entries ---

export function getMoodEntries(): MoodEntry[] {
  return getItem<MoodEntry[]>(STORAGE_KEYS.MOOD_ENTRIES, []);
}

export function saveMoodEntry(entry: MoodEntry): void {
  const entries = getMoodEntries();
  // Replace if same date exists, otherwise add
  const existingIndex = entries.findIndex((e) => e.date === entry.date);
  if (existingIndex >= 0) {
    entries[existingIndex] = entry;
  } else {
    entries.unshift(entry);
  }
  setItem(STORAGE_KEYS.MOOD_ENTRIES, entries);
}

export function getRecentMoodEntries(days: number = 7): MoodEntry[] {
  const entries = getMoodEntries();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return entries.filter((e) => new Date(e.date) >= cutoff);
}

export function getTodaysMoodEntry(): MoodEntry | undefined {
  const today = new Date().toISOString().split('T')[0];
  return getMoodEntries().find((e) => e.date === today);
}

// --- Journal Entries ---

export function getJournalEntries(): JournalEntry[] {
  return getItem<JournalEntry[]>(STORAGE_KEYS.JOURNAL_ENTRIES, []);
}

export function saveJournalEntry(entry: JournalEntry): void {
  const entries = getJournalEntries();
  const existingIndex = entries.findIndex((e) => e.id === entry.id);
  if (existingIndex >= 0) {
    entries[existingIndex] = entry;
  } else {
    entries.unshift(entry);
  }
  setItem(STORAGE_KEYS.JOURNAL_ENTRIES, entries);
}

export function deleteJournalEntry(id: string): void {
  const entries = getJournalEntries().filter((e) => e.id !== id);
  setItem(STORAGE_KEYS.JOURNAL_ENTRIES, entries);
}

// --- Focus Sessions ---

export function getFocusSessions(): FocusSession[] {
  return getItem<FocusSession[]>(STORAGE_KEYS.FOCUS_SESSIONS, []);
}

export function saveFocusSession(session: FocusSession): void {
  const sessions = getFocusSessions();
  const existingIndex = sessions.findIndex((s) => s.id === session.id);
  if (existingIndex >= 0) {
    sessions[existingIndex] = session;
  } else {
    sessions.unshift(session);
  }
  setItem(STORAGE_KEYS.FOCUS_SESSIONS, sessions);
}

export function getCompletedFocusSessions(): FocusSession[] {
  return getFocusSessions().filter((s) => s.completed);
}

export function getFocusStreak(): number {
  const sessions = getFocusSessions().filter((s) => s.completed);
  if (sessions.length === 0) return 0;

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - i);
    const dateStr = checkDate.toISOString().split('T')[0];
    const hasSession = sessions.some((s) => s.date === dateStr);
    if (hasSession) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }
  return streak;
}

// --- Chat History ---

export function getChatHistory(): ChatMessage[] {
  return getItem<ChatMessage[]>(STORAGE_KEYS.CHAT_HISTORY, []);
}

export function saveChatMessage(message: ChatMessage): void {
  const history = getChatHistory();
  history.push(message);
  // Keep last 100 messages
  if (history.length > 100) {
    history.splice(0, history.length - 100);
  }
  setItem(STORAGE_KEYS.CHAT_HISTORY, history);
}

export function clearChatHistory(): void {
  setItem(STORAGE_KEYS.CHAT_HISTORY, []);
}

// --- User Preferences ---

export function getPreferences(): UserPreferences {
  const defaults: UserPreferences = {
    selectedExam: null,
    customExamDate: null,
    theme: 'dark',
    name: '',
    focusStreak: 0,
    onboardingCompleted: false,
  };
  return getItem<UserPreferences>(STORAGE_KEYS.PREFERENCES, defaults);
}

export function savePreferences(prefs: Partial<UserPreferences>): void {
  const current = getPreferences();
  setItem(STORAGE_KEYS.PREFERENCES, { ...current, ...prefs });
}

// --- Utility ---

export function clearAllData(): void {
  Object.values(STORAGE_KEYS).forEach((key) => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(key);
    }
  });
}
