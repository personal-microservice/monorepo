import { BadRequestException, Injectable } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { PrismaService } from '../prisma/prisma.service';
import bcrypt from 'bcrypt';
import { LoginDto, LoginSuccessDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import _ from 'lodash';
import { SecretType } from '@prisma/client';
import crypto from 'node:crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService
  ) {}

  async login(body: LoginDto): Promise<LoginSuccessDto> {
    body.email = body.email.toLowerCase();

    const user = await this.prismaService.user.findUnique({
      where: {
        email: body.email,
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }

    if (!(await bcrypt.compare(body.password, user.password))) {
      throw new BadRequestException('Invalid credentials');
    }

    const payload = _.pick(user, 'email', 'firstName', 'lastName');

    const secret = await this.prismaService.secret.findFirst({
      where: { userId: user.id, type: SecretType.LOGIN },
    });

    if (!secret) {
      //TODO: throw error
    }

    return {
      accessToken: await this.jwtService.signAsync(payload, {
        secret: secret?.secret,
        expiresIn: '15 mins',
      }),
    };
  }

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

    await this.prismaService.secret.createMany({
      data: [
        {
          type: SecretType.LOGIN,
          secret: crypto.randomBytes(10).toString('hex') + user.id,
          userId: user.id,
        },
        {
          type: SecretType.FORGOT_PASSWORD,
          secret: crypto.randomBytes(11).toString('hex') + user.id,
          userId: user.id,
        },
      ],
    });

    return user;
  }
}
