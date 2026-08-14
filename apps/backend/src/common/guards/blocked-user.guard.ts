import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Users from '../../entities/user.entity';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { REJECTED_INTERVIEW_STATUS } from '../../forms/admin/rejected-users.util';

// A rejected member may only read their own profile so the frontend can
// render the "not meeting requirements" state. Any other request is blocked.
const ALLOWED_READ_PATHS = ['/auth/me'];

@Injectable()
export class BlockedUserGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{
      user?: { id: number; role: string };
      method: string;
      url?: string;
    }>();
    const authUser = request.user;

    // Unauthenticated requests are handled by JwtAuthGuard
    if (!authUser) {
      return true;
    }

    // Only regular members can be blocked; admins are never affected
    if (authUser.role !== 'user') {
      return true;
    }

    const user = await this.usersRepository.findOne({
      where: { id: authUser.id },
      select: ['id', 'interview_status'],
    });

    if (!user || user.interview_status !== REJECTED_INTERVIEW_STATUS) {
      return true;
    }

    const path = request.url?.split('?')[0] ?? '';
    const isAllowedRead =
      request.method === 'GET' && ALLOWED_READ_PATHS.includes(path);

    if (isAllowedRead) {
      return true;
    }

    throw new ForbiddenException(
      'Your account does not meet the requirements and you are not allowed to perform any action',
    );
  }
}
