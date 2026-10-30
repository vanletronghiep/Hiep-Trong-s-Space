import type {
  NotificationDeleteFilter,
  NotificationQuery,
  NotificationRecord,
  TaskQuery,
  TaskRecord,
} from '@/contracts';

export interface Repository<TRecord, TQuery = void> {
  saveItem(record: TRecord): Promise<TRecord>;
  getItem(id: string): Promise<TRecord | null>;
  listItems(query?: TQuery): Promise<TRecord[]>;
  deleteItem(id: string): Promise<void>;
}

export interface MediaUploadInput {
  name: string;
  mimeType: string;
  data: Uint8Array;
}

export interface MediaUploadResult {
  id: string;
  url: string;
}

export interface MediaObject {
  mimeType: string;
  data: Uint8Array;
}

export interface MediaStorage {
  uploadMedia(file: MediaUploadInput): Promise<MediaUploadResult>;
  getMedia(id: string): Promise<MediaObject | null>;
  deleteMedia(id: string): Promise<void>;
}

export type TaskRepository = Repository<TaskRecord, TaskQuery>;

export interface NotificationRepository extends Repository<NotificationRecord, NotificationQuery> {
  deleteWhere(filter: NotificationDeleteFilter): Promise<number>;
}

export interface StorageAdapter {
  tasks: TaskRepository;
  notifications: NotificationRepository;
  media: MediaStorage;
  init(): Promise<void>;
  close(): Promise<void>;
}
