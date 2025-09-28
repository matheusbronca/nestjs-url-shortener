import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'postgresql',
  schema: ['./src/database/schema.ts', './src/**/schema.ts'],
  out: './drizzle',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
    ssl: 'prefer',
  },
});
