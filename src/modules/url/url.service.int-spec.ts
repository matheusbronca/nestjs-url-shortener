import { app } from '../../../test/setup';
import { UrlService } from './url.service';
import { DrizzleDB } from '@database/drizzle-db';
import { DATABASE_CONNECTION } from '@database/database-tokens';
import * as schema from './schema';
import { eq } from 'drizzle-orm';
import { TypedConfigService } from '@config';

describe('UrlService integration test', () => {
  let urlService: UrlService;
  let dbService: DrizzleDB;
  let configService: TypedConfigService;
  let host: string;

  beforeEach(() => {
    urlService = app.get<UrlService>(UrlService);
    dbService = app.get<DrizzleDB>(DATABASE_CONNECTION);
    configService = app.get<TypedConfigService>(TypedConfigService);
    host = configService.getOrThrow('host');
  });

  describe('create', (): void => {
    it('should create a valid UrlItem at Database', async () => {
      const payload = {
        title: 'Airbnb',
        redirect: 'https://airbnb.com',
        description: 'A hotel site',
      };
      const createdUrl = await urlService.create(payload);
      const wasCreated =
        (
          await dbService
            .select()
            .from(schema.urls)
            .where(eq(schema.urls.id, createdUrl.id))
        ).length > 0;

      expect(wasCreated).toBeTruthy();
    });
  });

  describe('findOne', () => {
    it('should return the UrlItem if found in DB', async () => {
      const payload = {
        title: 'Airbnb',
        redirect: 'https://airbnb.com',
        description: 'A hotel site',
      };

      const createdItem = await urlService.create(payload);
      const uid = createdItem.url.replace(`${host}/`, '');

      const wasFound = await urlService.findOne(uid);
      expect(wasFound).toBeTruthy();
    });
  });

  describe('findAll', () => {
    const payloads = [
      {
        title: 'Airbnb',
        redirect: 'https://airbnb.com',
        description: 'A hotel site',
      },
      {
        title: 'Twitter',
        redirect: 'https://x.com',
        description: 'The Elon musk Twitter',
      },
      {
        title: 'Facebook',
        redirect: 'https://facebook.com',
        description: "The Mark Zuckerberg's social media",
      },
    ];

    it('should return an array of db UrlItems and their related pagination metadata', async () => {
      await Promise.all(payloads.map((p) => urlService.create(p)));
      const res = await urlService.findAll({});
      const expected = {
        data: res.data,
        meta: {
          currentPage: 1,
          nextPage: null,
          previousPage: null,
          nextPageUrl: null,
          previousPageUrl: null,
          perPage: 20,
          totalItemsCount: 3,
          totalPages: 1,
        },
      };
      expect(res).toEqual(expected);
    });

    it('should return an empty array and their related pagination metadata when db is empty', async () => {
      const res = await urlService.findAll({});
      const expected = {
        data: [],
        meta: {
          currentPage: 1,
          nextPage: null,
          previousPage: null,
          nextPageUrl: null,
          previousPageUrl: null,
          perPage: 20,
          totalItemsCount: 0,
          totalPages: 0,
        },
      };
      expect(res).toEqual(expected);
    });

    it('should return correct pagination metadata, accordingly with queryParams', async () => {
      for (let i = 0; i < payloads.length; i++) {
        await urlService.create(payloads[i] as schema.UrlType);
      }

      const res_1 = await urlService.findAll({ page: 1, limit: 1 });
      const expected_1 = {
        data: [payloads[0]],
        meta: {
          currentPage: 1,
          nextPage: 2,
          previousPage: null,
          nextPageUrl: `${host}/url?limit=1&page=${2}`,
          previousPageUrl: null,
          perPage: 1,
          totalItemsCount: 3,
          totalPages: 3,
        },
      };

      const res_2 = await urlService.findAll({ page: 2, limit: 1 });
      const expected_2 = {
        data: [payloads[1]],
        meta: {
          currentPage: 2,
          nextPage: 3,
          previousPage: 1,
          nextPageUrl: `${host}/url?limit=1&page=${3}`,
          previousPageUrl: `${host}/url?limit=1&page=${1}`,
          perPage: 1,
          totalItemsCount: 3,
          totalPages: 3,
        },
      };

      const res_3 = await urlService.findAll({ page: 3, limit: 1 });
      const expected_3 = {
        data: [payloads[2]],
        meta: {
          currentPage: 3,
          nextPage: null,
          previousPage: 2,
          nextPageUrl: null,
          previousPageUrl: `${host}/url?limit=1&page=${2}`,
          perPage: 1,
          totalItemsCount: 3,
          totalPages: 3,
        },
      };

      expect(res_1).toMatchObject(expected_1);
      expect(res_2).toMatchObject(expected_2);
      expect(res_3).toMatchObject(expected_3);
    });
  });

  describe('update', () => {
    it('should update the values of the entry in database', async () => {
      const payload = {
        title: 'Airbnb',
        redirect: 'https://airbnb.com',
        description: 'A hotel site',
      };

      const newPayload = {
        title: 'Twitter',
        description: "Elon Musk's social media",
        redirect: 'https://x.com',
      };

      const createdEntry = await urlService.create(payload);
      const updatedEntry = await urlService.update(createdEntry, newPayload);

      expect(updatedEntry).toBeDefined();
      expect(updatedEntry).toEqual([{ ...createdEntry, ...newPayload }]);
    });

    it('should return an empty array if no entry was found in database', async () => {
      const mockedItem: schema.UrlType = {
        title: 'Airbnb',
        redirect: 'https://airbnb.com',
        description: 'A hotel site',
        url: 'localhost:3000/abcdef',
        createdAt: new Date(),
        updatedAt: new Date(),
        id: 1,
      };

      const newPayload = {
        title: 'Twitter',
        description: "Elon Musk's social media",
        redirect: 'https://x.com',
      };
      const updatedEntry = await urlService.update(mockedItem, newPayload);
      expect(updatedEntry).toEqual([]);
    });
  });

  describe('remove', () => {
    it('should remove the entry from database', async () => {
      const payload = {
        title: 'Airbnb',
        redirect: 'https://airbnb.com',
        description: 'A hotel site',
      };

      const createdEntry = await urlService.create(payload);
      const removedEntry = await urlService.remove(createdEntry);
      const hasCreatedEntry = Boolean(
        await urlService.findOne(createdEntry.url.replace(`${host}/`, '')),
      );

      expect(createdEntry).toBeDefined();
      expect(removedEntry).toBeDefined();
      expect(removedEntry).toEqual([createdEntry]);
      expect(hasCreatedEntry).toBeFalsy();
    });

    it('should return undefined if no entry was found in database', async () => {
      const res = await urlService.findOne('abcdef');
      expect(res).toBeUndefined();
    });
  });
});
