import { promises as fs } from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';
import { drizzle, type BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import type {
  MediaStorage,
  NotificationRepository,
  StorageAdapter,
  TaskRepository,
} from '../storage-adapter';
import { LocalMediaStorage } from './local-media-storage';
import { LocalNotificationRepository } from './local-notification-repository';
import { LocalTaskRepository } from './local-task-repository';

export interface LocalStorageAdapterOptions {
  databasePath: string;
  mediaDir: string;
  migrationsFolder?: string;
}

export class LocalStorageAdapter implements StorageAdapter {
  public readonly tasks: TaskRepository;
  public readonly notifications: NotificationRepository;
  public readonly media: MediaStorage;

  private readonly databasePath: string;
  private readonly migrationsFolder: string;
  private readonly localMedia: LocalMediaStorage;
  private sqlite: Database.Database | null = null;
  private db: BetterSQLite3Database | null = null;

  constructor(options: LocalStorageAdapterOptions) {
    this.databasePath = options.databasePath;
    this.migrationsFolder = options.migrationsFolder ?? path.resolve(process.cwd(), 'drizzle');
    this.localMedia = new LocalMediaStorage(options.mediaDir);

    const getDb = (): BetterSQLite3Database => {
      if (!this.db) {
        throw new Error('LocalStorageAdapter has not been initialized. Call init() first.');
      }
      return this.db;
    };

    this.tasks = new LocalTaskRepository(getDb);
    this.notifications = new LocalNotificationRepository(getDb);
    this.media = this.localMedia;
  }

  async init(): Promise<void> {
    if (this.db) {
      return;
    }

    await fs.mkdir(path.dirname(this.databasePath), { recursive: true });
    await this.localMedia.ensureDirectory();

    const sqlite = new Database(this.databasePath);
    sqlite.pragma('journal_mode = WAL');
    sqlite.pragma('foreign_keys = ON');

    const db = drizzle(sqlite);
    migrate(db, { migrationsFolder: this.migrationsFolder });

    this.sqlite = sqlite;
    this.db = db;
  }

  async close(): Promise<void> {
    if (this.sqlite) {
      this.sqlite.close();
      this.sqlite = null;
      this.db = null;
    }
  }
}
