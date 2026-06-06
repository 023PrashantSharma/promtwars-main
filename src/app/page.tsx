'use client';

/* ============================================
   Welcome / Onboarding Page
   Premium fullscreen entry with name input
   ============================================ */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkles, Brain, Heart, BookOpen, Timer, MessageCircle } from 'lucide-react';

const FEATURES = [
  { icon: Heart, label: 'Daily Check-ins', color: '#EF4444' },
  { icon: BookOpen, label: 'Smart Journal', color: '#8B5CF6' },
  { icon: Brain, label: 'Burnout Prediction', color: '#F59E0B' },
  { icon: MessageCircle, label: 'AI Coach', color: '#4ADE80' },
  { icon: Timer, label: 'Focus Sessions', color: '#818CF8' },
];

export default function WelcomePage() {
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [checkingAuth, setCheckingAuth] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const userId = localStorage.getItem('mindflow_user_id');
    if (userId) {
      router.replace('/dashboard');
    } else {
      setCheckingAuth(false);
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      });

      if (!res.ok) throw new Error('Failed to create user');

      const data = await res.json();
      localStorage.setItem('mindflow_user_id', data.userId);
      localStorage.setItem('mindflow_user_name', data.name);
      router.push('/dashboard');
    } catch {
      setError('Something went wrong. Please try again.');
      setIsLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
          <Sparkles style={{ width: 32, height: 32, color: 'var(--c-primary)' }} />
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px',
      background: 'var(--bg)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Ambient glow */}
      <div style={{
        position: 'absolute',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 800, height: 800,
        background: 'radial-gradient(ellipse, rgba(74,222,128,0.06) 0%, transparent 55%)',
        pointerEvents: 'none',
      }} />

      {/* Floating dots */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            width: 4 + i * 2,
            height: 4 + i * 2,
            borderRadius: '50%',
            background: 'var(--c-primary)',
            opacity: 0.12,
            left: `${20 + i * 15}%`,
            top: `${25 + i * 10}%`,
          }}
          animate={{ y: [0, -20, 0], opacity: [0.08, 0.2, 0.08] }}
          transition={{ duration: 4 + i, repeat: Infinity, delay: i * 0.5 }}
        />
      ))}

      <motion.div
        style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: 440, textAlign: 'center' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Logo */}
        <motion.div
          style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div style={{
            width: 64, height: 64, borderRadius: 16, overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          }}>
            <Image src="/promwars.jpg" alt="MindFlow" width={64} height={64} style={{ objectFit: 'cover' }} priority />
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          style={{ fontSize: 36, fontWeight: 800, color: 'var(--c-text)', marginBottom: 12, lineHeight: 1.2 }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Welcome to <span className="text-gradient">MindFlow</span>
        </motion.h1>

        <motion.p
          style={{ fontSize: 14, color: 'var(--c-text-muted)', marginBottom: 32, lineHeight: 1.7 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Your AI wellness companion for exam preparation.<br />
          Stay balanced, focused, and motivated.
        </motion.p>

        {/* Feature badges */}
        <motion.div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: 8,
            marginBottom: 40,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.label}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 14px',
                  borderRadius: 100,
                  fontSize: 12,
                  fontWeight: 600,
                  background: `${f.color}12`,
                  color: f.color,
                  border: `1px solid ${f.color}20`,
                  whiteSpace: 'nowrap',
                }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + i * 0.06 }}
              >
                <Icon style={{ width: 14, height: 14 }} />
                {f.label}
              </motion.div>
            );
          })}
        </motion.div>

        {/* Name input card */}
        <motion.div
          style={{
            padding: '32px 28px',
            borderRadius: 16,
            background: 'var(--bg-card)',
            border: '1px solid var(--c-border)',
          }}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--c-text)', marginBottom: 20 }}>
            What should we call you?
          </p>

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name..."
              autoFocus
              maxLength={50}
              style={{
                width: '100%',
                padding: '14px 16px',
                fontSize: 15,
                fontWeight: 500,
                fontFamily: 'inherit',
                textAlign: 'center',
                background: 'var(--bg-input)',
                border: '1px solid var(--c-border)',
                borderRadius: 12,
                color: 'var(--c-text)',
                outline: 'none',
                transition: 'border-color 0.2s, box-shadow 0.2s',
                marginBottom: 16,
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--c-primary)';
                e.target.style.boxShadow = '0 0 0 3px rgba(74,222,128,0.12)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--c-border)';
                e.target.style.boxShadow = 'none';
              }}
            />

            <AnimatePresence>
              {error && (
                <motion.p
                  style={{ fontSize: 12, color: '#EF4444', marginBottom: 12 }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <motion.button
              type="submit"
              disabled={!name.trim() || isLoading}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '14px 20px',
                fontSize: 14,
                fontWeight: 600,
                fontFamily: 'inherit',
                background: name.trim() ? 'var(--c-primary)' : 'var(--c-border)',
                color: name.trim() ? '#0B0B0F' : 'var(--c-text-muted)',
                border: 'none',
                borderRadius: 12,
                cursor: name.trim() ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s ease',
              }}
              whileHover={name.trim() ? { scale: 1.02 } : undefined}
              whileTap={name.trim() ? { scale: 0.98 } : undefined}
            >
              {isLoading ? (
                <motion.div
                  style={{
                    width: 20, height: 20,
                    border: '2px solid transparent',
                    borderTopColor: '#0B0B0F',
                    borderRadius: '50%',
                  }}
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                />
              ) : (
                <>Get Started <ArrowRight style={{ width: 16, height: 16 }} /></>
              )}
            </motion.button>
          </form>
        </motion.div>

        {/* Footer */}
        <motion.p
          style={{ fontSize: 11, color: 'var(--c-text-muted)', opacity: 0.5, marginTop: 24 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 0.8 }}
        >
          Built with ❤️ for PromptWars · MindFlow v1.0
        </motion.p>
      </motion.div>
    </div>
  );
}
