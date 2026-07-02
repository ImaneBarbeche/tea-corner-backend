import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BrewLog } from './brew-log.entity';
import { TasteType } from '../enums/tasteType.enum';
import { IsEnum, isEnum } from 'class-validator';
import { caffeineLevel } from '../enums/caffeineLevel.enum';

@Entity()
@Index(['brew_log', 'taste'], { unique: true })
export class BrewLogTaste {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => BrewLog, (brewLog) => brewLog.tastes, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'brew_log_id' })
  brew_log: BrewLog;

  @Column({
    type: 'enum',
    enum: TasteType,
  })
  @IsEnum(TasteType)
  taste: TasteType;

  @Column({
    type: 'enum',
    enum: caffeineLevel,
    default: caffeineLevel.None,
  })
  @IsEnum(caffeineLevel)
  intensity: caffeineLevel;
}
