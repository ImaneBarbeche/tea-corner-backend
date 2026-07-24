import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BrewLog } from './brew-log.entity';
import { Repository } from 'typeorm';
import { CreateBrewLogDto } from './create-brew-log.dto';
import { UpdateBrewLogDto } from './update-brew-log.dto';
import { TeaService } from '../tea/tea.service';
import { BrewLogTaste } from './brew-log-taste.entity';
import { BrewLogFlavourProfile } from './brew-log-flavour-prifle';

@Injectable()
export class BrewLogService {
  constructor(
    @InjectRepository(BrewLog)
    private brewLogRepository: Repository<BrewLog>,
    @InjectRepository(BrewLogTaste)
    private brewLogTasteRepository: Repository<BrewLogTaste>,
    @InjectRepository(BrewLogFlavourProfile)
    private brewLogFlavourProfileRepository: Repository<BrewLogFlavourProfile>,
    private teaService: TeaService,
  ) {}

  // admin
  async findAll(): Promise<BrewLog[]> {
    return await this.brewLogRepository.find({
      relations: ['tea', 'tea.style', 'tea.author', 'user', 'tastes'],
    });
  }

  async findPublicBrewLogs(
    page: number = 1,
    limit: number = 20,
  ): Promise<BrewLog[]> {
    return this.brewLogRepository.find({
      where: {
        is_public: true,
      },
      relations: ['tea', 'tea.style', 'tea.author', 'user', 'tastes'],
      take: limit,
      skip: (page - 1) * limit,
      order: { created_at: 'DESC' },
    });
  }

  async findUserBrewLogs(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<BrewLog[]> {
    const userLogs = await this.brewLogRepository.find({
      where: { user: { id: userId } },
      relations: ['tea', 'tea.style', 'tea.author', 'tastes'],
      take: limit,
      skip: (page - 1) * limit,
      order: { created_at: 'DESC' },
    });

    return userLogs;
  }

  async create(dto: CreateBrewLogDto, userId: string): Promise<BrewLog> {
    // checking whether the tea exists and whether the user has access to it
    const tea = await this.teaService.findOne(dto.tea_id, userId);

    if (!tea) {
      throw new NotFoundException(`tea with ID ${dto.tea_id} not found`);
    }

    const { tastes, flavour_profiles, ...brewLogData } = dto;

    const log = this.brewLogRepository.create({
      ...brewLogData,
      tea: { id: dto.tea_id },
    });
    const saved = await this.brewLogRepository.save(log);

    if (tastes?.length) {
      const brewLogTastes = tastes.map((t) =>
        this.brewLogTasteRepository.create({
          brew_log: { id: saved.id },
          taste: t.taste,
          intensity: t.intensity,
        }),
      );
      await this.brewLogTasteRepository.save(brewLogTastes);
    }

    if (flavour_profiles?.length) {
      const bfp = flavour_profiles.map((f) =>
        this.brewLogFlavourProfileRepository.create({
          brew_log: { id: saved.id },
          flavour_profile: { id: f.flavour_profile_id },
        }),
      );
      await this.brewLogFlavourProfileRepository.save(bfp);
    }

    return (await this.brewLogRepository.findOne({
      where: { id: saved.id },
      relations: [
        'tea',
        'tea.style',
        'tea.author',
        'tastes',
        'flavour_profiles',
        'flavour_profiles.flavour_profile',
      ],
    }))!;
  }

  async update(
    id: string,
    dto: UpdateBrewLogDto,
    userId: string,
  ): Promise<BrewLog> {
    const brewLog = await this.brewLogRepository.findOne({
      where: { id, user: { id: userId } },
      // relations: ['tea', 'tea.style', 'tea.author'],
    });

    if (!brewLog) {
      throw new NotFoundException(`brew log with ID ${id} could not be found`);
    }

    const { tastes, flavour_profiles, ...brewLogData } = dto;

    Object.assign(brewLog, brewLogData);

    await this.brewLogRepository.save(brewLog);

    if (tastes) {
      await this.brewLogTasteRepository.delete({ brew_log: { id } });
      if (tastes.length) {
        const brewLogTastes = tastes.map((t) =>
          this.brewLogTasteRepository.create({
            brew_log: { id },
            taste: t.taste,
            intensity: t.intensity,
          }),
        );
        await this.brewLogTasteRepository.save(brewLogTastes);
      }
    }

    if (flavour_profiles) {
      await this.brewLogFlavourProfileRepository.delete({ brew_log: { id } });
      if (flavour_profiles.length) {
        const bfp = flavour_profiles.map((f) =>
          this.brewLogFlavourProfileRepository.create({
            brew_log: { id },
            flavour_profile: { id: f.flavour_profile_id },
          }),
        );
        await this.brewLogFlavourProfileRepository.save(bfp);
      }
    }

    return (await this.brewLogRepository.findOne({
      where: { id },
      relations: [
        'tea',
        'tea.style',
        'tea.author',
        'tastes',
        'flavour_profiles',
        'flavour_profiles.flavour_profile',
      ],
    }))!;
  }

  async remove(id: string, userId: string): Promise<void> {
    const brewLog = await this.brewLogRepository.findOne({
      where: { id, user: { id: userId } },
    });
    if (!brewLog)
      throw new NotFoundException(`brew log with ID ${id} could not be found`);
    await this.brewLogRepository.softDelete(id);
  }
}

// For the brew logs
// Admin: find all ✅
// find all public ones (by all users, for the discovery page) (remember to add a limit) ✅
// find all by user (personal entries) ✅
// Find one? Only in case we add a system where you can comment etc where it would help to be able to show just one log.
// add one ✅
// Update one ✅
// Delete one ✅
