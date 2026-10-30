import { promises as fs } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

async function collectFiles(dir: string, extRegex: RegExp): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const results: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...(await collectFiles(fullPath, extRegex)));
    } else if (extRegex.test(entry.name)) {
      results.push(fullPath);
    }
  }
  return results;
}

describe('Craft, responsive, and architectural guardrails (Epic 8 §15 & ui_readme.md §6)', () => {
  it('enforces zero 100vw, zero transition-all, zero monospace, and sentence-case (uppercase only on Wordmark)', async () => {
    const srcRoot = path.resolve(process.cwd(), 'src');
    const wordmarkFile = path.resolve(srcRoot, 'features', 'home', 'Wordmark.tsx');
    const files = await collectFiles(srcRoot, /\.(ts|tsx|css)$/);

    const violations: string[] = [];

    for (const file of files) {
      const content = await fs.readFile(file, 'utf8');
      const rel = path.relative(process.cwd(), file);

      if (/\b100vw\b/.test(content)) {
        violations.push(`${rel}: forbidden 100vw width`);
      }
      if (/\btransition-all\b|transition\s*:\s*all\b/.test(content)) {
        violations.push(`${rel}: forbidden transition: all`);
      }
      if (/\bfont-mono\b|\bmonospace\b/.test(content)) {
        violations.push(`${rel}: forbidden monospace font`);
      }
      if (path.resolve(file) !== wordmarkFile && /\buppercase\b/.test(content)) {
        violations.push(`${rel}: forbidden uppercase class outside Wordmark.tsx`);
      }
    }

    expect(violations).toEqual([]);
  });

  it('restricts localStorage to preferences.ts, process.env to config.ts (and instrumentation.ts for NEXT_RUNTIME), and router/link wrappers to transitions/', async () => {
    const srcRoot = path.resolve(process.cwd(), 'src');
    const preferencesFile = path.resolve(srcRoot, 'client', 'preferences.ts');
    const configFile = path.resolve(srcRoot, 'server', 'config.ts');
    const instrumentationFile = path.resolve(srcRoot, 'instrumentation.ts');
    const transitionsDir = path.resolve(srcRoot, 'features', 'transitions');
    const files = await collectFiles(srcRoot, /\.(ts|tsx)$/);

    const violations: string[] = [];

    for (const file of files) {
      const resolved = path.resolve(file);
      const rel = path.relative(process.cwd(), file);
      const content = await fs.readFile(file, 'utf8');

      if (resolved !== preferencesFile && /\blocalStorage\b/.test(content)) {
        violations.push(`${rel}: localStorage accessed outside src/client/preferences.ts`);
      }
      if (resolved !== configFile && resolved !== instrumentationFile && /\bprocess\.env\b/.test(content)) {
        violations.push(`${rel}: process.env accessed outside src/server/config.ts`);
      }
      if (!resolved.startsWith(transitionsDir)) {
        if (/from\s+['"]next\/link['"]/.test(content)) {
          violations.push(`${rel}: imports next/link directly instead of TransitionLink`);
        }
        if (/\buseRouter\b/.test(content)) {
          violations.push(`${rel}: uses useRouter directly instead of useTransitionRouter`);
        }
      }
    }

    expect(violations).toEqual([]);
  });
});

