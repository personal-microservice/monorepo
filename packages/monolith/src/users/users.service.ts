import { Injectable } from '@nestjs/common';
import { forgotPasswordDto } from './dto/forgot-password.dto';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  /**
   * This method should be used to make `forgotPassword` has equal execution time for every different calls
   * @param {User | null} user
   */
  async forgotPasswordAsync(user: User | null) {
    if (user === null) {
      return;
    }
  }

  async forgotPassword(body: forgotPasswordDto) {
    body.email = body.email.toLowerCase();

    const user = await this.prismaService.user.findUnique({
      where: { email: body.email },
    });

    this.forgotPasswordAsync(user);

    return {
      message:
        "Success! An email has been sent to your registered email address with instructions on how to reset your password. Please check your inbox and follow the provided steps to regain access to your account. If you don't see the email in your inbox, please check your spam folder.",
    };
  }
}
