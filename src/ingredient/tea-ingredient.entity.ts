import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Ingredient } from './ingredient.entity';
import { Tea } from '../tea/tea.entity';

@Entity('tea_ingredient')
@Unique(['tea', 'ingredient'])
export class TeaIngredient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Ingredient, (ingredient) => ingredient.teaIngredients)
  public ingredient: Ingredient;

  @ManyToOne(() => Tea, (tea) => tea.teaIngredients)
  public tea: Tea;

  @Column('integer') // e.g 5 (grams of mint)
  quantity: number;

  @Column('boolean', { default: false }) // ingredients are optionnal (tea leaves are not considered ingredients)
  optional: boolean;
}
