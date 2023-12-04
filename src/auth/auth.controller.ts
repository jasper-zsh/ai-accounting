import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CredentialType } from './auth.enum';
import * as bcrypt from 'bcrypt';
import { LocalAuthGuard } from './local.auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    return {
      user: req.user,
    };
  }

  @Get('logout')
  logout(@Request() req) {
    req.session.destroy();
    return {};
  }

  @Post('register')
  async register(
    @Body('username') username: string,
    @Body('password') password: string,
  ) {
    return this.auth.createUser([
      {
        type: CredentialType.USERNAME,
        data: username,
      },
      {
        type: CredentialType.PASSWORD,
        data: await bcrypt.hash(password, 10),
      },
    ]);
  }
}
