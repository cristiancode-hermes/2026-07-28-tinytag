import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, ManyToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Link } from '../../links/entities/link.entity';

@Entity('tags')
export class Tag {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ length: 50 })
  name: string;

  @Column({ nullable: true, length: 7 })
  color: string;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @ManyToMany(() => Link, link => link.tags)
  links: Link[];
}
