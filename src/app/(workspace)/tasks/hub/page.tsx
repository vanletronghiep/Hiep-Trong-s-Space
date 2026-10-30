import { Suspense } from 'react';
import type { Metadata } from 'next';
import { getFeatureById } from '@/features/registry';
import { HubList } from '@/features/tasks/HubList';
import { Skeleton } from '@/ui/Skeleton';

const feature = getFeatureById('tasks-hub');

export const metadata: Metadata = {
  title: feature?.title ?? 'Tasks Hub',
};

export default function TasksHubPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4 py-6">
          <Skeleton className="h-10 w-56" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
          </div>
        </div>
      }
    >
      <HubList />
    </Suspense>
  );
}
