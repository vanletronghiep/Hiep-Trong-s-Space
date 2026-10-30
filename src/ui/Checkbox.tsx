'use client';

import type { MouseEvent } from 'react';
import { cn } from './cn';

export interface CheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  'aria-label': string;
  disabled?: boolean;
  size?: 'sm' | 'md';
  stopPropagation?: boolean;
  className?: string;
}

export function Checkbox({
  checked,
  onCheckedChange,
  'aria-label': ariaLabel,
  disabled = false,
  size = 'md',
  stopPropagation = true,
  className,
}: CheckboxProps) {
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (stopPropagation) {
      event.stopPropagation();
    }
    if (!disabled) {
      onCheckedChange(!checked);
    }
  };

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={handleClick}
      className={cn(
        'group relative inline-flex items-center justify-center rounded-sm cursor-pointer select-none shrink-0',
        size === 'md' ? 'h-7 w-7 -m-1' : 'h-6 w-6 -m-1',
        disabled && 'opacity-45 pointer-events-none cursor-not-allowed',
        className,
      )}
    >
      <span
        className={cn(
          'inline-flex items-center justify-center rounded-[6px] border-[1.5px] transition-[background-color,border-color,box-shadow] duration-[var(--dur-fast)] ease-[var(--ease)]',
          size === 'md' ? 'h-5 w-5' : 'h-4 w-4',
          checked
            ? 'bg-fill-checkbox-checked border-fill-checkbox-checked text-ws-surface'
            : 'bg-ws-surface border-ws-text-muted group-hover:shadow-[0_0_0_3px_var(--ws-accent-soft)]',
        )}
      >
        <svg
          viewBox="0 0 16 16"
          width={size === 'md' ? 12 : 10}
          height={size === 'md' ? 12 : 10}
          aria-hidden="true"
          className="overflow-visible"
        >
          <path
            d="M3.5 8.5L6.5 11.5L12.5 4.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              strokeDasharray: 16,
              strokeDashoffset: checked ? 0 : 16,
              transition: 'stroke-dashoffset 200ms var(--ease)',
            }}
          />
        </svg>
      </span>
    </button>
  );
}
