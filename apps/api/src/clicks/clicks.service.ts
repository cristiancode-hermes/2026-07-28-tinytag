import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Click } from './entities/click.entity';
import { Link } from '../links/entities/link.entity';

@Injectable()
export class ClicksService {
  constructor(
    @InjectRepository(Click)
    private readonly clickRepo: Repository<Click>,
    @InjectRepository(Link)
    private readonly linkRepo: Repository<Link>,
    private readonly dataSource: DataSource,
  ) {}

  async recordClick(
    linkId: string,
    ip: string,
    userAgent: string,
    referrer: string,
  ): Promise<void> {
    const device = this.parseDevice(userAgent);
    const browser = this.parseBrowser(userAgent);

    // Check dedup: same IP + same user agent within last 5 minutes
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const recentClick = await this.dataSource.query(
      `SELECT id FROM clicks WHERE "linkId" = ? AND ip = ? AND userAgent = ? AND timestamp >= datetime(?, '-5 minutes') LIMIT 1`,
      [linkId, ip, userAgent, new Date().toISOString()],
    );

    const isUnique = recentClick.length === 0;

    const click = this.clickRepo.create({
      linkId,
      ip,
      userAgent: userAgent || null,
      referrer: referrer || null,
      device,
      browser,
      isUnique,
    } as any);

    await this.clickRepo.save(click);

    // Update link counters
    await this.linkRepo.increment({ id: linkId }, 'clickCount', 1);
    if (isUnique) {
      await this.linkRepo.increment({ id: linkId }, 'uniqueClickCount', 1);
    }
  }

  async getClicks(
    linkId: string,
    page: number = 1,
    limit: number = 50,
    from?: string,
    to?: string,
  ) {
    const skip = (page - 1) * limit;

    const queryBuilder = this.clickRepo
      .createQueryBuilder('click')
      .where('click.linkId = :linkId', { linkId })
      .orderBy('click.timestamp', 'DESC')
      .skip(skip)
      .take(limit);

    if (from) {
      queryBuilder.andWhere('click.timestamp >= :from', { from });
    }
    if (to) {
      queryBuilder.andWhere('click.timestamp <= :to', { to });
    }

    const [items, total] = await queryBuilder.getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  private parseDevice(userAgent: string): string {
    if (!userAgent) return 'desktop';
    const ua = userAgent.toLowerCase();
    if (/(android|iphone|ipad|ipod|mobile)/.test(ua)) return 'mobile';
    if (/(tablet|ipad)/.test(ua)) return 'tablet';
    return 'desktop';
  }

  private parseBrowser(userAgent: string): string {
    if (!userAgent) return 'Unknown';
    const ua = userAgent.toLowerCase();
    if (ua.includes('edge') || ua.includes('edg/')) return 'Edge';
    if (ua.includes('chrome') && !ua.includes('chromium')) return 'Chrome';
    if (ua.includes('firefox') && !ua.includes('seamonkey')) return 'Firefox';
    if (ua.includes('safari') && !ua.includes('chrome')) return 'Safari';
    if (ua.includes('opera') || ua.includes('opr/')) return 'Opera';
    return 'Other';
  }
}
