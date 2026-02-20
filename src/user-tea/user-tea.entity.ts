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
import { User } from 'src/user/user.entity';
import { Tea } from 'src/tea/tea.entity';

@Entity()
// @Index(['user', 'tea'], { unique: true })
export class UserTea {
  @PrimaryGeneratedColumn('uuid') // if uuid is used, id cannot be a number, it should be a string
  id: string;

  @ManyToOne(() => User, (user) => user.userTeas)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Tea, (tea) => tea.userTeas)
  @JoinColumn({ name: 'tea_id' })
  tea: Tea;

  // inventory_amount float
  // // inventory_unit varchar(20) perhaps not needed

  // // Optional brewing preference overrides
  // custom_brewing_time integer
  // custom_brewing_temperature integer
  // custom_leaf_amount integer
  // custom_water_amount integer

  // // personal note
  // notes text

  // added_at timestamp [default: "now()"]

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  modified_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;
}
