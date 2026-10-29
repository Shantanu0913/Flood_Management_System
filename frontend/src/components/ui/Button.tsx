import React from 'react';
import { motion } from 'framer-motion';
import type { HTMLMotionProps } from 'framer-motion';
import clsx from 'clsx';
import './ui.css'; // Add local CSS for UI components

interface ButtonProps extends HTMLMotionProps<'button'> {
  variant?: 'primary' | 'danger' | 'warning' | 'success' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  glow?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  glow = false,
  className,
  ...props
}) => {
  const baseClasses = 'btn-base';
  const variantClasses = {
    primary: 'btn-primary',
    danger: 'btn-danger',
    warning: 'btn-warning',
    success: 'btn-success',
    outline: 'btn-outline',
    ghost: 'btn-ghost',
  };
  const sizeClasses = {
    sm: 'btn-sm',
    md: 'btn-md',
    lg: 'btn-lg',
  };

  const isGlow = glow ? `glow-${variant === 'outline' || variant === 'ghost' ? 'primary' : variant}` : '';

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={clsx(baseClasses, variantClasses[variant], sizeClasses[size], isGlow, className)}
      {...props}
    >
      {children}
    </motion.button>
  );
};
