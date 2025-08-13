/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from 'src/user/user.service';
import { LoginDto } from './dtos/login-dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UserService,
    private readonly jwt: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    console.log(user);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    const token = await this.signToken(user);
    return { accessToken: token };
  }

  private async signToken(user): Promise<string> {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      phoneNumber: user.phoneNumber,
      workspaces: user.workspaces,
    };
    return this.jwt.signAsync(payload); // uses configured secret/expiry
  }
}
