import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Tag } from './entities/tag.entity';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag)
    private readonly tagRepo: Repository<Tag>,
    private readonly dataSource: DataSource,
  ) {}

  async create(userId: string, name: string, color?: string): Promise<Tag> {
    const tag = this.tagRepo.create({
      userId,
      name: name,
      color: color || null,
    } as any);
    const saved = (await this.tagRepo.save(tag)) as unknown as Tag;
    return saved;
  }

  async findAll(userId: string) {
    const tags = await this.tagRepo.find({
      where: { userId },
      relations: { links: true },
      order: { name: 'ASC' },
    });

    return Promise.all(
      tags.map(async (tag) => {
        const linkCount = tag.links.length;

        let totalClicks = 0;
        if (linkCount > 0) {
          const linkIds = tag.links.map(l => l.id);
          const placeholders = linkIds.map(() => '?').join(',');
          const result = await this.dataSource.query(
            `SELECT COALESCE(SUM("clickCount"), 0) as count FROM links WHERE id IN (${placeholders})`,
            linkIds,
          );
          totalClicks = Number(result[0]?.count || 0);
        }

        return {
          id: tag.id,
          userId: tag.userId,
          name: tag.name,
          color: tag.color,
          createdAt: tag.createdAt,
          linkCount,
          totalClicks,
        };
      }),
    );
  }

  async findById(id: string, userId: string): Promise<any> {
    const tag = await this.tagRepo.findOne({
      where: { id, userId },
      relations: { links: true },
    });

    if (!tag) {
      throw new NotFoundException('Tag not found');
    }

    const linkCount = tag.links.length;
    let totalClicks = 0;
    if (linkCount > 0) {
      const linkIds = tag.links.map(l => l.id);
      const placeholders = linkIds.map(() => '?').join(',');
      const result = await this.dataSource.query(
        `SELECT COALESCE(SUM("clickCount"), 0) as count FROM links WHERE id IN (${placeholders})`,
        linkIds,
      );
      totalClicks = Number(result[0]?.count || 0);
    }

    return {
      id: tag.id,
      userId: tag.userId,
      name: tag.name,
      color: tag.color,
      createdAt: tag.createdAt,
      linkCount,
      totalClicks,
    };
  }

  async update(id: string, userId: string, name?: string, color?: string): Promise<Tag> {
    const tag = await this.tagRepo.findOne({ where: { id, userId } });
    if (!tag) {
      throw new NotFoundException('Tag not found');
    }

    if (name !== undefined) tag.name = name;
    if (color !== undefined) tag.color = color;

    const saved = (await this.tagRepo.save(tag)) as unknown as Tag;
    return saved;
  }

  async delete(id: string, userId: string): Promise<void> {
    const tag = await this.tagRepo.findOne({ where: { id, userId } });
    if (!tag) {
      throw new NotFoundException('Tag not found');
    }
    await this.tagRepo.remove(tag);
  }
}
