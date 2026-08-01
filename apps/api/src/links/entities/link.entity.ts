import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Campaign } from '../../campaigns/entities/campaign.entity';
import { Tag } from '../../tags/entities/tag.entity';
import { Click } from '../../clicks/entities/click.entity';

@Entity('links')
export class Link {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, user => user.links)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ nullable: true })
  campaignId: string;

  @ManyToOne(() => Campaign, campaign => campaign.links)
  @JoinColumn({ name: 'campaignId' })
  campaign: Campaign;

  @Column({ unique: true, length: 20 })
  alias: string;

  @Column({ type: 'text' })
  originalUrl: string;

  @Column({ nullable: true, type: 'datetime' })
  expiresAt: Date;

  @Column({ default: 0 })
  clickCount: number;

  @Column({ default: 0 })
  uniqueClickCount: number;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;

  @OneToMany(() => Click, click => click.link)
  clicks: Click[];

  @ManyToMany(() => Tag, tag => tag.links)
  @JoinTable({ name: 'link_tags', joinColumn: { name: 'linkId', referencedColumnName: 'id' }, inverseJoinColumn: { name: 'tagId', referencedColumnName: 'id' } })
  tags: Tag[];
}
