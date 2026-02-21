import { Injectable, NotFoundException } from '@nestjs/common';
import { FlavourProfile } from './flavour-profile.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class FlavourProfileService {
    constructor(
        @InjectRepository(FlavourProfile)
        private flavourProfileRepository: Repository<FlavourProfile>,
      ) {}

       async findAll(): Promise<FlavourProfile[]> {
          return await this.flavourProfileRepository.find({relations: ['flavourType']});
        }

        async findOne(id: string): Promise<FlavourProfile> {
            const flavourProfile = await this.flavourProfileRepository.findOne({
              where: { id },
            });
        
            if (!flavourProfile) {
              throw new NotFoundException(`Flavour profile with ID ${id} not found`);
            }
            return flavourProfile;
          }
}
