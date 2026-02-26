import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateUserTeaDto } from './create-user-tea.dto';

export class UpdateUserTeaDto extends PartialType(
  // OmitType(CreateUserTeaDto, ['user_id', 'tea_id'] as const),
  OmitType(CreateUserTeaDto, ['tea_id'] as const),
) {}
