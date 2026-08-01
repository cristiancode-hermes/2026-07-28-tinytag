import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, DataSource } from 'typeorm';
import { Campaign } from './entities/campaign.entity';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';

@Injectable()
export class CampaignsService {
  constructor(
    @InjectRepository(Campaign)
    private readonly campaignRepo: Repository<Campaign>,
    private readonly dataSource: DataSource,
  ) {}

  async create(userId: string, dto: CreateCampaignDto): Promise<Campaign> {
    const campaign = this.campaignRepo.create({
      userId,
      name: dto.name,
      description: dto.description || null,
      color: dto.color || null,
    } as any);
    const saved = (await this.campaignRepo.save(campaign)) as unknown as Campaign;
    return saved;
  }

  async findAll(userId: string, search?: string) {
    const where: any = { userId };
    if (search) {
      where.name = Like(`%${search}%`);
    }

    const campaigns = await this.campaignRepo.find({
      where,
      relations: { links: true },
      order: { createdAt: 'DESC' },
    });

    // Attach stats to each campaign
    return Promise.all(
      campaigns.map(async (campaign) => {
        const linkCount = campaign.links.length;

        let totalClicks = 0;
        let uniqueClicks = 0;
        if (linkCount > 0) {
          const result = await this.dataSource.query(
            `SELECT COALESCE(SUM("clickCount"), 0) as total, COALESCE(SUM("uniqueClickCount"), 0) as "unique" FROM links WHERE "campaignId" = ?`,
            [campaign.id],
          );
          totalClicks = Number(result[0]?.total || 0);
          uniqueClicks = Number(result[0]?.unique || 0);
        }

        return {
          ...campaign,
          linkCount,
          totalClicks,
          uniqueClicks,
        };
      }),
    );
  }

  async findById(id: string, userId: string): Promise<any> {
    const campaign = await this.campaignRepo.findOne({
      where: { id, userId },
      relations: { links: true },
    });

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    const linkCount = campaign.links.length;
    let totalClicks = 0;
    let uniqueClicks = 0;
    if (linkCount > 0) {
      const result = await this.dataSource.query(
        `SELECT COALESCE(SUM("clickCount"), 0) as total, COALESCE(SUM("uniqueClickCount"), 0) as "unique" FROM links WHERE "campaignId" = ?`,
        [campaign.id],
      );
      totalClicks = Number(result[0]?.total || 0);
      uniqueClicks = Number(result[0]?.unique || 0);
    }

    return {
      ...campaign,
      linkCount,
      totalClicks,
      uniqueClicks,
    };
  }

  async update(id: string, userId: string, dto: UpdateCampaignDto): Promise<Campaign> {
    const campaign = await this.campaignRepo.findOne({ where: { id, userId } });
    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    if (dto.name !== undefined) campaign.name = dto.name;
    if (dto.description !== undefined) campaign.description = dto.description;
    if (dto.color !== undefined) campaign.color = dto.color;

    const saved = (await this.campaignRepo.save(campaign)) as unknown as Campaign;
    return saved;
  }

  async delete(id: string, userId: string): Promise<void> {
    const campaign = await this.campaignRepo.findOne({ where: { id, userId } });
    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }
    await this.campaignRepo.remove(campaign);
  }

  async getAnalytics(campaignId: string, userId: string, range: '7d' | '30d' | '90d') {
    const campaign = await this.campaignRepo.findOne({
      where: { id: campaignId, userId },
      relations: { links: true },
    });
    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - days);
    const fromStr = dateFrom.toISOString();

    const linkIds = campaign.links.map(l => l.id);
    const linkCount = linkIds.length;

    let totalClicks = 0;
    let uniqueClicks = 0;
    let mobileRate = 0;

    if (linkCount > 0) {
      const placeholders = linkIds.map(() => '?').join(',');
      const params = [...linkIds, fromStr];

      const totalResult = await this.dataSource.query(
        `SELECT COUNT(*) as count FROM clicks WHERE "linkId" IN (${placeholders}) AND timestamp >= ?`,
        params,
      );
      totalClicks = Number(totalResult[0]?.count || 0);

      const uniqueResult = await this.dataSource.query(
        `SELECT COUNT(*) as count FROM clicks WHERE "linkId" IN (${placeholders}) AND isUnique = 1 AND timestamp >= ?`,
        params,
      );
      uniqueClicks = Number(uniqueResult[0]?.count || 0);

      const mobileResult = await this.dataSource.query(
        `SELECT COUNT(*) as count FROM clicks WHERE "linkId" IN (${placeholders}) AND device = 'mobile' AND timestamp >= ?`,
        params,
      );
      const mobileCount = Number(mobileResult[0]?.count || 0);
      mobileRate = totalClicks > 0 ? mobileCount / totalClicks : 0;
    }

    return {
      campaignId,
      campaignName: campaign.name,
      linkCount,
      totalClicks,
      uniqueClicks,
      mobileRate,
    };
  }
}
