import type { StorageDriver } from '@/contracts';
import { DriveStorageAdapter } from './drive/drive-storage-adapter';
import { LocalStorageAdapter } from './local/local-storage-adapter';
import type { StorageAdapter } from './storage-adapter';

export interface StorageFactoryConfig {
  storageDriver: StorageDriver;
  databasePath: string;
  mediaDir: string;
  googleDriveFolderId: string;
  migrationsFolder?: string;
}

export function createStorageAdapter(config: StorageFactoryConfig): StorageAdapter {
  if (config.storageDriver === 'drive') {
    return new DriveStorageAdapter({ folderId: config.googleDriveFolderId });
  }

  return new LocalStorageAdapter({
    databasePath: config.databasePath,
    mediaDir: config.mediaDir,
    migrationsFolder: config.migrationsFolder,
  });
}
