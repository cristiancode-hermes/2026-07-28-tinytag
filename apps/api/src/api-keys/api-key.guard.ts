import {
  Injectable,
  UnauthorizedException,
  ExecutionContext,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiKeysService } from './api-keys.service';

@Injectable()
export class ApiKeyGuard extends AuthGuard('jwt') {
  constructor(private readonly apiKeysService: ApiKeysService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      return false;
    }

    const [type, token] = authHeader.split(' ');

    if (type === 'Bearer' && token) {
      // First try JWT authentication
      try {
        const result = await super.canActivate(context);
        if (result) {
          return true;
        }
      } catch {
        // JWT failed, try API key
      }

      // Try API key authentication
      const apiKeyUser = await this.apiKeysService.validateKey(token);
      if (apiKeyUser) {
        request.user = { id: apiKeyUser.userId };
        return true;
      }
    }

    throw new UnauthorizedException('Invalid authentication token');
  }
}
