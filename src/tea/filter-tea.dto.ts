import { IsArray, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { IngredientType } from '../enums/ingredientType.enum';
import { caffeineLevel } from '../enums/caffeineLevel.enum';
import { TeaType } from '../enums/teaType.enum';
import { Transform } from 'class-transformer';

export class FilterTeaDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(TeaType, { each: true })
  @IsArray()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  types?: TeaType[];

  @IsOptional()
  @IsUUID('4', { each: true })
  @IsArray()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  styleIds?: string[];

  @IsOptional()
  @IsUUID('4', { each: true })
  @IsArray()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  ingredientIds?: string[];

  @IsOptional()
  @IsEnum(IngredientType, { each: true })
  @IsArray()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  ingredientTypes?: IngredientType[];

  @IsOptional()
  @IsUUID('4', { each: true })
  @IsArray()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  flavourTypeIds?: string[];

  @IsOptional()
  @IsUUID('4', { each: true })
  @IsArray()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  flavourProfileIds?: string[];

  @IsOptional()
  @IsEnum(caffeineLevel, { each: true })
  @IsArray()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  caffeineLevels?: caffeineLevel[];
}
