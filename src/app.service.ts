import { Injectable, Inject } from '@nestjs/common';
import { LoggerService } from './core/logger/logger.service';
import { DATABASE_CONNECTION } from './database/database-tokens';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from './database/schema';
import { CacheService } from '@core/cache/cache.service';

@Injectable()
export class AppService {
  constructor(
    private readonly logger: LoggerService,
    private readonly cache: CacheService,
    @Inject(DATABASE_CONNECTION)
    private readonly db: NodePgDatabase<typeof schema>,
  ) { }

  async getHello() {
    this.logger.log(`Calling log from inside getHello Method`, undefined, {
      data: { email: 'dev@matheusbronca.com' },
    });

    const res = await this.db.select().from(schema.users);
    const email = res[0]?.email;
    console.log('res::: ', res);

    await this.cache.set('USER_TEST', email, 30);

    // await this.db.insert(schema.users).values({
    //   email: 'example@mail.com',
    // });

    return `Hello ${email}!`;
  }
}
