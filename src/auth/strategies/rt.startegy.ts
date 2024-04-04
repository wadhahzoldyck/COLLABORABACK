import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';

@Injectable()
export class RtStartegy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'rt-secret',
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: any) {
    try {
      // Extract the authorization header from the request
      const authHeader = req.headers['authorization'];

      // Check if the authorization header is present and starts with 'Bearer'
      if (!authHeader || !authHeader.startsWith('Bearer')) {
        throw new UnauthorizedException(
          'Authorization header missing or invalid',
        );
      }

      // Extract the refresh token from the authorization header
      const refreshToken = authHeader.split('Bearer ')[1].trim();

      // Validate and return the payload along with the refresh token
      return {
        ...payload,
        refreshToken,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
