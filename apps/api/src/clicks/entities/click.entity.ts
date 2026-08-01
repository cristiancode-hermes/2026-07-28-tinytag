import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Link } from '../../links/entities/link.entity';

@Entity('clicks')
export class Click {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  linkId: string;

  @ManyToOne(() => Link, link => link.clicks)
  @JoinColumn({ name: 'linkId' })
  link: Link;

  @CreateDateColumn({ type: 'datetime' })
  timestamp: Date;

  @Column({ length: 45 })
  ip: string;

  @Column({ nullable: true, type: 'text' })
  userAgent: string;

  @Column({ nullable: true, type: 'text' })
  referrer: string;

  @Column({ nullable: true, length: 100 })
  country: string;

  @Column({ nullable: true, length: 2 })
  countryCode: string;

  @Column({ length: 20, default: 'desktop' })
  device: string;

  @Column({ nullable: true, length: 50 })
  browser: string;

  @Column({ default: true })
  isUnique: boolean;
}
