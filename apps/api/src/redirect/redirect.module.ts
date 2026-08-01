import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Link } from '../links/entities/link.entity';
import { ClicksModule } from '../clicks/clicks.module';
import { RedirectController } from './redirect.controller';
import { RedirectService } from './redirect.service';

@Module({
  imports: [TypeOrmModule.forFeature([Link]), ClicksModule],
  controllers: [RedirectController],
  providers: [RedirectService],
})
export class RedirectModule {}
