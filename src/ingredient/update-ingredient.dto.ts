import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { IngredientType } from '../enums/ingredientType.enum';

export class UpdateIngredientDto {
  @ApiProperty({ example: 'lemon', description: 'Ingredient name' })
  @MinLength(2)
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: 'fruit', description: 'ingredient type' })
  @IsEnum(IngredientType)
  @IsOptional()
  type?: IngredientType;

  @ApiProperty({
    example: '#3EB489',
    description: 'Custom color for the ingredient',
  })
  @IsString()
  @IsOptional()
  color?: string;
}