import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { TeaType } from '../enums/teaType.enum';

export class CreateTeaStyleDto {
  @ApiProperty({ example: 'sencha', description: 'Tea style' })
  @MinLength(2)
  @IsString()
  name: string;

  @ApiProperty({
    example:
      "Sencha (煎茶; lit. 'infused tea') is a type of Japanese green tea",
    description: 'Tea style description',
  })
  @IsString()
  @IsOptional()
  description: string;

  @ApiProperty({ example: 'green', description: 'Tea type' })
  @IsEnum(TeaType)
  type: TeaType;

  @ApiProperty({
    example: '#67d69d',
    description: 'Color for the tea card',
  })
  @IsString()
  @IsOptional()
  color: string;
}
