import { promises as fs } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

async function collectSourceFiles(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const results: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...(await collectSourceFiles(fullPath)));
    } else if (/\.(ts|tsx|css)$/.test(entry.name)) {
      results.push(fullPath);
    }
  }
  return results;
}

describe('Design token closed-palette guardrail', () => {
  it('forbids raw hex, rgb(), or hsl() colour literals outside src/design/tokens.css', async () => {
    const srcRoot = path.resolve(process.cwd(), 'src');
    const tokensFile = path.resolve(srcRoot, 'design', 'tokens.css');
    const files = await collectSourceFiles(srcRoot);

    const violations: string[] = [];
    const hexColorRegex = /#[0-9a-fA-F]{3,8}\b/g;
    const functionalColorRegex = /\b(?:rgb|rgba|hsl|hsla)\s*\(/g;

    for (const file of files) {
      if (path.resolve(file) === tokensFile) {
        continue;
      }
      const content = await fs.readFile(file, 'utf8');
      const hexMatches = content.match(hexColorRegex) ?? [];
      const fnMatches = content.match(functionalColorRegex) ?? [];
      if (hexMatches.length > 0 || fnMatches.length > 0) {
        const rel = path.relative(process.cwd(), file);
        violations.push(`${rel}: ${[...hexMatches, ...fnMatches].join(', ')}`);
      }
    }

    expect(violations).toEqual([]);
  });
});
