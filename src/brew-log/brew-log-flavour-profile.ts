import {
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BrewLog } from './brew-log.entity';
import { FlavourProfile } from '../flavour-profile/flavour-profile.entity';

@Entity()
@Index(['brew_log', 'flavour_profile'], { unique: true })
export class BrewLogFlavourProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => BrewLog, (brewLog) => brewLog.flavour_profiles, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'brew_log_id' })
  brew_log: BrewLog;

  @ManyToOne(() => FlavourProfile, {
    nullable: false,
  })
  @JoinColumn({ name: 'flavour_profile_id' })
  flavour_profile: FlavourProfile;
}
