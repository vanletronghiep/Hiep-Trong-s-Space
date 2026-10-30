'use client';

import { useId, useRef, type KeyboardEvent } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { MOTION_DURATION, MOTION_EASE } from '@/design/motion';
import { cn } from './cn';

export interface SegmentedOption<TValue extends string> {
  value: TValue;
  label: string;
}

export interface SegmentedControlProps<TValue extends string> {
  options: readonly SegmentedOption<TValue>[];
  value: TValue;
  onChange: (value: TValue) => void;
  'aria-label': string;
  tone?: 'workspace' | 'cosmos';
  className?: string;
}

export function SegmentedControl<TValue extends string>({
  options,
  value,
  onChange,
  'aria-label': ariaLabel,
  tone = 'workspace',
  className,
}: SegmentedControlProps<TValue>) {
  const layoutGroupId = useId();
  const reducedMotion = useReducedMotion();
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (options.length === 0) {
      return;
    }
    let nextIndex = -1;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      nextIndex = (index + 1) % options.length;
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      nextIndex = (index - 1 + options.length) % options.length;
    } else if (event.key === 'Home') {
      nextIndex = 0;
    } else if (event.key === 'End') {
      nextIndex = options.length - 1;
    }

    if (nextIndex >= 0) {
      event.preventDefault();
      const targetOption = options[nextIndex];
      if (targetOption) {
        onChange(targetOption.value);
        buttonRefs.current[nextIndex]?.focus();
      }
    }
  };

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={cn(
        'inline-flex items-center p-1 rounded-pill border select-none',
        tone === 'workspace'
          ? 'bg-[color-mix(in_srgb,var(--ws-text)_4%,var(--ws-bg))] border-ws-border'
          : 'bg-[color-mix(in_srgb,var(--cosmos-text)_8%,transparent)] border-[color-mix(in_srgb,var(--cosmos-text)_16%,transparent)]',
        className,
      )}
    >
      {options.map((option, index) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            ref={(el) => {
              buttonRefs.current[index] = el;
            }}
            type="button"
            role="radio"
            aria-checked={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(option.value)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={cn(
              'relative z-10 inline-flex items-center justify-center min-h-[32px] px-3.5 rounded-pill text-[length:var(--fs-small)] font-medium whitespace-nowrap cursor-pointer',
              'transition-colors duration-[var(--dur-fast)] ease-[var(--ease)]',
              tone === 'workspace'
                ? isActive
                  ? 'text-ws-text'
                  : 'text-ws-text-muted hover:text-ws-text'
                : isActive
                  ? 'text-cosmos-text'
                  : 'text-cosmos-text-muted hover:text-cosmos-text',
            )}
          >
            {isActive ? (
              <motion.span
                layoutId={`segment-pill-${layoutGroupId}`}
                aria-hidden="true"
                transition={
                  reducedMotion
                    ? { duration: 0 }
                    : { duration: MOTION_DURATION.base, ease: MOTION_EASE }
                }
                className={cn(
                  'absolute inset-0 -z-10 rounded-pill',
                  tone === 'workspace'
                    ? 'bg-ws-surface shadow-task border border-ws-border'
                    : 'bg-[color-mix(in_srgb,var(--cosmos-text)_16%,transparent)] border border-[color-mix(in_srgb,var(--cosmos-text)_24%,transparent)]',
                )}
              />
            ) : null}
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
