import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';

type ResponseWithMeta<T> = {
  data: T;
  meta: {
    pages: number;
  };
};

@Injectable()
export class TransformResponseInterceptor<T = unknown>
  implements NestInterceptor<{ data: T } | ResponseWithMeta<T> | { data: [] }>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<{ data: T } | { data: [] } | ResponseWithMeta<T>> {
    return next.handle().pipe(
      map((response: T | ResponseWithMeta<T>) => {
        if (!response)
          return {
            data: [],
          };
        if (
          typeof response === 'object' &&
          'data' in response &&
          'meta' in response
        )
          return response;
        return { data: response };
      }),
    );
  }
}
