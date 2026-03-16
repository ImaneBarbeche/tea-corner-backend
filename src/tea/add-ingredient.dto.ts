import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsUUID, Min } from 'class-validator';

export class AddIngredientDto {
  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'ID of the existing ingredient to add to the tea',
  })
  @IsUUID()
  ingredientId: string;

  @ApiProperty({ example: 3, description: 'Quantity of the ingredient' })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiProperty({
    example: false,
    description: 'Whether the ingredient is optional in the recipe',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  optional?: boolean;
}
