import { IsArray, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { IngredientType } from '../enums/ingredientType.enum';
import { caffeineLevel } from '../enums/caffeineLevel.enum';
import { TeaType } from '../enums/teaType.enum';
import { Type } from 'class-transformer';

export class FilterTeaDto {
  @IsOptional()
  @IsArray()
  @Type(() => String)
  @IsEnum(TeaType, { each: true })
  types?: TeaType[];

  @IsOptional()
  @IsArray()
  @Type(() => String)
  @IsUUID('4', { each: true })
  styleIds?: string[];

  @IsOptional()
  @IsArray()
  @Type(() => String)
  @IsUUID('4', { each: true })
  ingredientIds?: string[];

  @IsOptional()
  @IsArray()
  @Type(() => String)
  @Type(() => String)
  @IsEnum(IngredientType, { each: true })
  ingredientTypes?: IngredientType[];

  @IsOptional()
  @IsArray()
  @Type(() => String)
  @IsUUID('4', { each: true })
  flavourTypeIds?: string[];

  @IsOptional()
  @IsArray()
  @Type(() => String)
  @IsUUID('4', { each: true })
  flavourProfileIds?: string[];

  @IsOptional()
  @IsArray()
  @Type(() => String)
  @IsEnum(caffeineLevel, { each: true })
  caffeineLevels?: caffeineLevel[];
}
