// app.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from '../src/app.service';
import { createMock } from '@golevelup/ts-jest';
import { LoggerService } from '@core/logger/logger.service';
import { CacheService } from '@core/cache/cache.service';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { DATABASE_CONNECTION } from './database/database-tokens';
import { DrizzleDB } from './database/drizzle-db';

const mockUsersSchema = { name: 'users' };

// 🎯 Reusable factory function to create a mocked DrizzleDB
function createMockDrizzleDb(queryResult: any): DeepMockProxy<DrizzleDB> {
  const mockedDB = mockDeep<DrizzleDB>();

  // Mock the schema property
  (mockedDB as unknown as { schema: any }).schema = { users: mockUsersSchema };

  // Mock the entire query chain to return the specified result
  (mockedDB.select as jest.Mock).mockReturnValue({
    from: jest.fn().mockResolvedValue(queryResult),
  });

  return mockedDB;
}

describe('AppService', () => {
  let app: TestingModule;
  let appService: AppService;

  beforeEach(async () => {
    // 🎯 Use the factory function to get a pre-configured mock
    const mockedDB = createMockDrizzleDb([{ email: 'example@mail.com' }]);

    app = await Test.createTestingModule({
      providers: [
        AppService,
        {
          provide: DATABASE_CONNECTION,
          useValue: mockedDB,
        },
        {
          provide: LoggerService,
          useValue: createMock<LoggerService>(),
        },
        {
          provide: CacheService,
          useValue: createMock<CacheService>(),
        },
      ],
    }).compile();

    appService = app.get<AppService>(AppService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('root', () => {
    it('should return "Hello World"', async () => {
      // 🎯 The mock is already configured in beforeEach
      const result = await appService.getHello();
      expect(result).toBe('Hello example@mail.com!');
    });
  });
});
