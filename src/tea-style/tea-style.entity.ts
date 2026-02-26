import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { TeaType } from '../enums/teaType.enum';
import { Tea } from '../tea/tea.entity';

@Entity()
export class TeaStyle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 30 })
  name: string;

  @Column('text')
  description: string;

  @Column('varchar', { length: 10 })
  color: string;

  @Column({
    type: 'enum',
    enum: TeaType,
    default: TeaType.Herbal,
  })
  type: TeaType;

  @OneToMany(() => Tea, (tea) => tea.style)
  teas: Tea[];
}
