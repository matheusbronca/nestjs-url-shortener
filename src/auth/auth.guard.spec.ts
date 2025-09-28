import { AuthGuard } from './auth.guard';
import { TypedConfigService } from '@config';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';

describe('AuthGuard', () => {
  let authGuard: AuthGuard;
  let configService: DeepMocked<TypedConfigService>;

  beforeEach(() => {
    configService = createMock<TypedConfigService>();
    configService.getOrThrow.mockReturnValue('SECRET');
    authGuard = new AuthGuard(configService);
    authGuard.onModuleInit();
  });

  it('should be defined', () => {
    expect(authGuard).toBeDefined();
  });

  // Happy path
  it('Should return true if the API Key is valid', () => {
    const mockedExecutionContext = createMock<ExecutionContext>({
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {
            'x-api-key': 'SECRET',
          },
        }),
      }),
    });
    const result = authGuard.canActivate(mockedExecutionContext);
    expect(result).toBeTruthy();
  });

  // Unhappy path: No API Key passed in
  it('Should throw an Unauthorized Exception if the API Key is ommitted', () => {
    const mockedExecutionContext = createMock<ExecutionContext>({
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {},
        }),
      }),
    });

    const result = () => authGuard.canActivate(mockedExecutionContext);
    expect(result).toThrow(UnauthorizedException);
  });
  //
  // Unhappy path: Invalid API Key passed in
  it('Should throw an Unauthorized Exception if the API Key is invalid', () => {
    const mockedExecutionContext = createMock<ExecutionContext>({
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {
            'x-api-key': 'INVALID',
          },
        }),
      }),
    });

    const result = () => authGuard.canActivate(mockedExecutionContext);
    expect(result).toThrow(UnauthorizedException);
  });
});
