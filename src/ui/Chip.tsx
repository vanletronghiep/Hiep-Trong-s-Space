'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from './cn';

export interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  children: ReactNode;
}

export function Chip({
  active = false,
  className,
  type = 'button',
  children,
  ...props
}: ChipProps) {
  return (
    <button
      type={type}
      aria-pressed={active}
      className={cn(
        'inline-flex items-center justify-center h-7 px-3 rounded-pill text-[length:var(--fs-micro)] font-medium whitespace-nowrap cursor-pointer select-none',
        'transition-[background-color,border-color,color] duration-[var(--dur-fast)] ease-[var(--ease)]',
        active
          ? 'bg-ws-text text-ws-surface border border-ws-text'
          : 'bg-ws-surface text-ws-text-muted border border-ws-border hover:bg-ws-accent-soft hover:text-ws-text',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
