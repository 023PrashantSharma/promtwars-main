'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageTransition, AnimatedCard } from '@/components/ui/animated-card';
import { getJournalEntries, saveJournalEntry } from '@/services/storage';
import { getAIProvider } from '@/services/ai/provider';
import { generateId, formatDate } from '@/lib/utils';
import type { JournalEntry, AIReflection } from '@/types';
import { BookOpen, Plus, Loader2, Sparkles, ArrowLeft } from 'lucide-react';

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isWriting, setIsWriting] = useState(false);
  const [content, setContent] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [reflection, setReflection] = useState<AIReflection | null>(null);
  const [mounted, setMounted] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);

  useEffect(() => { setMounted(true); setEntries(getJournalEntries()); }, []);

  const handleSave = useCallback(async () => {
    if (!content.trim()) return;
    setIsAnalyzing(true);
    let aiReflection: AIReflection | undefined;
    try {
      const provider = getAIProvider();
      aiReflection = await provider.generateReflection(content);
      setReflection(aiReflection);
    } catch (error) { console.error('AI reflection failed:', error); }
    const entry: JournalEntry = {
      id: generateId(), date: new Date().toISOString().split('T')[0], content,
      aiReflection, emotionTags: aiReflection?.detectedEmotions || [],
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    };
    saveJournalEntry(entry);
    setEntries(getJournalEntries());
    setIsAnalyzing(false);
  }, [content]);

  if (!mounted) return null;

  if (selectedEntry) {
    return (
      <PageTransition>
        <div className="max-w-2xl mx-auto py-4">
          <button onClick={() => setSelectedEntry(null)} className="mf-btn-ghost mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to journal
          </button>
          <AnimatedCard hover={false}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs" style={{ color: 'var(--c-text-muted)' }}>{formatDate(selectedEntry.date)}</span>
              <div className="flex gap-1">
                {selectedEntry.emotionTags.map(tag => <span key={tag} className="mf-badge">{tag}</span>)}
              </div>
            </div>
            <p className="leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--c-text)' }}>{selectedEntry.content}</p>
            {selectedEntry.aiReflection && (
              <div className="mt-6 pt-6 space-y-4" style={{ borderTop: '1px solid var(--c-border)' }}>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" style={{ color: 'var(--c-primary)' }} />
                  <span className="mf-label mb-0">AI Reflection</span>
                </div>
                <div className="p-4 rounded-xl" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--c-border)' }}>
                  <p className="text-xs font-medium mb-1" style={{ color: 'var(--c-text-muted)' }}>Emotional Summary</p>
                  <p className="text-sm" style={{ color: 'var(--c-text)' }}>{selectedEntry.aiReflection.emotionalSummary}</p>
                </div>
                <div className="p-4 rounded-xl" style={{ background: 'var(--c-primary-softer)', border: '1px solid var(--c-border-active)' }}>
                  <p className="text-xs font-medium mb-1" style={{ color: 'var(--c-primary)' }}>💚 Encouragement</p>
                  <p className="text-sm" style={{ color: 'var(--c-text)' }}>{selectedEntry.aiReflection.encouragement}</p>
                </div>
                <div className="p-4 rounded-xl" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--c-border)' }}>
                  <p className="text-xs font-medium mb-1" style={{ color: 'var(--c-text-muted)' }}>🌱 Wellness Advice</p>
                  <p className="text-sm" style={{ color: 'var(--c-text)' }}>{selectedEntry.aiReflection.wellnessAdvice}</p>
                </div>
                <div className="p-4 rounded-xl" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--c-border)' }}>
                  <p className="text-xs font-medium mb-1" style={{ color: 'var(--c-text-muted)' }}>🎯 Next Step</p>
                  <p className="text-sm" style={{ color: 'var(--c-text)' }}>{selectedEntry.aiReflection.practicalNextStep}</p>
                </div>
              </div>
            )}
          </AnimatedCard>
        </div>
      </PageTransition>
    );
  }

  if (isWriting) {
    return (
      <PageTransition>
        <div className="max-w-2xl mx-auto py-4">
          <button onClick={() => { setIsWriting(false); setContent(''); setReflection(null); }} className="mf-btn-ghost mb-6">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--c-text)' }}>Write Your Thoughts</h1>
          <p className="text-sm mb-6" style={{ color: 'var(--c-text-muted)' }}>
            Express how you&apos;re feeling. AI will analyze and provide supportive insights.
          </p>
          <AnimatedCard hover={false}>
            <textarea value={content} onChange={e => setContent(e.target.value)}
              placeholder="I studied all day but still feel behind... / Today was actually productive..."
              className="mf-input resize-none min-h-[200px] border-none p-0 bg-transparent" autoFocus />
            <div className="flex items-center justify-between pt-4 mt-4" style={{ borderTop: '1px solid var(--c-border)' }}>
              <span className="text-xs" style={{ color: 'var(--c-text-muted)' }}>{content.length} characters</span>
              <button onClick={handleSave} disabled={!content.trim() || isAnalyzing}
                className="mf-btn-primary" style={{ opacity: content.trim() && !isAnalyzing ? 1 : 0.4 }}>
                {isAnalyzing ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</> : <><Sparkles className="w-4 h-4" /> Save & Reflect</>}
              </button>
            </div>
          </AnimatedCard>
          <AnimatePresence>
            {reflection && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
                <AnimatedCard hover={false} glow>
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-4 h-4" style={{ color: 'var(--c-primary)' }} />
                    <span className="mf-label mb-0">AI Reflection</span>
                  </div>
                  <div className="space-y-4">
                    <div><p className="text-xs font-medium mb-1" style={{ color: 'var(--c-text-muted)' }}>How you&apos;re feeling</p><p className="text-sm" style={{ color: 'var(--c-text)' }}>{reflection.emotionalSummary}</p></div>
                    <div className="p-4 rounded-xl" style={{ background: 'var(--c-primary-softer)', border: '1px solid var(--c-border-active)' }}>
                      <p className="text-xs font-medium mb-1" style={{ color: 'var(--c-primary)' }}>💚 Encouragement</p>
                      <p className="text-sm" style={{ color: 'var(--c-text)' }}>{reflection.encouragement}</p>
                    </div>
                    <div><p className="text-xs font-medium mb-1" style={{ color: 'var(--c-text-muted)' }}>🌱 Wellness Tip</p><p className="text-sm" style={{ color: 'var(--c-text)' }}>{reflection.wellnessAdvice}</p></div>
                    <div><p className="text-xs font-medium mb-1" style={{ color: 'var(--c-text-muted)' }}>🎯 Your Next Step</p><p className="text-sm" style={{ color: 'var(--c-text)' }}>{reflection.practicalNextStep}</p></div>
                    {reflection.detectedEmotions.length > 0 && (
                      <div className="flex gap-2 pt-3 flex-wrap" style={{ borderTop: '1px solid var(--c-border)' }}>
                        {reflection.detectedEmotions.map(e => <span key={e} className="mf-badge">{e}</span>)}
                      </div>
                    )}
                  </div>
                  <button onClick={() => { setIsWriting(false); setContent(''); setReflection(null); }}
                    className="mt-4 text-xs" style={{ color: 'var(--c-primary)' }}>Done — Back to journal →</button>
                </AnimatedCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="max-w-2xl mx-auto py-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--c-text)' }}>Journal</h1>
            <p className="text-sm" style={{ color: 'var(--c-text-muted)' }}>Reflect, write, grow.</p>
          </div>
          <button onClick={() => setIsWriting(true)} className="mf-btn-primary"><Plus className="w-4 h-4" /> New Entry</button>
        </div>

        {entries.length === 0 ? (
          <AnimatedCard className="text-center py-12" hover={false}>
            <BookOpen className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--c-text-muted)', opacity: 0.3 }} />
            <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--c-text)' }}>Your journal is empty</h3>
            <p className="text-sm mb-6" style={{ color: 'var(--c-text-muted)' }}>Start writing to receive AI-powered reflections.</p>
            <button onClick={() => setIsWriting(true)} className="mf-btn-primary">Write your first entry</button>
          </AnimatedCard>
        ) : (
          <div className="space-y-3">
            {entries.map((entry, i) => (
              <motion.div key={entry.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <AnimatedCard className="cursor-pointer" onClick={() => setSelectedEntry(entry)}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm line-clamp-2 leading-relaxed" style={{ color: 'var(--c-text)' }}>
                        {entry.content.slice(0, 150)}{entry.content.length > 150 ? '...' : ''}
                      </p>
                      <div className="flex items-center gap-3 mt-3">
                        <span className="text-[11px]" style={{ color: 'var(--c-text-muted)' }}>{formatDate(entry.date)}</span>
                        {entry.aiReflection && (
                          <span className="flex items-center gap-1 text-[11px]" style={{ color: 'var(--c-primary)' }}>
                            <Sparkles className="w-3 h-3" /> Reflected
                          </span>
                        )}
                      </div>
                    </div>
                    {entry.emotionTags.length > 0 && (
                      <div className="flex flex-col gap-1">
                        {entry.emotionTags.slice(0, 2).map(tag => <span key={tag} className="mf-badge">{tag}</span>)}
                      </div>
                    )}
                  </div>
                </AnimatedCard>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
