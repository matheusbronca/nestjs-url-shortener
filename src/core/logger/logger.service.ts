import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import { TypedConfigService } from '@config';
import * as winston from 'winston';

@Injectable()
export class LoggerService implements NestLoggerService {
  private logger: winston.Logger;

  constructor(private readonly configService: TypedConfigService) {
    const isTestingEnv = this.configService.get('environment') === 'test';
    const isDevelopment =
      this.configService.get('environment') === 'development';

    const { combine, timestamp, json, colorize, printf } = winston.format;

    const logFormat = isDevelopment
      ? combine(
          colorize(),
          timestamp(),
          printf(
            ({ timestamp, level, context, message, meta }: any) =>
              `${timestamp} ${level} [${context}] ${message} ${meta ? JSON.stringify(meta) : ''}`,
          ),
        )
      : combine(timestamp(), json());

    this.logger = winston.createLogger({
      format: logFormat,
    });

    // 🎯 Conditionally add a transport based on the environment
    if (!isTestingEnv) {
      this.logger.add(new winston.transports.Console());
    } else {
      // 🎯 Add a silent transport in the test environment to prevent logs
      this.logger.add(new winston.transports.Console({ silent: true }));
    }
  }

  log<T>(message: string, context?: string, meta?: T) {
    this.logger.info(message, {
      context,
      meta,
    });
  }

  error<T>(message: string, trace?: string, context?: string, meta?: T) {
    this.logger.error(message, {
      trace,
      context,
      meta,
    });
  }

  warn<T>(message: string, context?: string, meta?: T) {
    this.logger.warn(message, { context, meta });
  }
}
