'use client';

/* ============================================
   Burnout Risk Indicator
   ============================================ */

import { motion } from 'framer-motion';
import { AnimatedCard } from '@/components/ui/animated-card';
import { AlertTriangle, Shield, AlertOctagon } from 'lucide-react';
import { RiskLevel } from '@/types';

interface BurnoutIndicatorProps {
  risk: { score: number; level: RiskLevel };
}

const RISK_CONFIG = {
  [RiskLevel.Low]: {
    icon: Shield,
    label: 'Low Risk',
    color: '#4ADE80',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/20',
    message: "You're doing great! Your wellness habits are well balanced.",
  },
  [RiskLevel.Moderate]: {
    icon: AlertTriangle,
    label: 'Moderate Risk',
    color: '#F59E0B',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/20',
    message: 'Some areas need attention. Consider taking a break soon.',
  },
  [RiskLevel.High]: {
    icon: AlertOctagon,
    label: 'High Risk',
    color: '#EF4444',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/20',
    message: 'Your wellbeing needs immediate attention. Please prioritize rest.',
  },
};

export function BurnoutIndicator({ risk }: BurnoutIndicatorProps) {
  const config = RISK_CONFIG[risk.level];
  const Icon = config.icon;

  return (
    <AnimatedCard className="h-full flex flex-col" delay={0.2}>
      <p className="text-xs uppercase tracking-wider text-muted mb-4 font-medium">
        Burnout Risk
      </p>

      <div className="flex-1 flex flex-col items-center justify-center">
        {/* Icon */}
        <motion.div
          className={`w-16 h-16 rounded-2xl ${config.bgColor} flex items-center justify-center mb-4`}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.4 }}
        >
          <Icon className="w-8 h-8" style={{ color: config.color }} />
        </motion.div>

        {/* Label */}
        <motion.p
          className="text-lg font-semibold mb-1"
          style={{ color: config.color }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {config.label}
        </motion.p>

        {/* Score bar */}
        <div className="w-full max-w-[200px] mb-4">
          <div className="h-2 bg-border rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: config.color }}
              initial={{ width: 0 }}
              animate={{ width: `${risk.score}%` }}
              transition={{ duration: 1, delay: 0.5 }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-muted">Safe</span>
            <span className="text-[10px] text-muted">Critical</span>
          </div>
        </div>

        {/* Message */}
        <p className="text-xs text-muted text-center leading-relaxed">
          {config.message}
        </p>
      </div>
    </AnimatedCard>
  );
}
