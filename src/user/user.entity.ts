import { Exclude } from 'class-transformer';
import { Role } from '../enums/role.enum';
import {
  Entity,
  Column,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  Timestamp,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';
import { Tea } from 'src/tea/tea.entity';
import { Ingredient } from 'src/ingredient/ingredient.entity';
// import {
//   MinLength,
//   IsString,
//   IsEmail,
//   IsEmpty,
//   IsNotEmpty,
// } from 'class-validator';

// export enum UserRole {
//   USER = 'user',
//   ADMIN = 'admin',
// }

export enum Status {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DELETED = 'deleted',
  ARCHIVED = 'archived',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid') // if uuid is used, id cannot be a number, it should be a string
  id: string;

  @Column('varchar', { length: 30 })
  display_name: string;

  @Column('varchar', { length: 30, unique: true })
  user_name: string;

  @Column('text', { nullable: true })
  avatar_url: string;

  @Column('varchar', { length: 10, default: '#3B82F6' }) // can add a default color if necessary to prevent errors when signup a user
  banner_color: string;

  @Column('text', { nullable: true })
  bio: string;

  @Column('varchar', { length: 320, unique: true })
  email: string;

  @Exclude()
  @Column('text') // if we use a hashing system, password can be longer : either put a higher value to be sure like 500 hundred or put text instead of varchar
  password: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.User,
  })
  role: Role;

  // active by default because different from email verification status
  @Column({
    type: 'enum',
    enum: Status,
    default: Status.ACTIVE,
  })
  status: Status;

  @Column('boolean', { default: false })
  email_verified: boolean;

  @CreateDateColumn({ nullable: true })
  username_last_changed: Date;

  @OneToMany(() => Tea, (tea) => tea.author)
  teas: Tea[];

  @OneToMany(() => Ingredient, (ingredient) => ingredient.user)
  ingredients: Ingredient[];

  // check if this is the correct way to implement it - typeorm would use Date and not timestamp - so createdatecolumn etc would be better probably
  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  modified_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;
}

// validators should only be used in DTO's files not in the entity file!
