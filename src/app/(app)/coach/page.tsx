'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageTransition } from '@/components/ui/animated-card';
import {
  PageContainer,
  PageHeader,
  DashboardCard,
} from '@/components/ui/primitives';
import { getAIProvider } from '@/services/ai/provider';
import { getChatHistory, saveChatMessage, clearChatHistory } from '@/services/storage';
import { generateId } from '@/lib/utils';
import type { ChatMessage } from '@/types';
import { Send, Loader2, Sparkles, Trash2, MessageCircle, ArrowRight } from 'lucide-react';

const PROMPTS = [
  "I'm feeling anxious about my upcoming exam.",
  'I scored poorly on my mock test today.',
  "I'm losing motivation to study.",
  "I can't sleep because of exam stress.",
  "I feel like everyone is ahead of me.",
  'I need help managing my study schedule.',
];

export default function CoachPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
      setMessages(getChatHistory());
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg: ChatMessage = { id: generateId(), role: 'user', content: text.trim(), timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    saveChatMessage(userMsg);
    setInput('');
    setIsLoading(true);
    try {
      const provider = getAIProvider();
      const response = await provider.chat(messages, text.trim());
      const aiMsg: ChatMessage = { id: generateId(), role: 'assistant', content: response, timestamp: new Date().toISOString() };
      setMessages(prev => [...prev, aiMsg]);
      saveChatMessage(aiMsg);
    } catch {
      const errMsg: ChatMessage = { id: generateId(), role: 'assistant', content: "I'm having trouble connecting. You're doing great — I'll be back.", timestamp: new Date().toISOString() };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  if (!mounted) return null;

  const userInitial = typeof window !== 'undefined'
    ? (localStorage.getItem('mindflow_user_name') || 'U').charAt(0).toUpperCase()
    : 'U';

  return (
    <PageTransition>
      <PageContainer className="max-w-4xl">
        <PageHeader
          title="AI Wellness Coach"
          description="Talk about study pressure, anxiety, or routine structures. AI guidance is supportive, not medical."
          actions={
            messages.length > 0 && (
              <button
                onClick={() => { clearChatHistory(); setMessages([]); }}
                className="mf-btn-ghost flex items-center gap-1.5 h-9 px-3 text-caption cursor-pointer"
                title="Clear chat history"
              >
                <Trash2 className="w-4 h-4" /> Clear Chat
              </button>
            )
          }
        />

        <div className="flex flex-col border border-border rounded-lg bg-surface h-[calc(100vh-240px)] min-h-[440px]">
          {/* Messages Viewport */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-4 py-8 max-w-lg mx-auto">
                <div className="w-12 h-12 rounded-lg bg-primary-soft text-primary flex items-center justify-center mb-3">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-title font-semibold mb-2">Need a study break or motivation?</h3>
                <p className="text-body text-muted mb-6">
                  Select a preset topic below or start typing to ask about burnout strategies or schedule pacing.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full">
                  {PROMPTS.map(p => (
                    <button
                      key={p}
                      onClick={() => sendMessage(p)}
                      className="text-left p-3 rounded-lg text-caption border border-border bg-surface hover:bg-card-hover hover:border-border-hover transition-all duration-150 cursor-pointer text-text-secondary flex items-center justify-between group"
                    >
                      <span className="truncate">{p}</span>
                      <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2" />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <AnimatePresence initial={false}>
                  {messages.map(msg => (
                    <div
                      key={msg.id}
                      className={`flex gap-3 items-start ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {/* Avatar for AI */}
                      {msg.role !== 'user' && (
                        <div className="w-7 h-7 rounded-md bg-primary-soft text-primary flex items-center justify-center shrink-0 border border-border-active">
                          <Sparkles className="w-3.5 h-3.5" />
                        </div>
                      )}

                      <div className={`max-w-[75%] ${msg.role === 'user' ? 'mf-bubble-user' : 'mf-bubble-ai'}`}>
                        <p className="text-body leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      </div>

                      {/* Avatar for User */}
                      {msg.role === 'user' && (
                        <div className="w-7 h-7 rounded-full bg-border text-text flex items-center justify-center shrink-0 text-caption font-semibold">
                          {userInitial}
                        </div>
                      )}
                    </div>
                  ))}
                </AnimatePresence>

                {isLoading && (
                  <div className="flex gap-3 items-start justify-start">
                    <div className="w-7 h-7 rounded-md bg-primary-soft text-primary flex items-center justify-center shrink-0 border border-border-active">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <div className="mf-bubble-ai flex items-center gap-2">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                      <span className="text-caption text-muted">Analyzing context...</span>
                    </div>
                  </div>
                )}
                <div ref={endRef} />
              </div>
            )}
          </div>

          {/* Message Input Footer (Raycast-like command design) */}
          <div className="p-3 border-t border-border bg-sidebar rounded-b-lg">
            <div className="flex items-end gap-2 bg-surface border border-border rounded-md px-3 py-1.5 focus-within:border-primary transition-colors">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask your AI coach about managing exam pressure..."
                rows={1}
                className="flex-1 bg-transparent border-none outline-none resize-none text-body text-text placeholder-muted/50 py-1.5 h-9 min-h-[36px] max-h-[120px]"
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isLoading}
                className="p-1.5 bg-primary text-white rounded-md shrink-0 flex items-center justify-center hover:bg-primary-hover disabled:opacity-40 transition-all cursor-pointer h-8 w-8"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[10px] text-center text-muted mt-2">
              Conversations are saved locally. AI reflects and guides, but is not a substitute for clinical advice.
            </p>
          </div>
        </div>
      </PageContainer>
    </PageTransition>
  );
}
