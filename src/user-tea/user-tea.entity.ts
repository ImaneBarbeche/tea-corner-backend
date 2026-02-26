import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../user/user.entity';
import { Tea } from '../tea/tea.entity';

@Entity()
@Index(['user', 'tea'], { unique: true })
export class UserTea {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.userTeas)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Tea, (tea) => tea.userTeas)
  @JoinColumn({ name: 'tea_id' })
  tea: Tea;

  @Column('float', { nullable: true })
  // in grams
  inventory_amount: number;

  @Column('integer', { nullable: true })
  //   seconds by default
  custom_brewing_time: number;

  @Column('integer', { nullable: true })
  //   celsius by default
  custom_brewing_temperature: number;

  @Column('integer', { nullable: true })
  //   grams by default
  // null in case the user doesn't have a recommended amount
  custom_leaf_amount: number;

  @Column('integer', { nullable: true })
  //   ml by default
  custom_water_amount: number;

  @Column('text', { nullable: true })
  notes: string;

  // added_at timestamp [default: "now()"]

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  modified_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;
}
