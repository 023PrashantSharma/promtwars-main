/* ============================================
   Storage Service — localStorage Abstraction with DB Sync
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

// Helper to check if a user is logged in
function getUserId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('mindflow_user_id');
}

// --- Mood Entries ---

export function getMoodEntries(): MoodEntry[] {
  return getItem<MoodEntry[]>(STORAGE_KEYS.MOOD_ENTRIES, []);
}

export function saveMoodEntry(entry: MoodEntry): void {
  const entries = getMoodEntries();
  const existingIndex = entries.findIndex((e) => e.date === entry.date);
  if (existingIndex >= 0) {
    entries[existingIndex] = entry;
  } else {
    entries.unshift(entry);
  }
  setItem(STORAGE_KEYS.MOOD_ENTRIES, entries);

  // Sync to database
  const userId = getUserId();
  if (userId) {
    fetch(`/api/users/${userId}/mood`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
    }).catch((err) => console.error('Failed to sync mood entry to DB:', err));
  }
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

  // Sync to database
  const userId = getUserId();
  if (userId) {
    fetch(`/api/users/${userId}/journal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
    }).catch((err) => console.error('Failed to sync journal entry to DB:', err));
  }
}

export function deleteJournalEntry(id: string): void {
  const entries = getJournalEntries().filter((e) => e.id !== id);
  setItem(STORAGE_KEYS.JOURNAL_ENTRIES, entries);

  // Sync to database
  const userId = getUserId();
  if (userId) {
    fetch(`/api/users/${userId}/journal`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entryId: id }),
    }).catch((err) => console.error('Failed to delete journal entry from DB:', err));
  }
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

  // Sync to database
  const userId = getUserId();
  if (userId) {
    fetch(`/api/users/${userId}/focus`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(session),
    }).catch((err) => console.error('Failed to sync focus session to DB:', err));
  }
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
  if (history.length > 100) {
    history.splice(0, history.length - 100);
  }
  setItem(STORAGE_KEYS.CHAT_HISTORY, history);

  // Sync to database
  const userId = getUserId();
  if (userId) {
    fetch(`/api/users/${userId}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
    }).catch((err) => console.error('Failed to sync chat message to DB:', err));
  }
}

export function clearChatHistory(): void {
  setItem(STORAGE_KEYS.CHAT_HISTORY, []);

  // Sync to database
  const userId = getUserId();
  if (userId) {
    fetch(`/api/users/${userId}/chat`, {
      method: 'DELETE',
    }).catch((err) => console.error('Failed to clear chat history in DB:', err));
  }
}

// --- User Preferences ---

export function getPreferences(): UserPreferences {
  const defaults: UserPreferences = {
    selectedExam: null,
    customExamDate: null,
    theme: 'dark',
    name: '',
    email: null,
    focusStreak: 0,
    onboardingCompleted: false,
  };
  const prefs = getItem<UserPreferences>(STORAGE_KEYS.PREFERENCES, defaults);

  // Migration: if customExamDate is in the past, clear it
  if (prefs.customExamDate) {
    const d = new Date(prefs.customExamDate);
    if (d.getTime() < Date.now()) {
      prefs.customExamDate = null;
      setItem(STORAGE_KEYS.PREFERENCES, prefs);
    }
  }

  return prefs;
}

export function savePreferences(prefs: Partial<UserPreferences>): void {
  const current = getPreferences();
  const updated = { ...current, ...prefs };
  setItem(STORAGE_KEYS.PREFERENCES, updated);

  // Sync to database
  const userId = getUserId();
  if (userId) {
    fetch(`/api/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    }).catch((err) => console.error('Failed to sync preferences to DB:', err));
  }
}

// --- Server Synchronization ---

export async function syncUserData(): Promise<void> {
  const userId = getUserId();
  if (!userId) return;

  try {
    const res = await fetch(`/api/users/${userId}`);
    if (!res.ok) return;
    const user = await res.json();

    // Overwrite localStorage with server states
    if (user.moodEntries) setItem(STORAGE_KEYS.MOOD_ENTRIES, user.moodEntries);
    if (user.journalEntries) setItem(STORAGE_KEYS.JOURNAL_ENTRIES, user.journalEntries);
    if (user.focusSessions) setItem(STORAGE_KEYS.FOCUS_SESSIONS, user.focusSessions);
    if (user.chatHistory) setItem(STORAGE_KEYS.CHAT_HISTORY, user.chatHistory);

    const currentPrefs = getPreferences();
    setItem(STORAGE_KEYS.PREFERENCES, {
      ...currentPrefs,
      name: user.name || currentPrefs.name,
      email: user.email || currentPrefs.email,
      selectedExam: user.selectedExam !== undefined ? user.selectedExam : currentPrefs.selectedExam,
      customExamDate: user.customExamDate !== undefined ? user.customExamDate : currentPrefs.customExamDate,
      theme: user.theme || currentPrefs.theme,
      onboardingCompleted: true,
    });
  } catch (error) {
    console.error('Failed to sync user data from server:', error);
  }
}

// --- Utility ---

export function clearAllData(): void {
  Object.values(STORAGE_KEYS).forEach((key) => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(key);
    }
  });
}
