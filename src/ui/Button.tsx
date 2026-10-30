'use client';

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from './cn';

export type ButtonVariant =
  'primary' | 'secondary' | 'ghost' | 'destructive' | 'destructive-solid' | 'cosmos-ghost';

export type ButtonSize = 'sm' | 'md';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  pill?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-ws-text text-ws-surface border border-transparent hover:opacity-90 active:opacity-95',
  secondary:
    'bg-ws-accent-soft text-ws-text border border-ws-border hover:bg-[color-mix(in_srgb,var(--ws-accent)_35%,var(--ws-surface))]',
  ghost: 'bg-transparent text-ws-text border border-transparent hover:bg-ws-accent-soft',
  destructive:
    'bg-transparent text-text-overdue border border-tint-overdue-border hover:bg-tint-overdue-bg',
  'destructive-solid':
    'bg-status-overdue text-ws-text border border-tint-overdue-border hover:opacity-90',
  'cosmos-ghost':
    'bg-transparent text-cosmos-text border border-[color-mix(in_srgb,var(--cosmos-text)_22%,transparent)] hover:border-[color-mix(in_srgb,var(--cosmos-text)_45%,transparent)] hover:bg-[color-mix(in_srgb,var(--cosmos-text)_8%,transparent)]',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'min-h-[36px] px-3 text-[length:var(--fs-small)] gap-1.5',
  md: 'min-h-[40px] px-4 text-[length:var(--fs-ui)] gap-2',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'secondary',
    size = 'md',
    pill = false,
    leftIcon,
    rightIcon,
    disabled,
    className,
    type = 'button',
    children,
    ...props
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled}
      aria-disabled={disabled || undefined}
      className={cn(
        'inline-flex items-center justify-center font-medium whitespace-nowrap select-none cursor-pointer',
        'transition-[background-color,border-color,color,opacity] duration-[var(--dur-fast)] ease-[var(--ease)]',
        pill ? 'rounded-pill' : 'rounded-item',
        variantClasses[variant],
        sizeClasses[size],
        disabled && 'opacity-45 pointer-events-none cursor-not-allowed',
        className,
      )}
      {...props}
    >
      {leftIcon ? <span className="inline-flex shrink-0">{leftIcon}</span> : null}
      <span>{children}</span>
      {rightIcon ? <span className="inline-flex shrink-0">{rightIcon}</span> : null}
    </button>
  );
});
