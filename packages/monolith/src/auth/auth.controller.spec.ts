import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { mockDeep } from 'jest-mock-extended';

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockDeep(PrismaService),
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  describe('register', () => {
    it('should call register service', async () => {
      const registerSpy = jest.spyOn(controller['authService'], 'register');

      await controller.register({
        email: 'email',
        password: 'password',
        firstName: 'firstName',
        lastName: 'lastName',
      });

      expect(registerSpy).toBeCalledWith({
        email: 'email',
        password: 'password',
        firstName: 'firstName',
        lastName: 'lastName',
      });
    });
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
