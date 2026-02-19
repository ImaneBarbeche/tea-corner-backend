import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class UpdatePasswordDto {
  @ApiProperty({
    example: 'MyCurrentP@ssw0rd',
    description: 'Current password for security verification',
    minLength: 8,
  })
  @IsNotEmpty()
  @IsString()
  current_password: string;

  @ApiProperty({
    example: 'MyNewP@ssw0rd123',
    description: 'New password (minimum 8 characters)',
    minLength: 8,
  })
  @IsNotEmpty()
  @MinLength(8)
  new_password: string;

  @ApiProperty({
    example: 'MyNewP@ssw0rd123',
    description: 'Confirmation of the new password (must match new_password)',
    minLength: 8,
  })
  @IsNotEmpty()
  @MinLength(8)
  confirm_password: string;
}