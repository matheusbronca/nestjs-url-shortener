import { SchemaLoader } from './schema-loader.provider';
import { LoggerService } from '@core/logger/logger.service';

describe('SchemaLoader', () => {
  let schemaLoader: SchemaLoader;
  let logger: LoggerService;

  beforeEach(() => {
    logger = {
      error: jest.fn(),
    } as unknown as LoggerService;
    schemaLoader = new SchemaLoader(logger);
  });

  describe('getSchemas', () => {
    it('should return merged schemas', async () => {
      // Mock loadSchemas to return array of objects
      const mockSchemas = [{ a: 1 }, { b: 2 }];
      jest
        .spyOn(schemaLoader as any, 'loadSchemas')
        .mockResolvedValue(mockSchemas);

      const result = await schemaLoader.getSchemas();
      expect(result).toEqual({ a: 1, b: 2 });
    });

    it('should log error and throw if loadSchemas throws with message', async () => {
      const error = { message: 'fail' };
      jest.spyOn(schemaLoader as any, 'loadSchemas').mockRejectedValue(error);

      await expect(schemaLoader.getSchemas()).rejects.toThrow('fail');
      expect(logger.error).toHaveBeenCalledWith(
        'Something went wrong loading Drizzle Schemas',
        undefined,
        'SchemaLoader',
      );
    });

    it('should log error and not throw if error has no message', async () => {
      jest.spyOn(schemaLoader as any, 'loadSchemas').mockRejectedValue('fail');

      await expect(schemaLoader.getSchemas()).resolves.toBeUndefined();
      expect(logger.error).toHaveBeenCalled();
    });
  });
});
