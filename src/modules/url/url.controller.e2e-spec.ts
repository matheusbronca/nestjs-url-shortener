import * as request from 'supertest';
import { server } from '../../../test/setup';
import { UrlType } from './schema';

describe('UrlController E2E Tests', () => {
  describe('POST /url', () => {
    // invalid API key
    it('should return 401 if no API Key is provided', async () => {
      await request(server).post('/url').expect(401);
    });
    it('should return 401 if an invalid API Key is provided', async () => {
      await request(server)
        .post('/url')
        .set('x-api-key', 'INVALID_SECRET')
        .expect(401);
    });

    // invalidJSON body payload
    it('should return 400 if the JSON body is empty', async () => {
      await request(server).post('/url').set('x-api-key', 'SECRET').expect(400);
    });
    it('should return 400 if the JSON body is invalid', async () => {
      await request(server)
        .post('/url')
        .send({
          redirect: 'invalid url',
          test: 'Test',
          description: 'test',
        })
        .set('x-api-key', 'SECRET')
        .expect(400);
    });

    // happy path
    it('should return 201 if API Key is valid and JSON body is valid', async () => {
      await request(server)
        .post('/url')
        .send({
          redirect: 'https://airbnb.com',
          title: 'Airbnb',
          description: 'Cool places to rent',
        })
        .set('x-api-key', 'SECRET')
        .expect(201)
        .expect(({ body }: { body: { data: UrlType; meta: unknown } }) => {
          const { data } = body;
          expect(data.redirect).toEqual('https://airbnb.com');
          expect(data.title).toEqual('Airbnb');
          expect(data.description).toEqual('Cool places to rent');
          expect(data).toHaveProperty('url');
          expect(data).toHaveProperty('id');
          expect(data).toHaveProperty('createdAt');
          expect(data).toHaveProperty('updatedAt');
        });
    });
  });
});
