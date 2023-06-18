import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  @ApiProperty({ format: 'email' })
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(32)
  @ApiProperty({ minLength: 8, maxLength: 32 })
  password: string;

  @IsString()
  @MaxLength(32)
  @ApiPropertyOptional()
  firstName?: string;

  @IsString()
  @MaxLength(32)
  @ApiPropertyOptional()
  lastName?: string;
}
