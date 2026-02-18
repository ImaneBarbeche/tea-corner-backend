import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import {FlavourProfile}  from '../flavour-profile/flavour-profile.entity';

@Entity('flavour_type')
export class FlavourType {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 30 })
  name: string; // e.g floral

  @Column('varchar', { length: 10, nullable: true })
  color: string;

  @OneToMany(() => FlavourProfile, (profile) => profile.flavourType)
  profiles: FlavourProfile[];

}
