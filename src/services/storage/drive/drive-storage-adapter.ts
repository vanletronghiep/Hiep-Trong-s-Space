import type {
  NotificationDeleteFilter,
  NotificationQuery,
  NotificationRecord,
  TaskQuery,
  TaskRecord,
} from '@/contracts';
import { NotImplementedError } from '@/services/errors';
import type {
  MediaObject,
  MediaStorage,
  MediaUploadInput,
  MediaUploadResult,
  NotificationRepository,
  StorageAdapter,
  TaskRepository,
} from '../storage-adapter';

const NOT_IMPLEMENTED_MESSAGE = 'Drive adapter not implemented';

class DriveTaskRepository implements TaskRepository {
  async saveItem(_record: TaskRecord): Promise<TaskRecord> {
    // Future Google Drive API mapping:
    // - drive.files.list (q: appProperties has taskId or locate tasks JSON index in GOOGLE_DRIVE_FOLDER_ID)
    // - drive.files.create / drive.files.update (uploadType=multipart) to upsert task payload
    void _record;
    throw new NotImplementedError(NOT_IMPLEMENTED_MESSAGE);
  }

  async getItem(_id: string): Promise<TaskRecord | null> {
    // Future Google Drive API mapping:
    // - drive.files.list + drive.files.get (alt=media) for task record by id
    void _id;
    throw new NotImplementedError(NOT_IMPLEMENTED_MESSAGE);
  }

  async listItems(_query?: TaskQuery): Promise<TaskRecord[]> {
    // Future Google Drive API mapping:
    // - drive.files.get (alt=media) on tasks collection file or paginated drive.files.list within folder
    void _query;
    throw new NotImplementedError(NOT_IMPLEMENTED_MESSAGE);
  }

  async deleteItem(_id: string): Promise<void> {
    // Future Google Drive API mapping:
    // - drive.files.delete (or remove task entry + cascade delete matching notification entries)
    void _id;
    throw new NotImplementedError(NOT_IMPLEMENTED_MESSAGE);
  }
}

class DriveNotificationRepository implements NotificationRepository {
  async saveItem(_record: NotificationRecord): Promise<NotificationRecord> {
    // Future Google Drive API mapping:
    // - drive.files.create / drive.files.update on notifications collection file (enforcing unique dedupeKey)
    void _record;
    throw new NotImplementedError(NOT_IMPLEMENTED_MESSAGE);
  }

  async getItem(_id: string): Promise<NotificationRecord | null> {
    // Future Google Drive API mapping:
    // - drive.files.get (alt=media) to read notification record by id
    void _id;
    throw new NotImplementedError(NOT_IMPLEMENTED_MESSAGE);
  }

  async listItems(_query?: NotificationQuery): Promise<NotificationRecord[]> {
    // Future Google Drive API mapping:
    // - drive.files.get (alt=media) on notifications collection file, filtered and sorted newest-first
    void _query;
    throw new NotImplementedError(NOT_IMPLEMENTED_MESSAGE);
  }

  async deleteItem(_id: string): Promise<void> {
    // Future Google Drive API mapping:
    // - drive.files.delete / drive.files.update removing notification id
    void _id;
    throw new NotImplementedError(NOT_IMPLEMENTED_MESSAGE);
  }

  async deleteWhere(_filter: NotificationDeleteFilter): Promise<number> {
    // Future Google Drive API mapping:
    // - drive.files.get + drive.files.update batch-pruning notifications matching taskId/kinds/createdAt cutoff
    void _filter;
    throw new NotImplementedError(NOT_IMPLEMENTED_MESSAGE);
  }
}

class DriveMediaStorage implements MediaStorage {
  async uploadMedia(_file: MediaUploadInput): Promise<MediaUploadResult> {
    // Future Google Drive API mapping:
    // - drive.files.create (uploadType=multipart, parents=[GOOGLE_DRIVE_FOLDER_ID], mimeType=file.mimeType)
    void _file;
    throw new NotImplementedError(NOT_IMPLEMENTED_MESSAGE);
  }

  async getMedia(_id: string): Promise<MediaObject | null> {
    // Future Google Drive API mapping:
    // - drive.files.get (fileId, fields='mimeType') + drive.files.get (fileId, alt='media')
    void _id;
    throw new NotImplementedError(NOT_IMPLEMENTED_MESSAGE);
  }

  async deleteMedia(_id: string): Promise<void> {
    // Future Google Drive API mapping:
    // - drive.files.delete (fileId)
    void _id;
    throw new NotImplementedError(NOT_IMPLEMENTED_MESSAGE);
  }
}

export interface DriveStorageAdapterOptions {
  folderId: string;
}

export class DriveStorageAdapter implements StorageAdapter {
  public readonly tasks: TaskRepository = new DriveTaskRepository();
  public readonly notifications: NotificationRepository = new DriveNotificationRepository();
  public readonly media: MediaStorage = new DriveMediaStorage();
  private readonly folderId: string;

  constructor(options: DriveStorageAdapterOptions) {
    this.folderId = options.folderId;
  }

  async init(): Promise<void> {
    // Future Google Drive API mapping:
    // - Verify OAuth2 / Service Account credentials and check GOOGLE_DRIVE_FOLDER_ID via drive.files.get
    void this.folderId;
    throw new NotImplementedError(NOT_IMPLEMENTED_MESSAGE);
  }

  async close(): Promise<void> {
    // Future Google Drive API mapping:
    // - Flush any pending batch writes / release HTTP agent resources (no-op when uninitialized)
  }
}
