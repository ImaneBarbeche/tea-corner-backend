import { Injectable, NotFoundException } from '@nestjs/common';
import { FlavourType } from './flavour-type.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class FlavourTypeService {
  constructor(
    @InjectRepository(FlavourType)
    private flavourTypeRepository: Repository<FlavourType>,
  ) {}

  async findAll(): Promise<FlavourType[]> {
    return await this.flavourTypeRepository.find();
  }

  async findOne(id: string): Promise<FlavourType> {
    const flavourType = await this.flavourTypeRepository.findOne({
      where: { id },
    });

    if (!flavourType) {
      throw new NotFoundException(`Flavour type with ID ${id} not found`);
    }
    return flavourType;
  }
}
