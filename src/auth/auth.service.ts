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
import * as crypto from 'crypto';
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
    // normalize possible hash field names (backwards compatibility)
    const storedHash = user.passwordHash ?? user.password ?? user.password_hash;
    if (!storedHash) throw new UnauthorizedException('Invalid credentials');

    const ok = await this.comparePasswords(dto.password, String(storedHash));
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

  // Normalize bcrypt-like hash prefixes to a form accepted by node-bcrypt
  private normalizeBcryptHash(hash: string): string {
    // Common bcrypt prefixes: $2a$, $2b$, $2y$, $2x$
    // Normalize $2y$ and $2x$ to $2b$ which is compatible with node's bcrypt.
    return hash.replace(/^\$(2y|2x)\$/i, '$2b$');
  }

  // Compare password with stored hash with safe fallbacks
  private async comparePasswords(
    password: string,
    hash: string,
  ): Promise<boolean> {
    const normalized = this.normalizeBcryptHash(hash);
    // prefer async compare; fallback to sync if async isn't available for some reason
    if (typeof bcrypt.compare === 'function') {
      try {
        return Boolean(await bcrypt.compare(password, normalized));
      } catch {
        // on any error, treat as non-match to preserve previous behavior
        return false;
      }
    }

    // fallback: try synchronous compare
    try {
      return Boolean(bcrypt.compareSync(password, normalized));
    } catch {
      return false;
    }
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
