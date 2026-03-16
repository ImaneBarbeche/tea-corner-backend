import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class UpdateTeaIngredientDto {
  @ApiProperty({
    example: 5,
    description: 'Updated quantity of the ingredient',
  })
  @IsInt()
  @Min(1)
  quantity: number;
}
