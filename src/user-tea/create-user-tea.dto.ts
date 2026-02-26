import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateUserTeaDto {
  // @ApiProperty({
  //   example: '1234',
  //   description: 'The user adding the custom tea',
  // })
  // @IsUUID()
  // user_id: string;

  @ApiProperty({
    example: '1234',
    description: 'The tea we want to use',
  })
  @IsUUID()
  tea_id: string;

  @ApiProperty({
    example: '150',
    description: 'Amount of tea in inventory (in grams)',
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  inventory_amount?: number;

  @ApiProperty({
    example: '120',
    description: 'Brewing time (in seconds)',
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  custom_brewing_time: number;

  @ApiProperty({
    example: '80',
    description: 'Brewing temperature (in celsius)',
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  custom_brewing_temperature: number;

  @ApiProperty({
    example: '4',
    description: 'Amount of tea leaves (in grams)',
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  custom_leaf_amount?: number;

  @ApiProperty({
    example: '150',
    description: 'Amount of water (in mls)',
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  custom_water_amount?: number;

  @ApiProperty({
    example: 'I was gifted this tea by my friend Emile last summer',
    description: 'A note related to the tea',
  })
  @IsString()
  @IsOptional()
  notes: string;
}
