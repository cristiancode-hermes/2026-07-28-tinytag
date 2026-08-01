import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Link } from '../../links/entities/link.entity';
import { Campaign } from '../../campaigns/entities/campaign.entity';
import { ApiKey } from '../../api-keys/entities/api-key.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ length: 100 })
  name: string;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;

  @OneToMany(() => Link, link => link.user)
  links: Link[];

  @OneToMany(() => Campaign, campaign => campaign.user)
  campaigns: Campaign[];

  @OneToMany(() => ApiKey, apiKey => apiKey.user)
  apiKeys: ApiKey[];
}
