import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Click } from '../clicks/entities/click.entity';
import { Link } from '../links/entities/link.entity';

export interface AnalyticsResult {
  totalClicks: number;
  uniqueClicks: number;
  mobileRate: number;
  topCountry: string | null;
  clickTrends: { date: string; clicks: number }[];
  topReferrers: { referrer: string; count: number }[];
  devices: { device: string; count: number }[];
  browsers: { browser: string; count: number }[];
  countries: { country: string; count: number }[];
}

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Click)
    private readonly clickRepo: Repository<Click>,
    @InjectRepository(Link)
    private readonly linkRepo: Repository<Link>,
    private readonly dataSource: DataSource,
  ) {}

  async getAnalytics(linkId: string, range: '7d' | '30d' | '90d'): Promise<AnalyticsResult> {
    const link = await this.linkRepo.findOne({ where: { id: linkId } });
    if (!link) {
      throw new NotFoundException('Link not found');
    }

    const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - days);
    const fromStr = dateFrom.toISOString();

    // Total clicks
    const totalResult = await this.dataSource.query(
      `SELECT COUNT(*) as count FROM clicks WHERE "linkId" = ? AND timestamp >= ?`,
      [linkId, fromStr],
    );
    const totalClicks = Number(totalResult[0]?.count || 0);

    // Unique clicks
    const uniqueResult = await this.dataSource.query(
      `SELECT COUNT(*) as count FROM clicks WHERE "linkId" = ? AND isUnique = 1 AND timestamp >= ?`,
      [linkId, fromStr],
    );
    const uniqueClicks = Number(uniqueResult[0]?.count || 0);

    // Mobile rate
    const mobileResult = await this.dataSource.query(
      `SELECT COUNT(*) as count FROM clicks WHERE "linkId" = ? AND device = 'mobile' AND timestamp >= ?`,
      [linkId, fromStr],
    );
    const mobileCount = Number(mobileResult[0]?.count || 0);
    const mobileRate = totalClicks > 0 ? mobileCount / totalClicks : 0;

    // Top country
    const countryResult = await this.dataSource.query(
      `SELECT country, COUNT(*) as count FROM clicks WHERE "linkId" = ? AND country IS NOT NULL AND timestamp >= ? GROUP BY country ORDER BY count DESC LIMIT 1`,
      [linkId, fromStr],
    );
    const topCountry = countryResult.length > 0 ? countryResult[0].country : null;

    // Click trends (daily)
    const trendsResult = await this.dataSource.query(
      `SELECT DATE(timestamp) as date, COUNT(*) as clicks FROM clicks WHERE "linkId" = ? AND timestamp >= ? GROUP BY DATE(timestamp) ORDER BY date ASC`,
      [linkId, fromStr],
    );
    const clickTrends = (trendsResult || []).map((r: any) => ({
      date: r.date,
      clicks: Number(r.clicks),
    }));

    // Top referrers
    const referrersResult = await this.dataSource.query(
      `SELECT referrer, COUNT(*) as count FROM clicks WHERE "linkId" = ? AND referrer IS NOT NULL AND referrer != '' AND timestamp >= ? GROUP BY referrer ORDER BY count DESC LIMIT 10`,
      [linkId, fromStr],
    );
    const topReferrers = (referrersResult || []).map((r: any) => ({
      referrer: r.referrer,
      count: Number(r.count),
    }));

    // Devices
    const devicesResult = await this.dataSource.query(
      `SELECT device, COUNT(*) as count FROM clicks WHERE "linkId" = ? AND timestamp >= ? GROUP BY device ORDER BY count DESC`,
      [linkId, fromStr],
    );
    const devices = (devicesResult || []).map((r: any) => ({
      device: r.device,
      count: Number(r.count),
    }));

    // Browsers
    const browsersResult = await this.dataSource.query(
      `SELECT browser, COUNT(*) as count FROM clicks WHERE "linkId" = ? AND timestamp >= ? GROUP BY browser ORDER BY count DESC`,
      [linkId, fromStr],
    );
    const browsers = (browsersResult || []).map((r: any) => ({
      browser: r.browser,
      count: Number(r.count),
    }));

    // Countries
    const countriesResult = await this.dataSource.query(
      `SELECT country, COUNT(*) as count FROM clicks WHERE "linkId" = ? AND country IS NOT NULL AND timestamp >= ? GROUP BY country ORDER BY count DESC LIMIT 10`,
      [linkId, fromStr],
    );
    const countries = (countriesResult || []).map((r: any) => ({
      country: r.country,
      count: Number(r.count),
    }));

    return {
      totalClicks,
      uniqueClicks,
      mobileRate,
      topCountry,
      clickTrends,
      topReferrers,
      devices,
      browsers,
      countries,
    };
  }
}
