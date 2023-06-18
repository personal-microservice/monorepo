import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/sign-in')
  signIn() {}

  @Post()
  @HttpCode(HttpStatus.NO_CONTENT)
  async register(@Body() body: RegisterDto) {
    await this.authService.register(body);
  }
}
