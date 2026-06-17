import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class CreateBrewLogDto {
  @ApiProperty({
    example: '1234',
    description: 'The tea being logged',
  })
  @IsUUID()
  tea_id: string;

  @ApiProperty({
    example: '120',
    description: 'Brewing time (in seconds)',
  })
  @IsInt()
  @Min(0)
  brewing_time: number;

  @ApiProperty({
    example: '80',
    description: 'Brewing temperature (in celsius)',
  })
  @IsInt()
  @Min(0)
  brewing_temperature: number;

  @ApiProperty({
    example: '4',
    description: 'Amount of tea leaves (in grams)',
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  leaf_amount?: number;

  @ApiProperty({
    example: '150',
    description: 'Amount of water (in mls)',
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  water_amount?: number;

  @ApiProperty({
    example: '4',
    description: 'Star rating (e.g 4 out of 5)',
  })
  @IsInt()
  @Min(0)
  @Max(5)
  @IsOptional()
  rating?: number;

  @ApiProperty({
    example: 'Very floral. I would definitely drink it again',
    description: "The user's thoughts on a brew",
  })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({
    example: 'true',
    description:
      'Whether the user focused (meditated) during the making of the tea',
  })
  @IsBoolean()
  @IsOptional()
  focused?: boolean;

  @ApiProperty({
    example: 'false',
    description: 'Whether the entry is public or not',
  })
  @IsBoolean()
  @IsOptional()
  is_public?: boolean;
}
