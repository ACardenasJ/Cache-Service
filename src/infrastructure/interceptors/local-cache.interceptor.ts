import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { LocalCacheService } from '../services/local-cache.service';
import { LOCAL_CACHE_KEY } from '../decorators/local-cache.decorator';

@Injectable()
export class LocalCacheInterceptor implements NestInterceptor {
  constructor(
    private readonly cacheService: LocalCacheService,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const cacheOptions = this.reflector.get(LOCAL_CACHE_KEY, context.getHandler());
    if (!cacheOptions) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const cacheKey = this.generateCacheKey(request, cacheOptions);
    const cachedValue = this.cacheService.get(cacheKey);

    if (cachedValue !== null) {
      return of(cachedValue);
    }

    return next.handle().pipe(
      tap(response => {
        if (response !== undefined && response !== null) {
          this.cacheService.set(cacheKey, response, cacheOptions.ttl);
        }
      }),
    );
  }

  private generateCacheKey(request: any, options: any): string {
    if (typeof options.key === 'function') {
      return options.key([request.params, request.query, request.body]);
    }

    if (options.key) {
      return options.key;
    }

    // Generar clave basada en la ruta y parámetros
    const params = JSON.stringify(request.params || {});
    const query = JSON.stringify(request.query || {});
    return `${request.method}:${request.path}:${params}:${query}`;
  }
} 