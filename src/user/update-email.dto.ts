import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class UpdateEmailDto {
  @ApiProperty({
    example: 'newemail@example.com',
    description: 'The new email address for the user account',
    format: 'email',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'MyCurrentP@ssw0rd',
    description: 'Current password for security verification',
    minLength: 8,
  })
  @IsNotEmpty()
  @IsString()
  current_password: string;
}
