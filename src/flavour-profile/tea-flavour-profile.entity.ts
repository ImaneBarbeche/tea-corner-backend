import { Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { FlavourProfile } from './flavour-profile.entity';
import { Tea } from '../tea/tea.entity';

@Entity('tea_flavour_profile')
@Unique(['tea', 'flavourProfile'])
export class TeaFlavourProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(
    () => FlavourProfile,
    (flavourProfile) => flavourProfile.teaFlavourProfiles,
  )
  public flavourProfile: FlavourProfile;

  @ManyToOne(() => Tea, (tea) => tea.teaFlavourProfiles)
  public tea: Tea;
}
