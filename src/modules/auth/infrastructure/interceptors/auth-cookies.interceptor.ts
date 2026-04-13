import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Response } from 'express';

@Injectable()
export class AuthCookiesInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      tap((data) => {
        if (!data || !data.accessToken || !data.refreshToken) {
          return;
        }

        const res = context.switchToHttp().getResponse<Response>();
        const isProd = process.env.NODE_ENV === 'production';

        res.cookie('accessToken', data.accessToken, {
          httpOnly: true,
          secure: isProd,
          sameSite: 'strict',
          maxAge: 3600 * 1000,
          path: '/',
        });

        res.cookie('refreshToken', data.refreshToken, {
          httpOnly: true,
          secure: isProd,
          sameSite: 'strict',
          maxAge: 30 * 24 * 3600 * 1000,
          path: '/',
        });
      }),
    );
  }
}
