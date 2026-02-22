import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateUserTeaDto } from './create-user-tea.dto';

export class UpdateTeaDto extends PartialType(
  OmitType(CreateUserTeaDto, ['user_id', 'tea_id'] as const),
) {}
