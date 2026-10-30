'use client';

import { forwardRef, type AnchorHTMLAttributes, type MouseEvent } from 'react';
import Link from 'next/link';
import { useTransitionRouter } from './TransitionProvider';

export interface TransitionLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  href: string;
  prefetch?: boolean;
}

function isModifiedEvent(event: MouseEvent<HTMLAnchorElement>): boolean {
  return event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;
}

export const TransitionLink = forwardRef<HTMLAnchorElement, TransitionLinkProps>(
  function TransitionLink({ href, onClick, target, prefetch, children, ...props }, ref) {
    const transitionRouter = useTransitionRouter();

    const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
      onClick?.(event);
      if (event.defaultPrevented) {
        return;
      }
      if (target && target !== '_self') {
        return;
      }
      if (isModifiedEvent(event)) {
        return;
      }
      if (!href.startsWith('/')) {
        return;
      }

      event.preventDefault();
      transitionRouter.push(href);
    };

    return (
      <Link
        ref={ref}
        href={href}
        target={target}
        prefetch={prefetch}
        onClick={handleClick}
        {...props}
      >
        {children}
      </Link>
    );
  },
);
