import { Injectable, NotFoundException } from '@nestjs/common';
import { FlavourProfile } from './flavour-profile.entity';
import { ILike, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class FlavourProfileService {
  constructor(
    @InjectRepository(FlavourProfile)
    private flavourProfileRepository: Repository<FlavourProfile>,
  ) {}

  async findAll(flavourTypeName?: string): Promise<FlavourProfile[]> {
    return await this.flavourProfileRepository.find({
      where: flavourTypeName
        ? { flavourType: { name: ILike(`%${flavourTypeName}%`) } }
        : {},
      relations: ['flavourType'],
    });
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
