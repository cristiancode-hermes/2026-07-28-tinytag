import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In, FindOptionsWhere } from 'typeorm';
import { Link } from './entities/link.entity';
import { Tag } from '../tags/entities/tag.entity';
import { CreateLinkDto } from './dto/create-link.dto';
import { UpdateLinkDto } from './dto/update-link.dto';
import { LinkQueryDto, SortOption } from './dto/link-query.dto';
import { AliasService } from './alias.service';

@Injectable()
export class LinksService {
  constructor(
    @InjectRepository(Link)
    private readonly linkRepo: Repository<Link>,
    @InjectRepository(Tag)
    private readonly tagRepo: Repository<Tag>,
    private readonly aliasService: AliasService,
  ) {}

  async create(userId: string, dto: CreateLinkDto): Promise<Link> {
    let alias = dto.alias;
    if (!alias) {
      alias = await this.aliasService.generateAlias();
    } else {
      const available = await this.aliasService.checkAvailability(alias);
      if (!available) {
        throw new ConflictException('Alias already in use');
      }
    }

    let tags: Tag[] = [];
    if (dto.tagIds && dto.tagIds.length > 0) {
      tags = await this.tagRepo.find({
        where: dto.tagIds.map(id => ({ id, userId }) as FindOptionsWhere<Tag>),
      });
    }

    const link = this.linkRepo.create({
      userId,
      alias,
      originalUrl: dto.originalUrl,
      campaignId: dto.campaignId || null,
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
      tags,
    } as any);

    const saved = (await this.linkRepo.save(link)) as unknown as Link;
    return saved;
  }

  async findAll(userId: string, query: LinkQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = { userId };

    if (query.search) {
      where.originalUrl = Like(`%${query.search}%`);
    }

    if (query.campaignId) {
      where.campaignId = query.campaignId;
    }

    if (query.tagId) {
      where.tags = { id: query.tagId };
    }

    let order: any = { createdAt: 'DESC' };
    if (query.sort === SortOption.CLICKS) {
      order = { clickCount: 'DESC' };
    } else if (query.sort === SortOption.ALIAS) {
      order = { alias: 'ASC' };
    }

    const [items, total] = await this.linkRepo.findAndCount({
      where,
      relations: { campaign: true, tags: true },
      order,
      skip,
      take: limit,
    });

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string, userId: string): Promise<Link> {
    const link = await this.linkRepo.findOne({
      where: { id, userId },
      relations: { campaign: true, tags: true },
    });

    if (!link) {
      throw new NotFoundException('Link not found');
    }

    return link;
  }

  async update(id: string, userId: string, dto: UpdateLinkDto): Promise<Link> {
    const link = await this.findById(id, userId);

    if (dto.alias && dto.alias !== link.alias) {
      const available = await this.aliasService.checkAvailability(dto.alias);
      if (!available) {
        throw new ConflictException('Alias already in use');
      }
      link.alias = dto.alias;
    }

    if (dto.originalUrl) {
      link.originalUrl = dto.originalUrl;
    }

    if (dto.campaignId !== undefined) {
      link.campaignId = dto.campaignId;
    }

    if (dto.expiresAt !== undefined) {
      link.expiresAt = (dto.expiresAt ? new Date(dto.expiresAt) : null) as unknown as Date;
    }

    if (dto.tagIds) {
      const tags = await this.tagRepo.find({
        where: dto.tagIds.map(id => ({ id, userId }) as FindOptionsWhere<Tag>),
      });
      link.tags = tags;
    }

    const saved = (await this.linkRepo.save(link)) as unknown as Link;
    return saved;
  }

  async delete(id: string, userId: string): Promise<void> {
    const link = await this.findById(id, userId);
    await this.linkRepo.remove(link);
  }

  async checkAlias(alias: string): Promise<boolean> {
    return this.aliasService.checkAvailability(alias);
  }

  async incrementClickCount(id: string): Promise<void> {
    await this.linkRepo.increment({ id }, 'clickCount', 1);
  }

  async incrementUniqueClickCount(id: string): Promise<void> {
    await this.linkRepo.increment({ id }, 'uniqueClickCount', 1);
  }
}
