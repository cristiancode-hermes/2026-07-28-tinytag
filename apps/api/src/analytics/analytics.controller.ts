import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('links')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get(':id/analytics')
  async getAnalytics(
    @Param('id') id: string,
    @Query('range') range: '7d' | '30d' | '90d' = '30d',
  ) {
    return this.analyticsService.getAnalytics(id, range);
  }
}
