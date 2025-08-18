import { Body, Controller, Post } from '@nestjs/common';
import { LoginDto } from './dtos/login-dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('logout')
  async logout(@Body() dto: { refreshToken: string }) {
    return this.authService.logout(dto.refreshToken);
  }

  @Post('refresh')
  async refreshToken(@Body() dto: { refreshToken: string }) {
    return this.authService.refreshToken(dto.refreshToken);
  }
}
