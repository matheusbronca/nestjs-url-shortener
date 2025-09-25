import * as request from 'supertest';
import { server } from './setup';

describe('AppController (e2e)', () => {
  it('/ (GET) should handle an empty database', async () => {
    return request(server)
      .get('/')
      .expect(200)
      .expect({ data: 'Hello undefined!' });
  });
});
