'use client';

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from './cn';

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  'aria-label': string;
  tone?: 'workspace' | 'cosmos';
  size?: 'sm' | 'md';
  children: ReactNode;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { tone = 'workspace', size = 'md', disabled, className, type = 'button', children, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled}
      aria-disabled={disabled || undefined}
      className={cn(
        'relative inline-flex items-center justify-center rounded-pill select-none cursor-pointer shrink-0',
        'transition-[background-color,border-color,color,opacity] duration-[var(--dur-fast)] ease-[var(--ease)]',
        size === 'md' ? 'h-11 w-11' : 'h-9 w-9',
        tone === 'workspace'
          ? 'text-ws-text hover:bg-ws-accent-soft'
          : 'text-[color-mix(in_srgb,var(--cosmos-text)_85%,transparent)] hover:text-cosmos-text hover:bg-[color-mix(in_srgb,var(--cosmos-text)_8%,transparent)]',
        disabled && 'opacity-45 pointer-events-none cursor-not-allowed',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
});
