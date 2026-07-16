import React from 'react';
import { clsx } from 'clsx';

interface TextProps { children: React.ReactNode; className?: string; }

export const PageTitle: React.FC<TextProps> = ({ children, className }) => (
  <h1 className={clsx('font-serif text-2xl font-semibold text-ink-primary tracking-tight', className)}>
    {children}
  </h1>
);

export const SectionTitle: React.FC<TextProps> = ({ children, className }) => (
  <h2 className={clsx('font-serif text-lg font-semibold text-ink-primary', className)}>
    {children}
  </h2>
);

export const Lead: React.FC<TextProps> = ({ children, className }) => (
  <p className={clsx('text-base text-ink-secondary leading-relaxed', className)}>
    {children}
  </p>
);

export const Caption: React.FC<TextProps> = ({ children, className }) => (
  <p className={clsx('text-xs text-ink-muted', className)}>
    {children}
  </p>
);

export const GoldText: React.FC<TextProps> = ({ children, className }) => (
  <span className={clsx('text-gold-600 font-medium', className)}>{children}</span>
);
