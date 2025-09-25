import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'postgresql',
  schema: ['./src/database/schema.ts', './src/**/schema.ts'],
  out: './drizzle',
  dbCredentials: {
    ssl: false,
    host: process.env.POSTGRES_HOST || 'localhost',
    port: Number(process.env.POSTGRES_PORT) || 5444,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DATABASE || 'username',
    url: process.env.DATABASE_URL!,
  },
});
