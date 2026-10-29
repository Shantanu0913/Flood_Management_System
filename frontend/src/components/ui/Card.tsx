import React from 'react';
import { motion } from 'framer-motion';
import type { HTMLMotionProps } from 'framer-motion';
import clsx from 'clsx';
import './ui.css';

interface CardProps extends HTMLMotionProps<'div'> {
  glow?: boolean;
  intensity?: 'low' | 'medium' | 'high';
}

export const Card: React.FC<CardProps> = ({ children, glow = false, intensity = 'low', className, ...props }) => {
  return (
    <motion.div
      className={clsx('glass-panel glass-card', glow && `glass-glow-${intensity}`, className)}
      {...props}
    >
      {children}
    </motion.div>
  );
};
