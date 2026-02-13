import { InjectRepository } from '@nestjs/typeorm';
import { Tea } from './tea.entity';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { createTeaDto } from './create-tea.dto';

@Injectable()
export class TeaService {
  constructor(
    @InjectRepository(Tea)
    private teaRepository: Repository<Tea>,
  ) {}

  findAll(): Promise<Tea[]> {
    return this.teaRepository.find();
  }

  findOne(id: string): Promise<Tea | null> {
    return this.teaRepository.findOneBy({ id });
  }

  async remove(id: string): Promise<void> {
    await this.teaRepository.delete(id);
  }

  async create(createTeaDto: createTeaDto): Promise<Tea> {
    const tea = this.teaRepository.create(createTeaDto);

    return await this.teaRepository.save(tea);
  }
}
