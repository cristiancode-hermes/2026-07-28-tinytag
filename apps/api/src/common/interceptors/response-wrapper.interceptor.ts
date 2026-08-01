import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface WrappedResponse<T> {
  data: T;
}

@Injectable()
export class ResponseWrapperInterceptor<T> implements NestInterceptor<T, WrappedResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<WrappedResponse<T>> {
    const response = context.switchToHttp().getResponse();
    // Skip wrapping for redirect endpoints (204 no content)
    if (response.statusCode === 204) {
      return next.handle() as Observable<any>;
    }
    return next.handle().pipe(
      map(data => {
        // Don't double-wrap if already wrapped, or if it's a redirect response
        if (data && typeof data === 'object' && 'data' in data) {
          return data as WrappedResponse<T>;
        }
        return { data } as WrappedResponse<T>;
      }),
    );
  }
}
