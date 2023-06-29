import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { forgotPasswordDto } from './dto/forgot-password.dto';
import { UsersService } from './users.service';

@Controller('users')
@ApiTags('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('forgot-password')
  forgotPassword(@Body() body: forgotPasswordDto) {
    return this.usersService.forgotPassword(body);
  }
}
