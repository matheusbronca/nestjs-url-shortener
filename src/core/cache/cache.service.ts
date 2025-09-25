// src/cache/cache.service.ts
import { Injectable, Inject, OnModuleDestroy } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheService implements OnModuleDestroy {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  /**
   * Retrieves a value from the cache.
   * @param key The key to retrieve.
   * @returns The cached value or null if not found.
   */
  async get<T>(key: string): Promise<T | null> {
    const value = await this.cacheManager.get<T>(key);
    return value || null;
  }

  /**
   * Stores a value in the cache.
   * @param key The key to store the value under.
   * @param value The value to cache.
   * @param ttlSeconds The time-to-live in seconds. Optional.
   */
  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds) {
      await this.cacheManager.set(key, value, ttlSeconds * 1000);
    } else {
      await this.cacheManager.set(key, value);
    }
  }

  /**
   * Deletes a value from the cache.
   * @param key The key to delete.
   */
  async del(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }

  /**
   * Clears the entire cache.
   */
  async reset(): Promise<void> {
    await this.cacheManager.clear();
  }

  /**
   * Gracefully closes the Redis connection if available.
   */
  async close(): Promise<void> {
    // `store` is a Keyv (redis) instance
    const store = this.cacheManager;

    await store.disconnect();
  }

  async onModuleDestroy() {
    await this.close();
    console.log('REDIS DB::: ended');
  }
}
