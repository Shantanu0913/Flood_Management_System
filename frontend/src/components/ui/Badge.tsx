import React from 'react';
import { motion } from 'framer-motion';
import type { HTMLMotionProps } from 'framer-motion';
import clsx from 'clsx';
import './ui.css';

interface BadgeProps extends HTMLMotionProps<'span'> {
  variant?: 'primary' | 'danger' | 'warning' | 'success' | 'outline';
  glow?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'primary', glow = false, className, ...props }) => {
  return (
    <motion.span
      className={clsx('badge', `badge-${variant}`, glow && `glow-${variant}`, className)}
      {...props}
    >
      {children}
    </motion.span>
  );
};
