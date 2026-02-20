import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserTea } from './user-tea.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserTeaService {
  constructor(
    @InjectRepository(UserTea)
    private UserTeaRepository: Repository<UserTea>,
  ) {}

  async findAll(): Promise<UserTea[]> {
    return await this.UserTeaRepository.find();
  }

  async findOne(id: string): Promise<UserTea | null> {
    return await this.UserTeaRepository.findOneBy({ id: id });
  }
}
