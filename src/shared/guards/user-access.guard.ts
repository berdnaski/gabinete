import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { UserRole } from '../../modules/users/domain/user.entity';

interface RequestWithUser {
  user?: {
    id: string;
    role: UserRole;
  };
  params: Record<string, string>;
}

@Injectable()
export class UserAccessGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const { user, params } = request;

    if (!user) {
      return false;
    }

    const userIdParam = params.id;

    if (userIdParam && user.id === userIdParam) {
      return true;
    }

    throw new ForbiddenException(
      'You do not have permission to access or modify this user profile.',
    );
  }
}
