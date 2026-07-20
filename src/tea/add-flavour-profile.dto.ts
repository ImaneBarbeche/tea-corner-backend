import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class AddFlavourProfileDto {
  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'ID of the existing flavour profile to add to the tea',
  })
  @IsUUID()
  flavourProfileId: string;
}
