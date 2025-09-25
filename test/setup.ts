import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import helmet from 'helmet';
import { DATABASE_CONNECTION } from '@database/database-tokens';
import { DrizzleDB } from '@database/drizzle-db';
import { CacheService } from '@core/cache/cache.service';

let app: INestApplication<App>;
let server: App;
let cacheService: CacheService;
let databaseService: DrizzleDB;

beforeAll(async () => {
  // 🎯 Set up the application once
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  app = moduleFixture.createNestApplication();
  app.use(helmet());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );
  await app.init();

  server = app.getHttpServer();
  cacheService = app.get(CacheService);
  databaseService = app.get(DATABASE_CONNECTION);
});

beforeEach(async () => {
  await cacheService.reset();
  await databaseService.reset();
});

afterAll(async () => {
  await app.close();
});

export { server };
