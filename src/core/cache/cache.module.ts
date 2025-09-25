import { Module } from '@nestjs/common';
import { createKeyv } from '@keyv/redis'; // Or whatever your createKeyv function is
import { CacheModule } from '@nestjs/cache-manager';
import { CacheService } from './cache.service';
import { TypedConfigService } from '@config';

@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: (configService: TypedConfigService) => {
        const host = configService.get('redis.host', { infer: true });
        const port = configService.get('redis.port', { infer: true });
        const username = configService.get('redis.username', { infer: true });
        const password = configService.get('redis.password', { infer: true });

        const redis = {
          host,
          port,
          username,
          password,
          getUrl() {
            return `redis://${username ? `${username}:${password}@` : ''}${host}:${port}`;
          },
        };

        return {
          stores: [createKeyv(redis.getUrl())],
          ttl: 1000 * 10, // 10 seconds
        };
      },
      inject: [TypedConfigService],
    }),
  ],
  providers: [CacheService],
  exports: [CacheService], // Export so other modules can use it
})
export class AppCacheModule {}
