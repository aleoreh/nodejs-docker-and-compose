import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  private auth(user: User) {
    const payload = { sub: user.id };

    return {
      access_token: this.jwtService.sign(payload, { expiresIn: '7 days' }),
    };
  }

  signin(user: User) {
    return this.auth(user);
  }

  async signup(createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    this.auth(user);
    return user;
  }

  async validatePassword(username: string, password: string) {
    try {
      const user = await this.usersService.findOneForAuthByUsername(username);
      return bcrypt
        .compare(password, user.password)
        .then((isMatched) => (user && isMatched ? user : null));
    } catch (err) {
      return false;
    }
  }
}
