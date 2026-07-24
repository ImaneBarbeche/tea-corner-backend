// create-brew-log-flavour-profile.dto.ts
import { IsUUID } from 'class-validator';

export class CreateBrewLogFlavourProfileDto {
  @IsUUID()
  flavour_profile_id: string;
}
