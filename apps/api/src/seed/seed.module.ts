import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Link } from '../links/entities/link.entity';
import { Click } from '../clicks/entities/click.entity';
import { Campaign } from '../campaigns/entities/campaign.entity';
import { Tag } from '../tags/entities/tag.entity';
import { ApiKey } from '../api-keys/entities/api-key.entity';
import { SeedService } from './seed.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Link, Click, Campaign, Tag, ApiKey])],
  providers: [SeedService],
})
export class SeedModule {}
