import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { UnauthorizedError } from '../errors/unauthorized.error';
import { AuthService } from './auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super();
  }

  async validate(username: string, password: string) {
    const user = await this.authService.validatePassword(username, password);

    if (!user) {
      throw new UnauthorizedError('Некорректная пара логин и пароль');
    }

    return user;
  }
}
