import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Link } from '../links/entities/link.entity';
import { Click } from '../clicks/entities/click.entity';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [TypeOrmModule.forFeature([Link, Click])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
