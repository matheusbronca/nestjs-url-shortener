import { drizzle } from 'drizzle-orm/node-postgres';
import { reset } from 'drizzle-seed';
import * as fastGlob from 'fast-glob';
import { join } from 'path';
import { DrizzleDB } from '../drizzle-db';

type DrizzleSchema = Record<string, unknown>;
const glob = fastGlob.glob;

async function loadSchemas(): Promise<DrizzleSchema[]> {
  const schemasFiles = await glob(['src/**/schema.ts'], { dot: true });
  const schemas = await Promise.all(
    schemasFiles.map(async (file) => {
      // 🎯 Create a reliable absolute path using `join`
      const absolutePath = join(process.cwd(), file);

      const schemaModule = (await import(absolutePath)) as {
        default: DrizzleSchema;
      };

      return schemaModule;
    }),
  );

  return schemas.filter(Boolean);
}

export default async function main(db?: DrizzleDB, force: boolean = false) {
  const execute = async () => {
    // 🎯 Type-assert the database connection URL
    const currDB = db ?? drizzle(process.env.DATABASE_URL!);

    const loadedSchemas = await loadSchemas();
    // 🎯 Use a type-safe reduce to combine the schemas
    const combinedSchema = loadedSchemas.reduce((acc: DrizzleSchema, curr) => {
      return { ...acc, ...curr };
    }, {});

    await reset(currDB, combinedSchema);
    if (!db) await currDB.$client.end();
    console.info('DRIZZLE::: Database reset completed.');
  };

  if (
    process.env.NODE_ENV === 'development' ||
    process.env.NODE_ENV === 'test' ||
    force
  ) {
    return await execute();
  }
  console.warn(
    'DRIZZLE::: Database reset skipped: not in development environment.',
  );
}

void main();
