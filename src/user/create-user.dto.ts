import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'imane1', description: 'Nom d’affichage' })
  @IsNotEmpty()
  @MaxLength(50)
  @MinLength(2)
  @IsString()
  display_name: string;

  @ApiProperty({ example: 'imane', description: 'Nom d’utilisateur' })
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(30)
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'user_name ne peut contenir que lettres, chiffres et underscores',
  })
  user_name: string;

  @ApiProperty({ example: 'imane@example.com', description: 'Adresse email' })
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(254)
  email: string;

  @ApiProperty({
    example: 'Password123!',
    description: 'Mot de passe sécurisé',
  })
  @IsNotEmpty()
  @MinLength(8)
  password: string;
  
  @ApiProperty({ example: '2026-03-08T12:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  terms_accepted_at?: string;

  @ApiProperty({ example: '2026-03-08T12:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  privacy_accepted_at?: string;
}
