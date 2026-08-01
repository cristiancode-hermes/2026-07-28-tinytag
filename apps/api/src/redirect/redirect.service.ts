import { Injectable, NotFoundException, GoneException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Link } from '../links/entities/link.entity';
import { ClicksService } from '../clicks/clicks.service';

@Injectable()
export class RedirectService {
  constructor(
    @InjectRepository(Link)
    private readonly linkRepo: Repository<Link>,
    private readonly clicksService: ClicksService,
  ) {}

  async resolveAlias(alias: string): Promise<{ link: Link; isExpired: boolean }> {
    const link = await this.linkRepo.findOne({ where: { alias } });

    if (!link) {
      throw new NotFoundException('Link not found');
    }

    const isExpired = link.expiresAt ? new Date(link.expiresAt) < new Date() : false;

    return { link, isExpired };
  }

  async recordClickAsync(linkId: string, ip: string, userAgent: string, referrer: string): Promise<void> {
    // Fire and forget - click recording is dispatched asynchronously
    this.clicksService.recordClick(linkId, ip, userAgent, referrer).catch((err) => {
      console.error('Failed to record click:', err);
    });
  }
}
