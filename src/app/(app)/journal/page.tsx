'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageTransition, AnimatedCard } from '@/components/ui/animated-card';
import {
  PageContainer,
  PageHeader,
  DashboardCard,
  EmptyState,
  SectionHeader,
} from '@/components/ui/primitives';
import { getJournalEntries, saveJournalEntry } from '@/services/storage';
import { getAIProvider } from '@/services/ai/provider';
import { generateId, formatDate } from '@/lib/utils';
import type { JournalEntry, AIReflection } from '@/types';
import { BookOpen, Plus, Loader2, Sparkles, ArrowLeft, Search, Filter } from 'lucide-react';

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isWriting, setIsWriting] = useState(false);
  const [content, setContent] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [reflection, setReflection] = useState<AIReflection | null>(null);
  const [mounted, setMounted] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
      setEntries(getJournalEntries());
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleSave = useCallback(async () => {
    if (!content.trim()) return;
    setIsAnalyzing(true);
    let aiReflection: AIReflection | undefined;
    try {
      const provider = getAIProvider();
      aiReflection = await provider.generateReflection(content);
      setReflection(aiReflection);
    } catch (error) {
      console.error('AI reflection failed:', error);
    }
    const entry: JournalEntry = {
      id: generateId(),
      date: new Date().toISOString().split('T')[0],
      content,
      aiReflection,
      emotionTags: aiReflection?.detectedEmotions || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveJournalEntry(entry);
    setEntries(getJournalEntries());
    setIsAnalyzing(false);
  }, [content]);

  // Extract all unique tags for filters
  const allTags = useMemo(() => {
    const tagsSet = new Set<string>();
    entries.forEach(e => e.emotionTags.forEach(t => tagsSet.add(t)));
    return Array.from(tagsSet);
  }, [entries]);

  // Filter entries based on search and tag selection
  const filteredEntries = useMemo(() => {
    return entries.filter(e => {
      const matchesSearch = e.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTag = selectedTag ? e.emotionTags.includes(selectedTag) : true;
      return matchesSearch && matchesTag;
    });
  }, [entries, searchQuery, selectedTag]);

  if (!mounted) return null;

  // View Detailed Entry
  if (selectedEntry) {
    return (
      <PageTransition>
        <PageContainer className="max-w-3xl">
          <div className="flex items-center justify-between mb-2">
            <button onClick={() => setSelectedEntry(null)} className="mf-btn-ghost flex items-center gap-1.5 h-9 px-3 text-caption font-medium cursor-pointer">
              <ArrowLeft className="w-4 h-4" /> Back to list
            </button>
            <div className="flex gap-1.5">
              {selectedEntry.emotionTags.map(tag => (
                <span key={tag} className="text-[10px] bg-primary-soft text-primary px-2 py-0.5 rounded-full font-medium">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <PageHeader
            title={formatDate(selectedEntry.date)}
            description="Detailed reading view and AI wellness reflections."
          />

          <div className="grid grid-cols-1 gap-4">
            <DashboardCard>
              <p className="text-body text-text whitespace-pre-wrap leading-relaxed">{selectedEntry.content}</p>
            </DashboardCard>

            {selectedEntry.aiReflection && (
              <div className="flex flex-col gap-4 mt-2">
                <SectionHeader
                  title="AI Reflections & Insights"
                  description="Self-care recommendations derived from your notes."
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-surface border border-border rounded-lg p-4">
                    <span className="text-[10px] font-semibold text-muted uppercase tracking-wider block mb-1">
                      Summary
                    </span>
                    <p className="text-caption text-text leading-normal">
                      {selectedEntry.aiReflection.emotionalSummary}
                    </p>
                  </div>
                  
                  <div className="bg-primary-soft border border-border-active rounded-lg p-4">
                    <span className="text-[10px] font-semibold text-primary uppercase tracking-wider block mb-1">
                      Encouragement
                    </span>
                    <p className="text-caption text-text leading-normal">
                      {selectedEntry.aiReflection.encouragement}
                    </p>
                  </div>

                  <div className="bg-surface border border-border rounded-lg p-4">
                    <span className="text-[10px] font-semibold text-muted uppercase tracking-wider block mb-1">
                      Wellness Advice
                    </span>
                    <p className="text-caption text-text leading-normal">
                      {selectedEntry.aiReflection.wellnessAdvice}
                    </p>
                  </div>

                  <div className="bg-surface border border-border rounded-lg p-4">
                    <span className="text-[10px] font-semibold text-muted uppercase tracking-wider block mb-1">
                      Practical Next Step
                    </span>
                    <p className="text-caption text-text leading-normal">
                      {selectedEntry.aiReflection.practicalNextStep}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </PageContainer>
      </PageTransition>
    );
  }

  // Write New Entry Mode
  if (isWriting) {
    return (
      <PageTransition>
        <PageContainer className="max-w-2xl">
          <div className="mb-2">
            <button
              onClick={() => { setIsWriting(false); setContent(''); setReflection(null); }}
              className="mf-btn-ghost flex items-center gap-1.5 h-9 px-3 text-caption font-medium cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Cancel
            </button>
          </div>

          <PageHeader
            title="New Journal Entry"
            description="Write freely about your studies, stress, or goals. AI reflections will be generated automatically."
          />

          <DashboardCard>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Start typing your thoughts here... How did your study session go? What is on your mind?"
              className="w-full min-h-[220px] bg-transparent border-none outline-none resize-none text-body text-text placeholder-muted/50 leading-relaxed"
              autoFocus
            />
            <div className="flex items-center justify-between pt-4 border-t border-border mt-4 shrink-0">
              <span className="text-caption text-muted">{content.length} characters</span>
              <button
                onClick={handleSave}
                disabled={!content.trim() || isAnalyzing}
                className="mf-btn-primary flex items-center gap-1.5 cursor-pointer h-9"
                style={{ opacity: content.trim() && !isAnalyzing ? 1 : 0.4 }}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" /> Save & Reflect
                  </>
                )}
              </button>
            </div>
          </DashboardCard>

          <AnimatePresence>
            {reflection && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
                <DashboardCard className="border-border-active bg-primary-soft/5 flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="text-caption font-semibold uppercase tracking-wider text-primary">
                      AI Reflections Generated
                    </span>
                  </div>

                  <div className="flex flex-col gap-3">
                    <div>
                      <span className="text-[10px] font-semibold text-muted uppercase tracking-wider block">Summary</span>
                      <p className="text-caption text-text">{reflection.emotionalSummary}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-semibold text-muted uppercase tracking-wider block">Encouragement</span>
                      <p className="text-caption text-text">{reflection.encouragement}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-semibold text-muted uppercase tracking-wider block">Next Step</span>
                      <p className="text-caption text-text">{reflection.practicalNextStep}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => { setIsWriting(false); setContent(''); setReflection(null); }}
                    className="text-caption font-medium text-primary hover:underline cursor-pointer pt-2 block"
                  >
                    Done — Back to List →
                  </button>
                </DashboardCard>
              </motion.div>
            )}
          </AnimatePresence>
        </PageContainer>
      </PageTransition>
    );
  }

  // Standard List Mode
  return (
    <PageTransition>
      <PageContainer>
        <PageHeader
          title="Journal Portal"
          description="Log daily reflections to maintain clarity and track stress patterns during exam prep."
          actions={
            <button onClick={() => setIsWriting(true)} className="mf-btn-primary flex items-center gap-1.5 h-9">
              <Plus className="w-4 h-4" /> New Entry
            </button>
          }
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 items-start">
          {/* Left Side: Search, Filters & List (8 Columns) */}
          <div className="lg:col-span-8">
            <div className="flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row gap-2">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  type="text"
                  placeholder="Search entries..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="mf-input pl-9 h-9 text-caption"
                />
              </div>
              
              {/* Reset filter button */}
              {selectedTag && (
                <button
                  onClick={() => setSelectedTag(null)}
                  className="text-caption text-muted hover:text-text px-2 border border-border rounded-md cursor-pointer"
                >
                  Clear Filter
                </button>
              )}
            </div>

            {/* Emotion Filters */}
            {allTags.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-caption text-muted mr-1">Filter by emotion:</span>
                {allTags.map(tag => {
                  const isSelected = selectedTag === tag;
                  return (
                    <button
                      key={tag}
                      onClick={() => setSelectedTag(isSelected ? null : tag)}
                      className="text-[10px] font-medium px-2 py-0.5 rounded-full border transition-colors cursor-pointer"
                      style={{
                        background: isSelected ? 'var(--c-primary-soft)' : 'transparent',
                        borderColor: isSelected ? 'var(--c-primary)' : 'var(--c-border)',
                        color: isSelected ? 'var(--c-primary)' : 'var(--c-text-secondary)',
                      }}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Entry Items List */}
            {filteredEntries.length === 0 ? (
              <EmptyState
                icon={<BookOpen className="w-8 h-8" />}
                title={searchQuery || selectedTag ? "No matches found" : "Your journal is empty"}
                description={
                  searchQuery || selectedTag
                    ? "Try adjusting your keywords or filters to find other entries."
                    : "Writing down thoughts improves emotional processing. Start your first reflection card."
                }
                action={
                  !(searchQuery || selectedTag) ? (
                    <button onClick={() => setIsWriting(true)} className="mf-btn-primary h-9">
                      Write First Entry
                    </button>
                  ) : undefined
                }
              />
            ) : (
              <div className="flex flex-col gap-2">
                {filteredEntries.map((entry) => (
                  <DashboardCard
                    key={entry.id}
                    onClick={() => setSelectedEntry(entry)}
                    hoverable
                    className="p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-body text-text line-clamp-2 leading-relaxed">
                          {entry.content}
                        </p>
                        <div className="flex items-center gap-3 mt-3">
                          <span className="text-[11px] text-muted">{formatDate(entry.date)}</span>
                          {entry.aiReflection && (
                            <span className="flex items-center gap-1 text-[11px] text-primary font-medium">
                              <Sparkles className="w-3.5 h-3.5" /> AI Reflection Analysis
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {entry.emotionTags.length > 0 && (
                        <div className="flex flex-col gap-1 shrink-0 items-end">
                          {entry.emotionTags.slice(0, 2).map(tag => (
                            <span key={tag} className="text-[9px] font-medium bg-primary-soft text-primary px-1.5 py-0.5 rounded-full">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </DashboardCard>
                ))}
              </div>
            )}
          </div>
        </div>

          {/* Right Side: AI Insight / Helper Portal (4 Columns) */}
          <div className="lg:col-span-4">
            <div className="flex flex-col gap-3">
              <DashboardCard className="flex flex-col gap-4 bg-surface">
              <span className="text-caption font-semibold text-muted uppercase tracking-wider block">
                How AI reflections work
              </span>
              <p className="text-caption text-text-secondary leading-relaxed">
                When you save a new journal card, MindFlow uses AI to run emotional pattern matching. It will isolate stress factors and provide practical recommendations directly attached to your entry.
              </p>
              <div className="border-t border-border pt-3">
                <span className="text-[11px] font-semibold text-text block mb-1">
                  Guided Prompts
                </span>
                <ul className="flex flex-col gap-1 text-caption text-muted list-disc list-inside">
                  <li>What went well in study today?</li>
                  <li>What stress feels blocker?</li>
                  <li>How do you plan to reset tonight?</li>
                </ul>
              </div>
              </DashboardCard>
            </div>
          </div>
        </div>
      </PageContainer>
    </PageTransition>
  );
}
