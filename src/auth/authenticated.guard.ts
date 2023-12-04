import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class AuthenticatedGuard implements CanActivate {
  async canActivate(context: ExecutionContext) {
    switch (context.getType()) {
      case 'http':
        const request = context.switchToHttp().getRequest();
        if (!request.isAuthenticated()) {
          throw new UnauthorizedException();
        }
        return true;
      default:
        return false;
    }
  }
}
