export type DailyViewMode = 'day' | 'week' | 'month';
export type FeatureCollectionLayout = 'horizontal' | 'vertical';

const STORAGE_KEYS = {
  dailyView: 'hts.daily.view',
  featureCollectionLayout: 'hts.featureCollection.layout',
} as const;

function safeGetItem(key: string): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSetItem(key: string, value: string): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Ignore storage quota or private-mode failures
  }
}

export function getDailyViewPreference(): DailyViewMode {
  const raw = safeGetItem(STORAGE_KEYS.dailyView);
  if (raw === 'day' || raw === 'week' || raw === 'month') {
    return raw;
  }
  return 'day';
}

export function setDailyViewPreference(mode: DailyViewMode): void {
  safeSetItem(STORAGE_KEYS.dailyView, mode);
}

export function getFeatureCollectionLayoutPreference(): FeatureCollectionLayout {
  const raw = safeGetItem(STORAGE_KEYS.featureCollectionLayout);
  if (raw === 'horizontal' || raw === 'vertical') {
    return raw;
  }
  return 'horizontal';
}

export function setFeatureCollectionLayoutPreference(layout: FeatureCollectionLayout): void {
  safeSetItem(STORAGE_KEYS.featureCollectionLayout, layout);
}
