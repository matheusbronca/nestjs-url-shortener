import { TypedConfigService } from '@config';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {
  private apiKey: string | undefined;

  constructor(private readonly configService: TypedConfigService) {}

  onModuleInit() {
    this.apiKey = this.configService.getOrThrow<string>('apiKey');
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const apiKeyFromRequest: string | undefined = req.headers[
      'x-api-key'
    ] as string;

    if (apiKeyFromRequest !== this.apiKey) {
      throw new UnauthorizedException('API Key is invalid');
    }

    return true;
  }
}
