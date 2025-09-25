import { Pool } from 'pg';
import { NodePgDatabase, drizzle } from 'drizzle-orm/node-postgres';

// Define the type for your schema object.
// You can make this more specific if your schemas are well-defined.
export type AppSchemas = Record<string, unknown>;

// Create a type for the Drizzle connection
export type DrizzleDB = NodePgDatabase<AppSchemas> & {
  $client: Pool;
  reset: () => Promise<void>;
};

export const createDrizzleDb = (pool: Pool, schemas: AppSchemas): DrizzleDB => {
  return drizzle(pool, {
    schema: { ...schemas },
  }) as DrizzleDB;
};
