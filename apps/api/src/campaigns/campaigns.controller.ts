import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CampaignsService } from './campaigns.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('campaigns')
@UseGuards(JwtAuthGuard)
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Post()
  async create(@CurrentUser() user: { id: string }, @Body() dto: CreateCampaignDto) {
    return this.campaignsService.create(user.id, dto);
  }

  @Get()
  async findAll(
    @CurrentUser() user: { id: string },
    @Query('search') search?: string,
  ) {
    return this.campaignsService.findAll(user.id, search);
  }

  @Get(':id')
  async findById(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.campaignsService.findById(id, user.id);
  }

  @Get(':id/analytics')
  async getAnalytics(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Query('range') range: '7d' | '30d' | '90d' = '30d',
  ) {
    return this.campaignsService.getAnalytics(id, user.id, range);
  }

  @Patch(':id')
  async update(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: UpdateCampaignDto,
  ) {
    return this.campaignsService.update(id, user.id, dto);
  }

  @Delete(':id')
  async delete(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    await this.campaignsService.delete(id, user.id);
    return { message: 'Campaign deleted successfully' };
  }
}
