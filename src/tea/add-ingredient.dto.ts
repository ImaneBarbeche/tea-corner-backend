import { IsBoolean, IsInt, IsOptional, IsUUID, Min } from 'class-validator';

export class AddIngredientDto {
  @IsUUID()
  ingredientId: string; // references the existing ingredient

  @IsInt()
  @Min(1)
  quantity: number;

  @IsBoolean()
  @IsOptional()
  optional?: boolean;
}
