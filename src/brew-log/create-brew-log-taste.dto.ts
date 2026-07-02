import { IsEnum } from 'class-validator';
import { TasteType } from '../enums/tasteType.enum';
import { caffeineLevel } from '../enums/caffeineLevel.enum';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBrewLogTasteDto {
  @ApiProperty({
    example: 'sweet',
    description: 'the taste type of a brew',
  })
  @IsEnum(TasteType)
  taste: TasteType;

  @ApiProperty({
    example: 'low',
    description: 'the intensity of the taste',
  })
  @IsEnum(caffeineLevel)
  intensity: caffeineLevel;
}
