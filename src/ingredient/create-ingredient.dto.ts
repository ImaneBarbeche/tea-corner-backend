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
import { IngredientType } from '../enums/ingredientType.enum';

export class CreateIngredientDto {
  @ApiProperty({
    example: '1234',
    description: 'The user (or admin) who created the tea',
  })
  @IsUUID()
  @IsOptional()
  user_id?: string;

  @ApiProperty({ example: 'lemon', description: 'Ingredient name' })
  @MinLength(2)
  @IsString()
  name: string;

  @ApiProperty({ example: 'fruit', description: 'ingredient type' })
  @IsEnum(IngredientType)
  type: IngredientType;

  @ApiProperty({
    example: '#3EB489',
    description: 'Custom color for the ingredient',
  })
  @IsString()
  @IsOptional()
  color: string;
}
