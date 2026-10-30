export interface ParsedInternalHref {
  pathname: string;
  search: string;
  hash: string;
}

export function normalizePathname(pathname: string): string {
  const trimmed = pathname.trim();
  if (!trimmed || trimmed === '/') {
    return '/';
  }
  return trimmed.endsWith('/') ? trimmed.slice(0, -1) : trimmed;
}

export function parseInternalHref(href: string): ParsedInternalHref | null {
  const trimmed = href.trim();
  if (!trimmed.startsWith('/') || trimmed.startsWith('//')) {
    return null;
  }

  try {
    const parsed = new URL(trimmed, 'http://hts.local');
    return {
      pathname: normalizePathname(parsed.pathname),
      search: parsed.search,
      hash: parsed.hash,
    };
  } catch {
    return null;
  }
}

/**
 * Determines whether an internal navigation should play Cosmic Launch (§9.10 & ui_readme.md §12).
 * Plays ONLY when:
 * - No transition is already running
 * - `href` is an internal root-relative URL (`/…`)
 * - The destination `pathname` differs from `currentPathname` (never for hash or query-only changes)
 */
export function shouldTriggerCosmicLaunch(options: {
  href: string;
  currentPathname: string;
  isTransitioning: boolean;
}): boolean {
  if (options.isTransitioning) {
    return false;
  }
  const parsed = parseInternalHref(options.href);
  if (!parsed) {
    return false;
  }
  return parsed.pathname !== normalizePathname(options.currentPathname);
}
