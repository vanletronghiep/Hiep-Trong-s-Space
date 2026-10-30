import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const IO_AND_DB_PATTERNS = [
  'fs',
  'fs/*',
  'node:fs',
  'node:fs/*',
  'better-sqlite3',
  'drizzle-orm',
  'drizzle-orm/*',
];

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    files: ['src/**/*.{ts,tsx}', 'tests/**/*.{ts,tsx}'],
    rules: {
      'no-console': ['error', { allow: ['warn', 'error'] }],
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/server/config.ts'],
    rules: {
      'no-restricted-properties': [
        'error',
        {
          object: 'process',
          property: 'env',
          message: 'Only src/server/config.ts may read process.env.',
        },
      ],
    },
  },
  {
    files: ['src/contracts/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            ...IO_AND_DB_PATTERNS,
            'react',
            'react-*',
            'next',
            'next/*',
            '@/domain/*',
            '**/domain/*',
            '@/services/*',
            '**/services/*',
            '@/server/*',
            '**/server/*',
            '@/client/*',
            '**/client/*',
            '@/features/*',
            '**/features/*',
            '@/ui/*',
            '**/ui/*',
            '@/design/*',
            '**/design/*',
          ],
        },
      ],
    },
  },
  {
    files: ['src/domain/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            ...IO_AND_DB_PATTERNS,
            'react',
            'react-*',
            'next',
            'next/*',
            '@/services/*',
            '**/services/*',
            '@/server/*',
            '**/server/*',
            '@/client/*',
            '**/client/*',
            '@/features/*',
            '**/features/*',
            '@/ui/*',
            '**/ui/*',
            '@/design/*',
            '**/design/*',
          ],
        },
      ],
    },
  },
  {
    files: ['src/services/**/*.{ts,tsx}'],
    ignores: ['src/services/storage/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            ...IO_AND_DB_PATTERNS,
            'react',
            'react-*',
            'next',
            'next/*',
            '@/services/storage/local/*',
            '**/storage/local/*',
            '@/services/storage/drive/*',
            '**/storage/drive/*',
            '@/services/storage/factory',
            '**/storage/factory',
            '@/server/*',
            '**/server/*',
            '@/client/*',
            '**/client/*',
            '@/features/*',
            '**/features/*',
            '@/ui/*',
            '**/ui/*',
            '@/design/*',
            '**/design/*',
          ],
        },
      ],
    },
  },
  {
    files: ['src/services/storage/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            'react',
            'react-*',
            'next',
            'next/*',
            '@/client/*',
            '**/client/*',
            '@/features/*',
            '**/features/*',
            '@/ui/*',
            '**/ui/*',
            '@/design/*',
            '**/design/*',
          ],
        },
      ],
    },
  },
  {
    files: ['src/server/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            ...IO_AND_DB_PATTERNS,
            '@/client/*',
            '**/client/*',
            '@/features/*',
            '**/features/*',
            '@/ui/*',
            '**/ui/*',
            '@/design/*',
            '**/design/*',
          ],
        },
      ],
    },
  },
  {
    files: ['src/app/api/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            ...IO_AND_DB_PATTERNS,
            '@/services/storage/*',
            '**/services/storage/*',
            '@/client/*',
            '**/client/*',
            '@/features/*',
            '**/features/*',
            '@/ui/*',
            '**/ui/*',
            '@/design/*',
            '**/design/*',
          ],
        },
      ],
    },
  },
  {
    files: ['src/client/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            ...IO_AND_DB_PATTERNS,
            '@/services/*',
            '**/services/*',
            '@/server/*',
            '**/server/*',
            '@/features/*',
            '**/features/*',
            '@/ui/*',
            '**/ui/*',
          ],
        },
      ],
    },
  },
  {
    files: ['src/features/**/*.{ts,tsx}', 'src/ui/**/*.{ts,tsx}', 'src/app/**/*.{ts,tsx}'],
    ignores: ['src/app/api/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            ...IO_AND_DB_PATTERNS,
            '@/services/*',
            '**/services/*',
            '@/server/*',
            '**/server/*',
          ],
        },
      ],
    },
  },
  {
    files: ['src/design/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            ...IO_AND_DB_PATTERNS,
            '@/contracts/*',
            '**/contracts/*',
            '@/domain/*',
            '**/domain/*',
            '@/services/*',
            '**/services/*',
            '@/server/*',
            '**/server/*',
            '@/client/*',
            '**/client/*',
            '@/features/*',
            '**/features/*',
            '@/ui/*',
            '**/ui/*',
          ],
        },
      ],
    },
  },
];

export default eslintConfig;
