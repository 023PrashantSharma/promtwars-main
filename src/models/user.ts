/* ============================================
   User Model — MongoDB Schema
   ============================================ */

import mongoose, { Schema, type Document, type Model } from 'mongoose';

// Sub-schemas for embedded data
const MoodEntrySchema = new Schema({
  id: { type: String, required: true },
  date: { type: String, required: true },
  mood: { type: Number, required: true },
  energy: { type: Number, required: true },
  confidence: { type: Number, default: 5 },
  stress: { type: Number, default: 5 },
  sleepHours: { type: Number, default: 7 },
  studyHours: { type: Number, default: 0 },
  notes: { type: String, default: '' },
  createdAt: { type: String, required: true },
}, { _id: false });

const JournalEntrySchema = new Schema({
  id: { type: String, required: true },
  date: { type: String, required: true },
  content: { type: String, required: true },
  audioUrl: { type: String },
  transcription: { type: String },
  aiReflection: { type: Schema.Types.Mixed },
  emotionTags: [{ type: String }],
  createdAt: { type: String, required: true },
  updatedAt: { type: String, required: true },
}, { _id: false });

const FocusSessionSchema = new Schema({
  id: { type: String, required: true },
  mode: { type: Number, required: true },
  startedAt: { type: String, required: true },
  completedAt: { type: String },
  completed: { type: Boolean, default: false },
  date: { type: String, required: true },
}, { _id: false });

const ChatMessageSchema = new Schema({
  id: { type: String, required: true },
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
  timestamp: { type: String, required: true },
}, { _id: false });

// Main User Schema
export interface IUser extends Document {
  name: string;
  email?: string | null;
  selectedExam: string | null;
  customExamDate: string | null;
  theme: string;
  moodEntries: typeof MoodEntrySchema[];
  journalEntries: typeof JournalEntrySchema[];
  focusSessions: typeof FocusSessionSchema[];
  chatHistory: typeof ChatMessageSchema[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, trim: true, default: null },
  selectedExam: { type: String, default: null },
  customExamDate: { type: String, default: null },
  theme: { type: String, default: 'dark' },
  moodEntries: { type: [MoodEntrySchema], default: [] },
  journalEntries: { type: [JournalEntrySchema], default: [] },
  focusSessions: { type: [FocusSessionSchema], default: [] },
  chatHistory: { type: [ChatMessageSchema], default: [] },
}, {
  timestamps: true,
  collection: 'users',
});

// Prevent model recompilation in dev (Next.js hot reload)
const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
