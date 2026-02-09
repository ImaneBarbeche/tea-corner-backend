import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @MinLength(2)
  @MaxLength(30)
  @IsString()
  display_name: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  avatar_url: string;

  @IsOptional()
  @IsString()
  @MinLength(7)
  @MaxLength(7)
  banner_color: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio: string;
}
