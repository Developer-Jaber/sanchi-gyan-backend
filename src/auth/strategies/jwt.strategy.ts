import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Extract from Authorization: Bearer <token>
      ignoreExpiration: false, // Enforce expiration
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: any) {
    // Payload from JWT; attach to req.user
    return { userId: payload.sub, email: payload.email, role: payload.role };
  }
}