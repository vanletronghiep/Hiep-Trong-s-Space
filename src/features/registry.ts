export type FeatureThumbnailPreset =
  | 'constellation-arc'
  | 'dual-orbit'
  | 'meridian-grid'
  | 'neural-lattice'
  | 'manuscript-lines'
  | 'academic-compass'
  | 'paired-cards'
  | 'harmonic-waves'
  | 'pulse-timeline'
  | 'blueprint-vectors'
  | 'summit-trajectory'
  | 'focus-aperture'
  | 'zenith-crown';

export interface FeatureEntry {
  id: string;
  slug: string;
  title: string;
  label: string;
  href: string;
  status: 'built' | 'blank';
  thumbnail: {
    preset: FeatureThumbnailPreset;
    accent: 'lavender' | 'blue';
    imageUrl?: string;
  };
}

export const FEATURE_REGISTRY: readonly FeatureEntry[] = [
  {
    id: 'daily-tasks',
    slug: 'daily',
    title: 'Daily Task Management',
    label: 'Tasks',
    href: '/tasks/daily',
    status: 'built',
    thumbnail: { preset: 'constellation-arc', accent: 'lavender' },
  },
  {
    id: 'tasks-hub',
    slug: 'hub',
    title: 'Tasks Hub',
    label: 'Tasks',
    href: '/tasks/hub',
    status: 'built',
    thumbnail: { preset: 'dual-orbit', accent: 'blue' },
  },
  {
    id: 'events',
    slug: 'events',
    title: 'Events',
    label: 'Schedule',
    href: '/events',
    status: 'blank',
    thumbnail: { preset: 'meridian-grid', accent: 'lavender' },
  },
  {
    id: 'ai-engineering',
    slug: 'ai-engineering',
    title: 'AI Engineering',
    label: 'Learning',
    href: '/ai-engineering',
    status: 'blank',
    thumbnail: { preset: 'neural-lattice', accent: 'blue' },
  },
  {
    id: 'blogs',
    slug: 'blogs',
    title: 'Blogs Hub',
    label: 'Writing',
    href: '/blogs',
    status: 'blank',
    thumbnail: { preset: 'manuscript-lines', accent: 'lavender' },
  },
  {
    id: 'apcs',
    slug: 'apcs',
    title: 'APCS Hub',
    label: 'University',
    href: '/apcs',
    status: 'blank',
    thumbnail: { preset: 'academic-compass', accent: 'blue' },
  },
  {
    id: 'flashcards',
    slug: 'flashcards',
    title: 'Flashcards',
    label: 'Learning',
    href: '/flashcards',
    status: 'blank',
    thumbnail: { preset: 'paired-cards', accent: 'lavender' },
  },
  {
    id: 'entertainment',
    slug: 'entertainment',
    title: 'Entertainment Hub',
    label: 'Personal',
    href: '/entertainment',
    status: 'blank',
    thumbnail: { preset: 'harmonic-waves', accent: 'blue' },
  },
  {
    id: 'tracking',
    slug: 'tracking',
    title: 'Tracking',
    label: 'Tracking',
    href: '/tracking',
    status: 'blank',
    thumbnail: { preset: 'pulse-timeline', accent: 'lavender' },
  },
  {
    id: 'projects',
    slug: 'projects',
    title: 'In Progress Projects',
    label: 'Projects',
    href: '/projects',
    status: 'blank',
    thumbnail: { preset: 'blueprint-vectors', accent: 'blue' },
  },
  {
    id: 'milestones',
    slug: 'milestones',
    title: 'Annual Milestones',
    label: 'Personal',
    href: '/milestones',
    status: 'blank',
    thumbnail: { preset: 'summit-trajectory', accent: 'lavender' },
  },
  {
    id: 'learning-room',
    slug: 'learning-room',
    title: 'Learning Room',
    label: 'Learning',
    href: '/learning-room',
    status: 'blank',
    thumbnail: { preset: 'focus-aperture', accent: 'blue' },
  },
  {
    id: 'achievements',
    slug: 'achievements',
    title: 'Personal Achievements',
    label: 'Personal',
    href: '/achievements',
    status: 'blank',
    thumbnail: { preset: 'zenith-crown', accent: 'lavender' },
  },
] as const;

export function getFeatureById(id: string): FeatureEntry | undefined {
  return FEATURE_REGISTRY.find((entry) => entry.id === id);
}

export function getFeatureByHref(href: string): FeatureEntry | undefined {
  return FEATURE_REGISTRY.find((entry) => entry.href === href);
}
