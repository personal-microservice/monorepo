import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  @ApiProperty({ format: 'email' })
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(32)
  @ApiProperty({ minLength: 8, maxLength: 32 })
  password: string;
}
