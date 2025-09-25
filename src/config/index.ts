import { ConfigService } from '@nestjs/config';

type ConfigSchema = ReturnType<typeof import('./index').default>;

export default () => ({
  environment: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || '',
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT!, 10) || 6379,
    username: process.env.REDIS_USERNAME || '',
    password: process.env.REDIS_PASSWORD || '',
  },
});

export class TypedConfigService extends ConfigService<ConfigSchema, true> {}
