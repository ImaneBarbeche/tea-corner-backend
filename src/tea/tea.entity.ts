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
import { User } from 'src/user/user.entity';
import { TeaType } from 'src/enums/teaType.enum';
import { caffeineLevel } from 'src/enums/caffeineLevel.enum';
import { TeaStyle } from 'src/tea-style/tea-style.entity';

@Entity()
export class Tea {
  @PrimaryGeneratedColumn('uuid') // if uuid is used, id cannot be a number, it should be a string
  id: string;

  @ManyToOne(() => User, (user) => user.teas, { nullable: true })
  @JoinColumn({ name: 'author_id' })
  author: User;

  @Column('varchar', { length: 30 })
  name: string;

  @Column({
    type: 'enum',
    enum: TeaType,
    default: TeaType.Herbal,
  })
  type: TeaType;

  @ManyToOne(() => TeaStyle, (style) => style.teas)
  style: TeaStyle;

  @Column('text', { nullable: true })
  description: string;

  @Column('varchar', { length: 10, nullable: true })
  custom_color: string;

  @Column('varchar', { length: 10, nullable: true })
  custom_brew_color: string;

  @Column('text', { nullable: true })
  instructions: string;

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

  @Column({
    type: 'enum',
    enum: caffeineLevel,
    default: caffeineLevel.None,
  })
  caffeine_level: caffeineLevel;

  @Column('text', { nullable: true })
  source: string;

  @Column('boolean', { default: false })
  is_public: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  modified_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;
}
