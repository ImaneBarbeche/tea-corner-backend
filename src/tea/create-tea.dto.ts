import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  MinLength,
} from 'class-validator';
import { caffeineLevel } from 'src/enums/caffeineLevel.enum';
import { TeaType } from 'src/enums/teaType.enum';

export class createTeaDto {
  @ApiProperty({
    example: '1234',
    description: 'The user (or admin) who created the tea',
  })
  @IsUUID()
  @IsOptional()
  author_id?: string;

  @ApiProperty({ example: 'matcha', description: 'Tea name' })
  @MinLength(2)
  @IsString()
  name: string;

  @ApiProperty({ example: 'green', description: 'Tea type' })
  @IsEnum(TeaType)
  type: TeaType;

  @ApiProperty({ example: '124', description: 'Tea style ID' })
  @IsUUID()
  @IsOptional()
  style_id?: string;

  @ApiProperty({
    example: 'An aromatic tea found in the mountains of Crete',
    description: 'Tea description',
  })
  @IsString()
  @IsOptional()
  description: string;

  @ApiProperty({
    example: '#3EB489',
    description: 'Custom color for the tea card',
  })
  @IsString()
  @IsOptional()
  custom_color: string;

  @ApiProperty({ example: '#7a4920', description: 'Custom brew color' })
  @IsString()
  @IsOptional()
  custom_brew_color: string;

  @ApiProperty({
    example: 'Avoid using boiling water',
    description: 'Brew instructions',
  })
  @IsString()
  @IsOptional()
  instructions: string;

  @ApiProperty({
    example: '120',
    description: 'Brewing time (in seconds)',
  })
  @IsInt()
  @Min(0)
  brewing_time: number;

  @ApiProperty({
    example: '80',
    description: 'Brewing temperature (in celsius)',
  })
  @IsInt()
  @Min(0)
  brewing_temperature: number;

  @ApiProperty({
    example: '4',
    description: 'Amount of tea leaves (in grams)',
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  leaf_amount?: number;

  @ApiProperty({
    example: '150',
    description: 'Amount of water (in mls)',
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  water_amount?: number;

  @ApiProperty({
    example: 'high',
    description: 'Caffeine level',
  })
  @IsEnum(caffeineLevel)
  caffeine_level: caffeineLevel;

  @ApiProperty({
    example: 'Japan / Palais Des Thès',
    description: 'Source of the tea',
  })
  @IsString()
  source: string;

  @IsBoolean()
  @IsOptional()
  is_public?: boolean;
}
