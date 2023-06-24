import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep, mockReset } from 'jest-mock-extended';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  const fakePrismaService = mockDeep<PrismaService>();
  const fakeJwtService = mockDeep<JwtService>();

  beforeEach(async () => {
    mockReset(fakePrismaService);
    mockReset(fakeJwtService);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: fakePrismaService,
        },
        {
          provide: JwtService,
          useValue: fakeJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should throw error if user does not exist', async () => {
      fakePrismaService.user.findUnique.mockResolvedValueOnce(null);

      await expect(
        service.login({
          email: 'email',
          password: 'password',
        })
      ).rejects.toThrowError('Invalid credentials');
    });

    it('should throw error if password is invalid', async () => {
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
        service.login({
          email: 'email',
          password: 'password',
        })
      ).rejects.toThrowError('Invalid credentials');
    });

    it('should return access token', async () => {
      fakePrismaService.user.findUnique.mockResolvedValueOnce({
        id: 1,
        email: 'email',
        password: 'password',
        firstName: 'firstName',
        lastName: 'lastName',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      fakePrismaService.secret.findFirst.mockResolvedValueOnce({
        id: 1,
        secret: 'secret',
        type: 'LOGIN',
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      jest.spyOn(bcrypt, 'compare').mockImplementation(() => true);

      const spiedSignAsync = jest.spyOn(fakeJwtService, 'signAsync');
      await service.login({ email: 'email', password: 'password' });

      expect(spiedSignAsync).toBeCalledWith(
        {
          email: 'email',
          firstName: 'firstName',
          lastName: 'lastName',
        },
        { secret: 'secret', expiresIn: '15 mins' }
      );
    });
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

      const createManyCall = jest.spyOn(fakePrismaService.secret, 'createMany');
      const result = await service.register({
        email: 'email',
        password: 'password',
        firstName: 'firstName',
        lastName: 'lastName',
      });

      expect(createManyCall).toBeCalled();
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
