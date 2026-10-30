import { promises as fs } from 'node:fs';
import path from 'node:path';
import { z } from 'zod';
import { ValidationError } from '@/services/errors';
import type {
  MediaObject,
  MediaStorage,
  MediaUploadInput,
  MediaUploadResult,
} from '../storage-adapter';

const mediaIdSchema = z.string().uuid();
const mediaMetadataSchema = z.object({
  name: z.string(),
  mimeType: z.string().min(1),
});

function isEnoentError(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) {
    return false;
  }
  const code = 'code' in error ? error.code : undefined;
  return code === 'ENOENT';
}

export class LocalMediaStorage implements MediaStorage {
  private readonly mediaDir: string;

  constructor(mediaDir: string) {
    this.mediaDir = mediaDir;
  }

  async ensureDirectory(): Promise<void> {
    await fs.mkdir(this.mediaDir, { recursive: true });
  }

  private resolvePaths(id: string): { dataPath: string; metaPath: string } {
    const parsed = mediaIdSchema.safeParse(id);
    if (!parsed.success) {
      throw new ValidationError(`Invalid media id: "${id}"`);
    }
    return {
      dataPath: path.join(this.mediaDir, `${parsed.data}.bin`),
      metaPath: path.join(this.mediaDir, `${parsed.data}.meta.json`),
    };
  }

  async uploadMedia(file: MediaUploadInput): Promise<MediaUploadResult> {
    if (!file.mimeType.trim()) {
      throw new ValidationError('Media mimeType is required', { mimeType: 'Required' });
    }
    await this.ensureDirectory();
    const id = crypto.randomUUID();
    const { dataPath, metaPath } = this.resolvePaths(id);

    await fs.writeFile(dataPath, file.data);
    await fs.writeFile(
      metaPath,
      JSON.stringify({ name: file.name, mimeType: file.mimeType }),
      'utf8',
    );

    return {
      id,
      url: `/api/media/${id}`,
    };
  }

  async getMedia(id: string): Promise<MediaObject | null> {
    const { dataPath, metaPath } = this.resolvePaths(id);
    try {
      const [rawMeta, rawBuffer] = await Promise.all([
        fs.readFile(metaPath, 'utf8'),
        fs.readFile(dataPath),
      ]);
      const meta = mediaMetadataSchema.parse(JSON.parse(rawMeta));
      return {
        mimeType: meta.mimeType,
        data: new Uint8Array(rawBuffer),
      };
    } catch (error: unknown) {
      if (isEnoentError(error)) {
        return null;
      }
      throw error;
    }
  }

  async deleteMedia(id: string): Promise<void> {
    const { dataPath, metaPath } = this.resolvePaths(id);
    await Promise.all([fs.rm(dataPath, { force: true }), fs.rm(metaPath, { force: true })]);
  }
}
