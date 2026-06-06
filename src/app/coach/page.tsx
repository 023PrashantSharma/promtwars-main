'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageTransition } from '@/components/ui/animated-card';
import { getAIProvider } from '@/services/ai/provider';
import { getChatHistory, saveChatMessage, clearChatHistory } from '@/services/storage';
import { generateId } from '@/lib/utils';
import type { ChatMessage } from '@/types';
import { Send, Loader2, Sparkles, Trash2, MessageCircle } from 'lucide-react';

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

  useEffect(() => { setMounted(true); setMessages(getChatHistory()); }, []);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

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
    } finally { setIsLoading(false); }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  };

  if (!mounted) return null;

  return (
    <PageTransition>
      <div className="flex flex-col" style={{ height: 'calc(100vh - 6rem)' }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--c-text)' }}>
              <Sparkles className="w-6 h-6" style={{ color: 'var(--c-primary)' }} /> AI Wellness Coach
            </h1>
            <p className="text-sm" style={{ color: 'var(--c-text-muted)' }}>Talk about anything on your mind.</p>
          </div>
          {messages.length > 0 && (
            <button onClick={() => { clearChatHistory(); setMessages([]); }} className="p-2 rounded-xl transition-all"
              style={{ color: 'var(--c-text-muted)' }} title="Clear chat">
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pb-4 pr-2">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'var(--c-primary-soft)' }}>
                <MessageCircle className="w-8 h-8" style={{ color: 'var(--c-primary)' }} />
              </div>
              <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--c-text)' }}>How are you feeling today?</h3>
              <p className="text-sm mb-8 max-w-sm" style={{ color: 'var(--c-text-muted)' }}>
                Share what&apos;s on your mind. I&apos;ll provide support and practical advice.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
                {PROMPTS.map(p => (
                  <motion.button key={p} onClick={() => sendMessage(p)}
                    className="text-left p-3 rounded-xl text-sm transition-all"
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--c-border)', color: 'var(--c-text-muted)' }}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    &ldquo;{p}&rdquo;
                  </motion.button>
                ))}
              </div>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {messages.map(msg => (
                <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] ${msg.role === 'user' ? 'mf-bubble-user' : 'mf-bubble-ai'}`}>
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="mf-bubble-ai flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" style={{ color: 'var(--c-primary)' }} />
                <span className="text-sm" style={{ color: 'var(--c-text-muted)' }}>Thinking...</span>
              </div>
            </motion.div>
          )}
          <div ref={endRef} />
        </div>

        <div className="pt-4" style={{ borderTop: '1px solid var(--c-border)' }}>
          <div className="flex items-end gap-3">
            <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown}
              placeholder="Type your message..." rows={1} className="mf-input resize-none" style={{ minHeight: 52, maxHeight: 128 }} />
            <button onClick={() => sendMessage(input)} disabled={!input.trim() || isLoading}
              className="mf-btn-primary p-3.5" style={{ opacity: input.trim() && !isLoading ? 1 : 0.4 }}>
              <Send className="w-5 h-5" />
            </button>
          </div>
          <p className="text-[10px] text-center mt-2" style={{ color: 'var(--c-text-muted)' }}>
            MindFlow provides supportive guidance, not medical advice.
          </p>
        </div>
      </div>
    </PageTransition>
  );
}
