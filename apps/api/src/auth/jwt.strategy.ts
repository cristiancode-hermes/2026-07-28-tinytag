import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

interface JwtPayload {
  sub: string;
  email: string;
  name: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET', 'tinytag-secret-key'),
    });
  }

  async validate(payload: JwtPayload): Promise<{ id: string; email: string; name: string }> {
    if (!payload.sub) {
      throw new UnauthorizedException();
    }
    return { id: payload.sub, email: payload.email, name: payload.name };
  }
}
