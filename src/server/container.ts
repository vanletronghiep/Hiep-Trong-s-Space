import type { HealthResponse } from '@/contracts';
import { systemClock, type Clock } from '@/domain/clock';
import { NotificationService } from '@/services/notification-service';
import { createStorageAdapter } from '@/services/storage/factory';
import type { StorageAdapter } from '@/services/storage/storage-adapter';
import { TaskService } from '@/services/task-service';
import { getAppConfig, type AppConfig } from './config';

export interface AppContainer {
  config: AppConfig;
  clock: Clock;
  storage: StorageAdapter;
  taskService: TaskService;
  notificationService: NotificationService;
  getHealth(): Promise<HealthResponse>;
}

interface GlobalWithContainer {
  __htsContainerPromise?: Promise<AppContainer>;
}

const globalForContainer = globalThis as unknown as GlobalWithContainer;

async function buildContainer(): Promise<AppContainer> {
  const config = getAppConfig();
  const storage = createStorageAdapter({
    storageDriver: config.storageDriver,
    databasePath: config.databasePath,
    mediaDir: config.mediaDir,
    googleDriveFolderId: config.googleDriveFolderId,
  });

  await storage.init();

  const taskService = new TaskService({
    storage,
    clock: systemClock,
  });

  const notificationService = new NotificationService({
    storage,
    clock: systemClock,
    timeZone: config.appTimezone,
  });

  return {
    config,
    clock: systemClock,
    storage,
    taskService,
    notificationService,
    async getHealth(): Promise<HealthResponse> {
      return {
        ok: true,
        storage: config.storageDriver,
      };
    },
  };
}

export function getContainer(): Promise<AppContainer> {
  if (!globalForContainer.__htsContainerPromise) {
    globalForContainer.__htsContainerPromise = buildContainer().catch((error: unknown) => {
      globalForContainer.__htsContainerPromise = undefined;
      throw error;
    });
  }
  return globalForContainer.__htsContainerPromise;
}
