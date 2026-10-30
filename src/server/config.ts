import path from 'node:path';
import { z } from 'zod';
import { storageDriverSchema, type StorageDriver } from '@/contracts';
import { DEFAULT_APP_TIMEZONE } from '@/domain/time';

const envSchema = z.object({
  APP_TIMEZONE: z.string().trim().min(1).default(DEFAULT_APP_TIMEZONE),
  STORAGE_DRIVER: storageDriverSchema.default('local'),
  DATA_DIR: z.string().trim().min(1).default('./data'),
  DATABASE_FILE: z.string().trim().min(1).default('hiep-trong-space.db'),
  MEDIA_DIR: z.string().trim().min(1).default('./data/media'),
  GOOGLE_DRIVE_FOLDER_ID: z.string().trim().optional().default(''),
  SCHEDULER_TICK_SECONDS: z.coerce.number().int().positive().default(30),
});

export interface AppConfig {
  appTimezone: string;
  storageDriver: StorageDriver;
  dataDir: string;
  databaseFile: string;
  databasePath: string;
  mediaDir: string;
  googleDriveFolderId: string;
  schedulerTickSeconds: number;
}

export function parseAppConfig(rawEnv: Record<string, string | undefined>): AppConfig {
  const parsed = envSchema.parse({
    APP_TIMEZONE: rawEnv.APP_TIMEZONE || undefined,
    STORAGE_DRIVER: rawEnv.STORAGE_DRIVER || undefined,
    DATA_DIR: rawEnv.DATA_DIR || undefined,
    DATABASE_FILE: rawEnv.DATABASE_FILE || undefined,
    MEDIA_DIR: rawEnv.MEDIA_DIR || undefined,
    GOOGLE_DRIVE_FOLDER_ID: rawEnv.GOOGLE_DRIVE_FOLDER_ID ?? '',
    SCHEDULER_TICK_SECONDS: rawEnv.SCHEDULER_TICK_SECONDS || undefined,
  });

  const dataDir = path.resolve(parsed.DATA_DIR);
  const mediaDir = path.resolve(parsed.MEDIA_DIR);
  const databasePath = path.join(dataDir, parsed.DATABASE_FILE);

  return {
    appTimezone: parsed.APP_TIMEZONE,
    storageDriver: parsed.STORAGE_DRIVER,
    dataDir,
    databaseFile: parsed.DATABASE_FILE,
    databasePath,
    mediaDir,
    googleDriveFolderId: parsed.GOOGLE_DRIVE_FOLDER_ID,
    schedulerTickSeconds: parsed.SCHEDULER_TICK_SECONDS,
  };
}

let cachedConfig: AppConfig | null = null;

export function getAppConfig(): AppConfig {
  if (!cachedConfig) {
    cachedConfig = parseAppConfig(process.env);
  }
  return cachedConfig;
}
