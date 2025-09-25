import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { CreateUserDTO } from './create-user.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async getHello() {
    return await this.appService.getHello();
  }

  @Get('/hello')
  async getHelloApart() {
    return await this.appService.getHello();
  }

  @Post()
  createUser(@Body() payload: CreateUserDTO) {
    return payload;
  }
}
