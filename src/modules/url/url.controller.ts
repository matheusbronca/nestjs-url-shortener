import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UrlService } from './url.service';
import { CreateUrlDto } from './dto/create-url.dto';
import { UpdateUrlDto } from './dto/update-url.dto';
import { Response } from 'express';
import { UrlExistsPipe } from './pipes/url-exists/url-exists.pipe';
import { UrlType } from './schema';
import { GetUrlsDto } from './dto/get-urls.dto';
import { AuthGuard } from '@auth/auth.guard';

@Controller()
export class UrlController {
  constructor(private readonly urlService: UrlService) {}

  @Post('url')
  @UseGuards(AuthGuard)
  create(@Body() createUrlDto: CreateUrlDto) {
    return this.urlService.create(createUrlDto);
  }

  @Get('url')
  @UseGuards(AuthGuard)
  findAll(@Query() queryParams: GetUrlsDto) {
    return this.urlService.findAll(queryParams);
  }

  @Get(':uid')
  findOne(@Param('uid', UrlExistsPipe) urlItem: UrlType, @Res() res: Response) {
    return res.redirect(urlItem.redirect);
  }

  @Patch('url/:uid')
  @UseGuards(AuthGuard)
  update(
    @Param('uid', UrlExistsPipe) urlItem: UrlType,
    @Body() updateUrlDto: UpdateUrlDto,
  ) {
    return this.urlService.update(urlItem, updateUrlDto);
  }

  @Delete('url/:uid')
  @UseGuards(AuthGuard)
  remove(@Param('uid', UrlExistsPipe) urlItem: UrlType) {
    return this.urlService.remove(urlItem);
  }
}
