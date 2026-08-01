import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('api_keys')
export class ApiKey {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, user => user.apiKeys)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ length: 100 })
  name: string;

  @Column()
  keyHash: string;

  @Column({ nullable: true, type: 'datetime' })
  lastUsedAt: Date;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;
}
