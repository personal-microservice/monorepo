import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(32)
  password: string;

  @IsString()
  @MaxLength(32)
  firstName?: string;

  @IsString()
  @MaxLength(32)
  lastName?: string;
}
