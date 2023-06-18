import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep, mockReset } from 'jest-mock-extended';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  const fakePrismaService = mockDeep<PrismaService>();

  beforeEach(async () => {
    mockReset(fakePrismaService);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: fakePrismaService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should throw error if email is not available', async () => {
      jest.spyOn(service, 'isUserExists').mockResolvedValueOnce(true);

      await expect(
        service.register({
          email: 'email',
          password: 'password',
          firstName: 'firstName',
          lastName: 'lastName',
        })
      ).rejects.toThrowError('Email is not available');
    });

    it('should register user', async () => {
      jest.spyOn(service, 'isUserExists').mockResolvedValueOnce(false);

      fakePrismaService.user.create.mockResolvedValueOnce({
        id: 1,
        email: 'email',
        password: 'password',
        firstName: 'firstName',
        lastName: 'lastName',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.register({
        email: 'email',
        password: 'password',
        firstName: 'firstName',
        lastName: 'lastName',
      });
      expect(result).toEqual({
        id: 1,
        email: 'email',
        password: 'password',
        firstName: 'firstName',
        lastName: 'lastName',
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });

    it('should throw error if email is not available', async () => {
      fakePrismaService.user.findUnique.mockResolvedValueOnce({
        id: 1,
        email: 'email',
        password: 'password',
        firstName: 'firstName',
        lastName: 'lastName',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await expect(
        service.register({
          email: 'email',
          password: 'password',
          firstName: 'firstName',
          lastName: 'lastName',
        })
      ).rejects.toThrowError('Email is not available');
    });
  });

  describe('isUserExists', () => {
    it('should return true if user exists', async () => {
      fakePrismaService.user.findUnique.mockResolvedValueOnce({
        id: 1,
        email: 'example@email.com',
        password: 'password',
        firstName: 'firstName',
        lastName: 'lastName',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.isUserExists('example@email.com');
      expect(result).toBeTruthy();
    });

    it('should return false if user does not exist', async () => {
      fakePrismaService.user.findUnique.mockResolvedValueOnce(null);

      const result = await service.isUserExists('example@email.com');
      expect(result).toBeFalsy();
    });
  });
});
