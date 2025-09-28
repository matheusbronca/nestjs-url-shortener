import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { CreateUrlDto } from './dto/create-url.dto';
import { UpdateUrlDto } from './dto/update-url.dto';
import { UidService } from '@services/uid/uid.service';
import { DATABASE_CONNECTION } from '@database/database-tokens';
import * as schema from './schema';
import { DrizzleDB } from '@database/drizzle-db';
import { TypedConfigService } from '@config';
import { asc, eq, ilike, or } from 'drizzle-orm';

import type { UrlType } from './schema';
import { GetUrlsDto } from './dto/get-urls.dto';

@Injectable()
export class UrlService implements OnModuleInit {
  private host: string;

  constructor(
    private readonly config: TypedConfigService,
    private readonly uidService: UidService,
    @Inject(DATABASE_CONNECTION) private readonly db: DrizzleDB,
  ) { }

  onModuleInit() {
    this.host = this.config.getOrThrow('host');
    console.log('this.host::: ', this.host);
  }

  async create({ redirect, title, description }: CreateUrlDto) {
    const randomId = this.uidService.generate(5);

    const url = (
      await this.db
        .insert(schema.urls)
        .values({
          title,
          description,
          redirect,
          url: `${this.host}/${randomId}`,
        })
        .returning()
    )[0] as UrlType;

    return url;
  }

  async findAll({ filter = undefined, limit = 20, page = 1 }: GetUrlsDto) {
    const conditions = [];

    if (filter) {
      conditions.push(ilike(schema.urls.title, `%${filter}%`));
      conditions.push(ilike(schema.urls.description, `%${filter}%`));
      conditions.push(ilike(schema.urls.url, `%${filter}%`));
    }

    const urls = await this.db
      .select()
      .from(schema.urls)
      .where(or(...conditions))
      .limit(limit)
      .offset(page * limit - limit)
      .orderBy(asc(schema.urls.id));

    const baseUrl = new URL(`${this.host}/url?limit=${limit}`);

    if (filter) baseUrl.searchParams.append('filter', filter.toString());

    const totalItemsCount = await this.db.$count(
      schema.urls,
      or(...conditions),
    );
    const totalPages = Math.ceil(totalItemsCount / limit);
    const nextPage = page + 1 > totalPages ? null : page + 1;

    if (nextPage) baseUrl.searchParams.set('page', nextPage.toString());

    const nextPageUrl = nextPage ? baseUrl.toString() : null;
    const previousPage = page - 1 < 1 ? null : page - 1;

    if (previousPage) baseUrl.searchParams.set('page', previousPage.toString());

    const previousPageUrl = previousPage ? baseUrl.toString() : null;

    const meta = {
      perPage: limit,
      currentPage: page,
      totalItemsCount,
      totalPages: totalPages,
      nextPage,
      previousPage,
      nextPageUrl,
      previousPageUrl,
    };

    return {
      data: urls,
      meta,
    };
  }

  async findOne(uid: string) {
    const urlItem: UrlType[] = await this.db
      .select()
      .from(schema.urls)
      .where(eq(schema.urls.url, `${this.host}/${uid}`))
      .limit(1);
    return urlItem[0];
  }

  async update(urlItem: UrlType, updateUrlDto: UpdateUrlDto) {
    return await this.db
      .update(schema.urls)
      .set({
        ...updateUrlDto,
      })
      .where(eq(schema.urls.id, urlItem.id))
      .returning();
  }

  async remove(urlItem: UrlType) {
    return await this.db
      .delete(schema.urls)
      .where(eq(schema.urls.id, urlItem.id))
      .returning();
  }
}
