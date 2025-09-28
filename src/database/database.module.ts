// database.module.ts
import { Module, OnModuleDestroy, Provider } from '@nestjs/common';
import { DATABASE_CONNECTION } from './database-tokens';
import { Pool } from 'pg';
import { TypedConfigService } from '@config';
import { SchemaLoader } from './utils/schema-loader.provider';
import { AppSchemas, DrizzleDB, createDrizzleDb } from './drizzle-db';
import { Inject } from '@nestjs/common';
import resetDatabase from '@database/scripts/reset-db';

const drizzleProvider: Provider<DrizzleDB> = {
  provide: DATABASE_CONNECTION,
  useFactory: async (
    configService: TypedConfigService,
    schemaLoader: SchemaLoader,
  ) => {
    const pool = new Pool({
      connectionString: configService.getOrThrow('databaseUrl'),
      ssl: false,
    });

    const schemas = await schemaLoader.getSchemas();

    // Use the factory function to create a typed db instance
    const db = createDrizzleDb(pool, schemas as AppSchemas);

    return Object.assign(db, {
      reset: () => resetDatabase(db),
    });
  },
  inject: [TypedConfigService, SchemaLoader],
};

@Module({
  providers: [SchemaLoader, drizzleProvider],
  exports: [DATABASE_CONNECTION],
})
export class DatabaseModule implements OnModuleDestroy {
  constructor(@Inject(DATABASE_CONNECTION) private readonly db: DrizzleDB) {}

  async onModuleDestroy() {
    await this.db.$client.end();
  }
}
