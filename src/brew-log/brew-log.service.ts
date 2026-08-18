import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BrewLog } from './brew-log.entity';
import { Repository } from 'typeorm';
import { CreateBrewLogDto } from './create-brew-log.dto';
import { UpdateBrewLogDto } from './update-brew-log.dto';
import { TeaService } from '../tea/tea.service';
import { BrewLogTaste } from './brew-log-taste.entity';
import { BrewLogFlavourProfile } from './brew-log-flavour-profile';
import { BrewLogResponseDto } from './brew-log-response.dto';

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
  ): Promise<BrewLogResponseDto[]> {
    const logs = await this.brewLogRepository.find({
      where: {
        is_public: true,
      },
      relations: [
        'tea',
        'tea.style',
        'tea.author',
        'user',
        'tastes',
        'flavour_profiles',
        'flavour_profiles.flavour_profile',
        'flavour_profiles.flavour_profile.flavourType',
      ],
      take: limit,
      skip: (page - 1) * limit,
      order: { created_at: 'DESC' },
    });
    return logs.map((log) => this.toResponseDto(log));
  }

  async findUserBrewLogs(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<BrewLogResponseDto[]> {
    const logs = await this.brewLogRepository.find({
      where: { user: { id: userId } },
      relations: [
        'tea',
        'tea.style',
        'tea.author',
        'tastes',
        'flavour_profiles',
        'flavour_profiles.flavour_profile',
        'flavour_profiles.flavour_profile.flavourType',
      ],
      take: limit,
      skip: (page - 1) * limit,
      order: { created_at: 'DESC' },
    });

    return logs.map((log) => this.toResponseDto(log));
  }

  private toResponseDto(log: BrewLog): BrewLogResponseDto {
    return {
      id: log.id,
      brewing_time: log.brewing_time,
      brewing_temperature: log.brewing_temperature,
      leaf_amount: log.leaf_amount,
      water_amount: log.water_amount,
      rating: log.rating,
      notes: log.notes,
      focused: log.focused,
      is_public: log.is_public,
      created_at: log.created_at,
      tea: {
        id: log.tea.id,
        name: log.tea.name,
        type: log.tea.type,
        custom_color: log.tea.custom_color,
        custom_brew_color: log.tea.custom_brew_color,
        style: log.tea.style
          ? {
              id: log.tea.style.id,
              name: log.tea.style.name,
              color: log.tea.style.color,
            }
          : null,
      },
      tastes:
        log.tastes?.map((t) => ({
          id: t.id,
          taste: t.taste,
          intensity: t.intensity,
        })) ?? [],
      flavour_profiles:
        log.flavour_profiles?.map((fp) => ({
          id: fp.id,
          flavour_profile: {
            id: fp.flavour_profile?.id,
            name: fp.flavour_profile?.name,
            flavourType: fp.flavour_profile?.flavourType
              ? {
                  color: fp.flavour_profile.flavourType.color,
                }
              : null,
          },
        })) ?? [],
      user: log.user
        ? {
            display_name: log.user.display_name,
            user_name: log.user.user_name,
            avatar_url: log.user.avatar_url,
          }
        : null,
    };
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
