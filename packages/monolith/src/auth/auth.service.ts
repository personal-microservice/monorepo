import { BadRequestException, Injectable } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { PrismaService } from '../prisma/prisma.service';
import bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private readonly prismaService: PrismaService) {}

  async isUserExists(email: string) {
    const user = await this.prismaService.user.findUnique({
      where: { email },
    });

    return !!user;
  }

  async register(body: RegisterDto) {
    body.email = body.email.toLowerCase();

    if (await this.isUserExists(body.email)) {
      throw new BadRequestException('Email is not available');
    }

    const user = await this.prismaService.user.create({
      data: {
        ...body,
        password: bcrypt.hashSync(body.password, 10),
      },
    });

    return user;
  }
}
