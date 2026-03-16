import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MinLength,
} from 'class-validator';
import { IngredientType } from '../enums/ingredientType.enum';

export class CreateIngredientDto {
  @ApiProperty({
    example: '1234',
    description:
      'The user who created the ingredient. If null, the ingredient is a system ingredient (admin only).',
    nullable: true,
  })
  @IsUUID()
  @IsOptional()
  user_id?: string;

  @ApiProperty({ example: 'lemon', description: 'Ingredient name' })
  @MinLength(2)
  @IsString()
  @Matches(/^[a-zA-Z\s]+$/, {
    message: 'name must only contain letters and spaces',
  })
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
