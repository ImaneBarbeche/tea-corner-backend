import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TeaStyle } from './tea-style.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TeaStyleService {
  constructor(
    @InjectRepository(TeaStyle)
    private teaStyleRepository: Repository<TeaStyle>,
  ) {}

  async findAll(): Promise<TeaStyle[]> {
    return await this.teaStyleRepository.find();
  }

  async findOne(id: string): Promise<TeaStyle | null> {
    return await this.teaStyleRepository.findOneBy({ id: id });
  }
}
