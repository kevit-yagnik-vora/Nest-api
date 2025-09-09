import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { LoginDto } from './dtos/login-dto';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
  @UseGuards(AuthGuard)
  @Post('logout')
  async logout(@Body() dto: { refresh_token: string }) {
    return this.authService.logout(dto.refresh_token);
  }

  @Post('refresh')
  async refreshToken(@Body() dto: { refresh_token: string }) {
    console.log('controller', dto.refresh_token);
    return this.authService.refreshToken(dto.refresh_token);
  }
}
