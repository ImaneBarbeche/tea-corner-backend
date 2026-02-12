import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({ example: 'Imane', description: 'Nom d’affichage' })
  @IsOptional()
  @MinLength(2)
  @MaxLength(30)
  @IsString()
  display_name: string;

  @ApiProperty({ example: 'example/image.png', description: 'Photo URL' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  avatar_url: string;

  @ApiProperty({ example: '#85b3d8', description: 'Banner color' })
  @IsOptional()
  @IsString()
  @MinLength(7)
  @MaxLength(7)
  banner_color: string;

  @ApiProperty({ example: 'I love matcha', description: 'User bio' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio: string;
}
