import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'imane1', description: 'Nom d’affichage' })
  @MinLength(2)
  @IsString()
  display_name: string;

  @ApiProperty({ example: 'imane', description: 'Nom d’utilisateur' })
  @MinLength(2)
  @IsString()
  user_name: string;

  @ApiProperty({ example: 'imane@example.com', description: 'Adresse email' })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'Password123!',
    description: 'Mot de passe sécurisé',
  })
  @IsNotEmpty()
  @MinLength(8)
  password: string;
}
