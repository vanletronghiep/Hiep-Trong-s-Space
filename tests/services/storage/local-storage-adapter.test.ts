import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createStorageAdapter } from '@/services/storage/factory';
import { runStorageAdapterContractTests } from './storage-adapter.contract';

runStorageAdapterContractTests('LocalStorageAdapter', async () => {
  const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'hts-sqlite-test-'));
  const adapter = createStorageAdapter({
    storageDriver: 'local',
    databasePath: path.join(tempRoot, 'test.db'),
    mediaDir: path.join(tempRoot, 'media'),
    googleDriveFolderId: '',
  });

  return {
    adapter,
    cleanup: async () => {
      await fs.rm(tempRoot, { recursive: true, force: true });
    },
  };
});
