import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateIngredientDto } from './create-ingredient.dto';

export class UpdateIngredientDto extends PartialType(OmitType(CreateIngredientDto, [ 'user_id' ] as const)
  
){}