import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateBrewLogDto } from './create-brew-log.dto';

export class UpdateBrewLogDto extends PartialType(
  // TODO: Should people be able to change the tea of a brew log? Maybe
  OmitType(CreateBrewLogDto, ['tea_id'] as const),
) {}
