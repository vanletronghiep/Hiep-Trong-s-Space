import type { SVGProps } from 'react';
import { cn } from './cn';

export interface StarIconProps extends SVGProps<SVGSVGElement> {
  size?: number;
}

export function StarIcon({ size = 14, className, ...props }: StarIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      aria-hidden="true"
      className={cn('shrink-0', className)}
      {...props}
    >
      <path
        fill="currentColor"
        d="M12 0C12.8 7.2 16.8 11.2 24 12C16.8 12.8 12.8 16.8 12 24C11.2 16.8 7.2 12.8 0 12C7.2 11.2 11.2 7.2 12 0Z"
      />
    </svg>
  );
}
