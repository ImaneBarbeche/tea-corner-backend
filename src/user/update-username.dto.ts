import { IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateUsernameDto {
  @MinLength(2)
  @MaxLength(30)
  @IsString()
  user_name: string;
}
