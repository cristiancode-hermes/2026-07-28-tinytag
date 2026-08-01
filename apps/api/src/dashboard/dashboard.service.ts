import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Link } from '../links/entities/link.entity';
import { Click } from '../clicks/entities/click.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Link)
    private readonly linkRepo: Repository<Link>,
    @InjectRepository(Click)
    private readonly clickRepo: Repository<Click>,
    private readonly dataSource: DataSource,
  ) {}

  async getDashboard(userId: string) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const fromStr = thirtyDaysAgo.toISOString();

    // Total links
    const totalLinks = await this.linkRepo.count({ where: { userId } });

    // Get link IDs for this user
    const userLinks = await this.linkRepo.find({
      where: { userId },
      select: { id: true },
    });
    const linkIds = userLinks.map(l => l.id);

    let totalClicks = 0;
    let uniqueClicks = 0;
    let mobileRate = 0;
    let topCountry: string | null = null;
    const clickTrends: { date: string; clicks: number }[] = [];

    if (linkIds.length > 0) {
      const placeholders = linkIds.map(() => '?').join(',');
      const params = [...linkIds];

      // Total clicks (last 30 days)
      const totalResult = await this.dataSource.query(
        `SELECT COUNT(*) as count FROM clicks WHERE "linkId" IN (${placeholders}) AND timestamp >= ?`,
        [...params, fromStr],
      );
      totalClicks = Number(totalResult[0]?.count || 0);

      // Unique clicks (last 30 days)
      const uniqueResult = await this.dataSource.query(
        `SELECT COUNT(*) as count FROM clicks WHERE "linkId" IN (${placeholders}) AND isUnique = 1 AND timestamp >= ?`,
        [...params, fromStr],
      );
      uniqueClicks = Number(uniqueResult[0]?.count || 0);

      // Mobile rate
      const mobileResult = await this.dataSource.query(
        `SELECT COUNT(*) as count FROM clicks WHERE "linkId" IN (${placeholders}) AND device = 'mobile' AND timestamp >= ?`,
        [...params, fromStr],
      );
      const mobileCount = Number(mobileResult[0]?.count || 0);
      mobileRate = totalClicks > 0 ? mobileCount / totalClicks : 0;

      // Top country
      const countryResult = await this.dataSource.query(
        `SELECT country, COUNT(*) as count FROM clicks WHERE "linkId" IN (${placeholders}) AND country IS NOT NULL AND timestamp >= ? GROUP BY country ORDER BY count DESC LIMIT 1`,
        [...params, fromStr],
      );
      topCountry = countryResult.length > 0 ? countryResult[0].country : null;

      // Click trends (daily, last 30 days)
      const trendsResult = await this.dataSource.query(
        `SELECT DATE(timestamp) as date, COUNT(*) as clicks FROM clicks WHERE "linkId" IN (${placeholders}) AND timestamp >= ? GROUP BY DATE(timestamp) ORDER BY date ASC`,
        [...params, fromStr],
      );
      for (const row of trendsResult || []) {
        clickTrends.push({ date: row.date, clicks: Number(row.clicks) });
      }
    }

    // Recent links (last 5)
    const recentLinks = await this.linkRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 5,
    });

    return {
      totalLinks,
      totalClicks,
      uniqueClicks,
      mobileRate,
      topCountry,
      clickTrends,
      recentLinks,
    };
  }
}
