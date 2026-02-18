import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { FlavourType } from '../flavour-type/flavour-type.entity';

@Entity('flavour_profile')
export class FlavourProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => FlavourType, (type) => type.profiles, {
    nullable: false, 
  })
  @JoinColumn({ name: 'flavour_type_id' })
  flavourType: FlavourType;

  @Column('varchar', { length: 30 })
  name: string; // e.g rose

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  modified_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;
}
