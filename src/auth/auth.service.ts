/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dtos/login-dto';
import { UserService } from 'src/user/user.service';
import { InjectModel } from '@nestjs/mongoose';
import { RefreshToken } from './schemas/refresh-token.schema';
import crypto from 'crypto';
import { Model } from 'mongoose';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UserService,
    private readonly jwt: JwtService,
    @InjectModel(RefreshToken.name)
    private refreshTokenModel: Model<RefreshToken>,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    const token = await this.signToken(user);
    const refreshToken = crypto.randomBytes(50).toString('hex');

    await this.refreshTokenModel.create({
      token: refreshToken,
      userId: user._id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    return {
      access_token: token,
      refresh_token: refreshToken,
    };
  }

  private async signToken(user): Promise<string> {
    const payload = {
      userId: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
      phoneNumber: user.phoneNumber,
      workspaces: user.workspaces,
    };
    return this.jwt.signAsync(payload, { expiresIn: '5m' }); // uses configured secret/expiry
  }

  async refreshToken(refreshToken: string) {
    const tokenDoc = await this.refreshTokenModel.findOne({
      token: refreshToken,
    });

    if (!tokenDoc) throw new UnauthorizedException('Invalid refresh token');
    const user = await this.usersService.getUserById(tokenDoc.userId);

    return { access_token: await this.signToken(user) };
  }

  async logout(refreshToken: string) {
    await this.refreshTokenModel
      .deleteOne({ token: refreshToken })
      .then(() => {})
      .catch((err) => {
        console.log(err);
      });
    return { message: 'Logged out successfully' };
  }
}
