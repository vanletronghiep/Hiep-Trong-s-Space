import { existsSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { FEATURE_REGISTRY } from '@/features/registry';

describe('FEATURE_REGISTRY and route coverage', () => {
  it('defines the 13 canonical features in the exact documented order with unique routes', () => {
    expect(FEATURE_REGISTRY).toHaveLength(13);

    const titles = FEATURE_REGISTRY.map((f) => f.title);
    expect(titles).toEqual([
      'Daily Task Management',
      'Tasks Hub',
      'Events',
      'AI Engineering',
      'Blogs Hub',
      'APCS Hub',
      'Flashcards',
      'Entertainment Hub',
      'Tracking',
      'In Progress Projects',
      'Annual Milestones',
      'Learning Room',
      'Personal Achievements',
    ]);

    const hrefs = new Set(FEATURE_REGISTRY.map((f) => f.href));
    expect(hrefs.size).toBe(13);
  });

  it('has a corresponding App Router page.tsx under src/app/(workspace) for all 13 features', () => {
    for (const feature of FEATURE_REGISTRY) {
      const routeSegments = feature.href.replace(/^\//, '').split('/');
      const pagePath = path.resolve(
        process.cwd(),
        'src',
        'app',
        '(workspace)',
        ...routeSegments,
        'page.tsx',
      );
      expect(existsSync(pagePath), `Missing route file for ${feature.href}`).toBe(true);
    }
  });
});
