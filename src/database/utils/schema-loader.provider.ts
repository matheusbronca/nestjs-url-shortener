import { glob } from 'fast-glob';
import { resolve } from 'path';

import { Injectable } from '@nestjs/common';
import { LoggerService } from '@core/logger/logger.service';

@Injectable()
export class SchemaLoader {
  constructor(private readonly logger: LoggerService) {}
  private async importModule<T>(modulePath: string): Promise<T> {
    const module: unknown = await import(modulePath);
    return (module as { default: T }).default;
  }

  private async loadSchemas() {
    // NOTE: We need to grab the schemas on runtime, so we need to gather it
    // from the dist folder
    const schemasFiles = await glob(['dist/**/schema.js'], { dot: true });
    const schemas = await Promise.all(
      schemasFiles.map(async (file) => {
        const modulePath = resolve(file);
        return await this.importModule(modulePath);
      }),
    );

    return schemas;
  }

  async getSchemas() {
    try {
      const schemasArr = (await this.loadSchemas()) as Record<
        string,
        unknown
      >[];

      const schemas = schemasArr.reduce((acc, curr) => {
        acc = { ...acc, ...curr };
        return acc;
      }, {});
      return schemas;
    } catch (e) {
      this.logger.error(
        'Something went wrong loading Drizzle Schemas',
        undefined,
        'SchemaLoader',
      );
      if (typeof e === 'object' && 'message' in e) {
        throw new Error((e as { message: string }).message);
      }
    }
  }
}
