import { describe, expect, it } from 'vitest';
import { NotImplementedError } from '@/services/errors';
import { createStorageAdapter } from '@/services/storage/factory';

describe('DriveStorageAdapter stub', () => {
  it('throws NotImplementedError for storage operations and closes cleanly', async () => {
    const adapter = createStorageAdapter({
      storageDriver: 'drive',
      databasePath: './unused.db',
      mediaDir: './unused-media',
      googleDriveFolderId: 'drive-folder-stub',
    });

    await expect(adapter.init()).rejects.toBeInstanceOf(NotImplementedError);
    await expect(adapter.tasks.listItems()).rejects.toBeInstanceOf(NotImplementedError);
    await expect(adapter.notifications.listItems()).rejects.toBeInstanceOf(NotImplementedError);
    await expect(adapter.media.getMedia(crypto.randomUUID())).rejects.toBeInstanceOf(
      NotImplementedError,
    );
    await expect(adapter.close()).resolves.toBeUndefined();
  });
});
