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
import { User } from '../user/user.entity';
import { IngredientType } from '../enums/ingredientType.enum';

@Entity()
export class Ingredient {
  @PrimaryGeneratedColumn('uuid') 
  id: string;

  @ManyToOne(() => User, (user) => user.ingredients, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column('varchar', { length: 50 })
  name: string;

  @Column({
    type: 'enum',
    enum: IngredientType,
    default: IngredientType.TeaLeaf
  })
  type: IngredientType;

  @Column('varchar', { length: 10, nullable: true })
  color: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  modified_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;
}
