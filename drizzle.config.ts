import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/services/storage/local/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  dbCredentials: {
    url: './data/hiep-trong-space.db',
  },
});
