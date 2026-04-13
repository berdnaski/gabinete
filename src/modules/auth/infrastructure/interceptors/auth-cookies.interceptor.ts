import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
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
        const req = context.switchToHttp().getRequest();
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

        if (req.route.path.includes('google/callback')) {
          const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
          res.redirect(`${frontendUrl}/auth/callback`);
        }
      }),
    );
  }
}
