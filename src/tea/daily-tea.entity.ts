import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Tea } from './tea.entity';

@Entity()
export class DailyTea {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date', unique: true })
  date: string;

  @ManyToOne(() => Tea)
  @JoinColumn({ name: 'tea_id' })
  tea: Tea;

  @CreateDateColumn()
  created_at: Date;
}
