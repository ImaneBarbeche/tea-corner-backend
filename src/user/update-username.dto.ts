import { IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUsernameDto {
  @ApiProperty({ example: 'imane', description: 'Nom d’utilisateur' })
  @MinLength(2)
  @MaxLength(30)
  @IsString()
  user_name: string;
}
