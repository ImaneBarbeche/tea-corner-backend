import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { MinLength, IsString, IsEmail, IsEmpty } from 'class-validator';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

export enum status {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DELETED = 'deleted',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn(`uuid`)
  id: number;

  @MinLength(2)
  @IsString()
  @Column('varchar', { length: 30 })
  display_name: string;

  @MinLength(2)
  @IsString()
  @Column('varchar', { length: 30, unique: true })
  user_name: string;

  @Column('text')
  avatar_url: string;

  @Column('varchar', { length: 10 })
  banner_color: string;

  @Column('text')
  bio: string;

  @IsEmail()
  @Column('varchar', { length: 320, unique: true })
  email: string;

  @IsEmpty()
  @MinLength(8)
  @Column('varchar', { length: 255 })
  password;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({
    type: 'enum',
    enum: status,
    default: status.ACTIVE,
  })
  status: status;
}
