import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OnModuleInit } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { User } from '../users/entities/user.entity';
import { Link } from '../links/entities/link.entity';
import { Click } from '../clicks/entities/click.entity';
import { Campaign } from '../campaigns/entities/campaign.entity';
import { Tag } from '../tags/entities/tag.entity';
import { ApiKey } from '../api-keys/entities/api-key.entity';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Link)
    private readonly linkRepo: Repository<Link>,
    @InjectRepository(Click)
    private readonly clickRepo: Repository<Click>,
    @InjectRepository(Campaign)
    private readonly campaignRepo: Repository<Campaign>,
    @InjectRepository(Tag)
    private readonly tagRepo: Repository<Tag>,
    @InjectRepository(ApiKey)
    private readonly apiKeyRepo: Repository<ApiKey>,
  ) {}

  async onModuleInit() {
    if (process.env['SEED_DB'] !== 'true') {
      return;
    }

    this.logger.log('Seeding database...');

    // Check if already seeded
    const existingUser = await this.userRepo.findOne({ where: { email: 'demo@tinytag.dev' } });
    if (existingUser) {
      this.logger.log('Database already seeded, skipping.');
      return;
    }

    // Create demo user
    const hashedPassword = await bcrypt.hash('Demo1234', 10);
    const user = this.userRepo.create({
      email: 'demo@tinytag.dev',
      password: hashedPassword,
      name: 'Demo User',
    });
    const savedUser = (await this.userRepo.save(user)) as unknown as User;

    // Create campaigns
    const campaignData = [
      { name: 'Product Launch', description: 'Campaign for the new product launch in Q3', color: '#3B82F6' },
      { name: 'Documentation', description: 'Links to documentation and guides', color: '#10B981' },
      { name: 'Social Campaign', description: 'Social media marketing campaign', color: '#F59E0B' },
    ];

    const campaigns: Campaign[] = [];
    for (const data of campaignData) {
      const campaign = this.campaignRepo.create({
        userId: savedUser.id,
        ...data,
      });
      const saved = (await this.campaignRepo.save(campaign)) as unknown as Campaign;
      campaigns.push(saved);
    }

    // Create tags
    const tagData = [
      { name: 'docs', color: '#3B82F6' },
      { name: 'social', color: '#EC4899' },
      { name: 'launch', color: '#10B981' },
      { name: 'blog', color: '#F59E0B' },
      { name: 'marketing', color: '#8B5CF6' },
    ];

    const tags: Tag[] = [];
    for (const data of tagData) {
      const tag = this.tagRepo.create({
        userId: savedUser.id,
        ...data,
      });
      const saved = (await this.tagRepo.save(tag)) as unknown as Tag;
      tags.push(saved);
    }

    // Create links
    const linkData = [
      { alias: 'product', originalUrl: 'https://example.com/product', campaignId: campaigns[0].id, tagIds: [tags[2].id, tags[4].id] },
      { alias: 'docs', originalUrl: 'https://docs.example.com', campaignId: campaigns[1].id, tagIds: [tags[0].id] },
      { alias: 'blog1', originalUrl: 'https://blog.example.com/launch-post', campaignId: campaigns[0].id, tagIds: [tags[2].id, tags[3].id] },
      { alias: 'social-fb', originalUrl: 'https://facebook.com/example', campaignId: campaigns[2].id, tagIds: [tags[1].id, tags[4].id] },
      { alias: 'landing', originalUrl: 'https://example.com/landing', campaignId: campaigns[0].id, tagIds: [tags[2].id] },
      { alias: 'guide', originalUrl: 'https://docs.example.com/getting-started', campaignId: campaigns[1].id, tagIds: [tags[0].id, tags[3].id] },
    ];

    const links: Link[] = [];
    for (const data of linkData) {
      const selectedTags = tags.filter(t => data.tagIds.includes(t.id));
      const link = this.linkRepo.create({
        userId: savedUser.id,
        alias: data.alias,
        originalUrl: data.originalUrl,
        campaignId: data.campaignId,
        tags: selectedTags,
      });
      const saved = (await this.linkRepo.save(link)) as unknown as Link;
      links.push(saved);
    }

    // Create clicks with varied stats
    const devices = ['desktop', 'mobile', 'mobile', 'desktop', 'tablet'];
    const browsers = ['Chrome', 'Firefox', 'Safari', 'Chrome', 'Edge'];
    const countries = [
      { country: 'United States', countryCode: 'US' },
      { country: 'Spain', countryCode: 'ES' },
      { country: 'Germany', countryCode: 'DE' },
      { country: 'United Kingdom', countryCode: 'GB' },
      { country: 'France', countryCode: 'FR' },
      { country: 'Canada', countryCode: 'CA' },
      { country: 'Brazil', countryCode: 'BR' },
      { country: 'Japan', countryCode: 'JP' },
    ];
    const referrers = ['https://google.com', 'https://twitter.com', 'https://github.com', '', 'https://linkedin.com'];

    // Generate 50+ click events spread over the last 30 days
    const clickPromises: Promise<any>[] = [];
    for (let i = 0; i < 55; i++) {
      const linkIndex = i % links.length;
      const daysAgo = Math.floor(Math.random() * 30);
      const hoursAgo = Math.floor(Math.random() * 24);
      const minutesAgo = Math.floor(Math.random() * 60);
      const timestamp = new Date();
      timestamp.setDate(timestamp.getDate() - daysAgo);
      timestamp.setHours(timestamp.getHours() - hoursAgo);
      timestamp.setMinutes(timestamp.getMinutes() - minutesAgo);

      const device = devices[Math.floor(Math.random() * devices.length)];
      const browser = browsers[Math.floor(Math.random() * browsers.length)];
      const country = countries[Math.floor(Math.random() * countries.length)];
      const referrer = referrers[Math.floor(Math.random() * referrers.length)];
      const isUnique = Math.random() > 0.3; // 70% unique

      const click = this.clickRepo.create({
        linkId: links[linkIndex].id,
        timestamp,
        ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        userAgent: `Mozilla/5.0 (compatible; ${browser})`,
        referrer,
        country: country.country,
        countryCode: country.countryCode,
        device,
        browser,
        isUnique,
      });

      clickPromises.push(this.clickRepo.save(click));
    }
    await Promise.all(clickPromises);

    // Update link click counts
    for (const link of links) {
      const clickCount = await this.clickRepo.count({ where: { linkId: link.id } });
      const uniqueCount = await this.clickRepo.count({ where: { linkId: link.id, isUnique: true } });
      link.clickCount = clickCount;
      link.uniqueClickCount = uniqueCount;
      await this.linkRepo.save(link);
    }

    this.logger.log('Database seeded successfully!');
    this.logger.log(`  User: demo@tinytag.dev / Demo1234`);
    this.logger.log(`  Campaigns: ${campaigns.length}`);
    this.logger.log(`  Tags: ${tags.length}`);
    this.logger.log(`  Links: ${links.length}`);
    this.logger.log(`  Clicks: ${clickPromises.length}`);
  }
}
