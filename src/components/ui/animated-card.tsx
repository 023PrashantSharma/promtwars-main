'use client';

import { motion, type Variants } from 'framer-motion';
import { type ReactNode, type CSSProperties } from 'react';

/* ============================================
   AnimatedCard — Base card with motion
   ============================================ */

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  hover?: boolean;
  glow?: boolean;
  onClick?: () => void;
  style?: CSSProperties;
}

export function AnimatedCard({
  children,
  className = '',
  delay = 0,
  hover = true,
  glow = false,
  onClick,
  style,
}: AnimatedCardProps) {
  return (
    <motion.div
      className={`mf-card ${hover ? 'mf-card-interactive' : ''} ${className}`}
      style={{
        ...style,
        ...(glow ? { boxShadow: 'var(--shadow-card), var(--shadow-glow)' } : {}),
      }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={
        hover
          ? { y: -3, transition: { duration: 0.2 } }
          : undefined
      }
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}

/* ============================================
   PageTransition — Wraps entire page views
   ============================================ */

interface PageTransitionProps {
  children: ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* ============================================
   StaggerContainer — Stagger children
   ============================================ */

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { ease: [0.22, 1, 0.36, 1] } },
};

interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
}

export function StaggerContainer({ children, className = '' }: StaggerContainerProps) {
  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className = '' }: StaggerContainerProps) {
  return (
    <motion.div className={className} variants={itemVariants}>
      {children}
    </motion.div>
  );
}
