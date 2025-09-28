import { Test, TestingModule } from '@nestjs/testing';
import { UrlService } from './url.service';
import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { UidService } from '@services/uid/uid.service';
import { TypedConfigService } from '@config';
import { DATABASE_CONNECTION } from '@database/database-tokens';
import type { UrlType } from './schema';
import { createMockDrizzle } from '@database/mock-drizzle';

describe('UrlService', () => {
  let urlService: UrlService;
  let uidService: DeepMocked<UidService>;
  let configService: DeepMocked<TypedConfigService>;
  let dbService: ReturnType<typeof createMockDrizzle>;
  const host = 'localhost:3000';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UrlService,
        {
          provide: UidService,
          useValue: createMock<UidService>(),
        },
        {
          provide: TypedConfigService,
          useValue: createMock<TypedConfigService>(),
        },
        {
          provide: DATABASE_CONNECTION,
          useValue: createMockDrizzle<UrlType>([]),
        },
      ],
    }).compile();

    const app = module.createNestApplication();

    urlService = module.get<UrlService>(UrlService);
    uidService = module.get(UidService);

    configService = module.get(TypedConfigService);
    configService.getOrThrow.mockReturnValue(host);

    dbService = module.get(DATABASE_CONNECTION);

    await app.init();
  });

  it('should be defined', () => {
    expect(urlService).toBeDefined();
  });

  describe('create', () => {
    it('should create a new url', async () => {
      uidService.generate.mockReturnValueOnce('abcdef');

      const payload: Omit<UrlType, 'id' | 'createdAt' | 'updatedAt' | 'url'> = {
        title: 'Airbnb',
        redirect: 'https://airbnb.com',
        description: null,
      };

      const uid = 'abcdef';

      const mockedUrl = {
        ...payload,
        id: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        url: `${host}/${uid}`,
      } as UrlType;

      uidService.generate.mockReturnValueOnce('abcdef');

      dbService.insert.mockReturnValueOnce({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([mockedUrl]),
        }),
      } as any);

      const result = await urlService.create(payload);
      expect(result).toEqual(mockedUrl);
    });
  });
});
