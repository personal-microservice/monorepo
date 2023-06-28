import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { mock, mockDeep } from 'jest-mock-extended';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';

describe('UsersService', () => {
  let service: UsersService;
  const mockPrismaService = mockDeep<PrismaService>();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  describe('forgotPassword', () => {
    it('should call forgotPasswordAsync', async () => {
      const spiedForgotPasswordAsync = jest.spyOn(
        service,
        'forgotPasswordAsync'
      );
      jest
        .spyOn(mockPrismaService.user, 'findUnique')
        .mockResolvedValue(mock<User>());
      const result = await service.forgotPassword({ email: 'example.email' });

      expect(spiedForgotPasswordAsync).toBeCalled();
      expect(result.message).toEqual(
        "Success! An email has been sent to your registered email address with instructions on how to reset your password. Please check your inbox and follow the provided steps to regain access to your account. If you don't see the email in your inbox, please check your spam folder."
      );
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
