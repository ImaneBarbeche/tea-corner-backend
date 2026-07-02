import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Tea } from '../tea/tea.entity';
import { User } from '../user/user.entity';
import { IsInt, Max, Min } from 'class-validator';
import { BrewLogTaste } from './brew-log-taste.entity';

@Entity()
export class BrewLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Tea, (tea) => tea.logs, {
    nullable: true,
  })
  @JoinColumn({ name: 'tea_id' })
  tea: Tea;

  @ManyToOne(() => User, (user) => user.logs, {
    nullable: true,
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column('integer')
  //   seconds by default
  brewing_time: number;

  @Column('integer')
  //   celsius by default
  brewing_temperature: number;

  @Column('integer', { nullable: true })
  //   grams by default
  // null in case the user doesn't have a recommended amount
  leaf_amount: number;

  @Column('integer', { nullable: true })
  //   ml by default
  // null in case the user doesn't have a recommended amount
  water_amount: number;

  @Column('integer', { nullable: true })
  rating: number;

  @Column('text', {
    nullable: true,
  })
  notes: string;

  @OneToMany(() => BrewLogTaste, (brewLogTaste) => brewLogTaste.brew_log)
  // optional by default (e.g returns an empty array)
  tastes: BrewLogTaste[];

  @Column('boolean', { default: false })
  focused: boolean;

  @Column('boolean', { default: false })
  is_public: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  modified_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;
}
