import { Global, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import config, { TypedConfigService } from '../config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TransformResponseInterceptor } from './interceptors/transform-response.interceptor';
import { LoggerService } from './logger/logger.service';
import { LoggerMiddleware } from './middleware/logger.middleware';
import { AppCacheModule } from './cache/cache.module';
import { CacheService } from './cache/cache.service';
// import { CacheInterceptor } from '@nestjs/cache-manager';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [config] }),
    AppCacheModule,
  ],
  exports: [TypedConfigService, LoggerService, CacheService],
  providers: [
    TypedConfigService,
    LoggerService,
    CacheService,
    { provide: APP_INTERCEPTOR, useClass: TransformResponseInterceptor },
    // { provide: APP_INTERCEPTOR, useClass: CacheInterceptor }, // <-- Caches all the services, globally
  ],
})
export class CoreModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
