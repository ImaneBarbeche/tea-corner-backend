import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateTeaDto } from './create-tea.dto';

// export class UpdateTeaDto extends PartialType(CreateTeaDto, ['author_id'] as const) {}

export class UpdateTeaDto extends OmitType(CreateTeaDto, [
  'author_id',
] as const) {}
