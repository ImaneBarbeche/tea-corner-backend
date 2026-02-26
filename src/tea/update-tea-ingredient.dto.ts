import { IsInt, Min } from 'class-validator';

export class UpdateTeaIngredientDto {
  @IsInt()
  @Min(1)
  quantity: number;
}
