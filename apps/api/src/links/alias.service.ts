import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Link } from './entities/link.entity';

@Injectable()
export class AliasService {
  constructor(
    @InjectRepository(Link)
    private readonly linkRepo: Repository<Link>,
  ) {}

  async generateAlias(): Promise<string> {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let alias = '';
    let isUnique = false;

    while (!isUnique) {
      alias = '';
      for (let i = 0; i < 6; i++) {
        alias += chars.charAt(Math.floor(Math.random() * chars.length));
      }

      const existing = await this.linkRepo.findOne({ where: { alias } });
      if (!existing) {
        isUnique = true;
      }
    }

    return alias;
  }

  async checkAvailability(alias: string): Promise<boolean> {
    const existing = await this.linkRepo.findOne({ where: { alias } });
    return !existing;
  }
}
