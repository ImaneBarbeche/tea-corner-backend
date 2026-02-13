import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignInDto {

  @ApiProperty({ example: 'imane', description: 'Nom d’utilisateur' })
  @IsNotEmpty()
  @IsString()
  user_name: string;

  @ApiProperty({ example: 'password123', description: 'Mot de passe' })
  @IsNotEmpty()
  @IsString()
  password: string;
}
