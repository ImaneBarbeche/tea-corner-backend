import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('email_verification_tokens')
export class EmailVerificationToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 500, unique: true })
  email_token: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'timestamp' })
  expires_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @Column({ default: false })
  used: boolean
}
