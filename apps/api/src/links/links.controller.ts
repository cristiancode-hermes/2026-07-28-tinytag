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
import { LinksService } from './links.service';
import { CreateLinkDto } from './dto/create-link.dto';
import { UpdateLinkDto } from './dto/update-link.dto';
import { LinkQueryDto } from './dto/link-query.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('links')
@UseGuards(JwtAuthGuard)
export class LinksController {
  constructor(private readonly linksService: LinksService) {}

  @Post()
  async create(@CurrentUser() user: { id: string }, @Body() dto: CreateLinkDto) {
    return this.linksService.create(user.id, dto);
  }

  @Get()
  async findAll(@CurrentUser() user: { id: string }, @Query() query: LinkQueryDto) {
    return this.linksService.findAll(user.id, query);
  }

  @Get('alias/:alias/check')
  async checkAlias(@Param('alias') alias: string) {
    const available = await this.linksService.checkAlias(alias);
    return { alias, available };
  }

  @Get(':id')
  async findById(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.linksService.findById(id, user.id);
  }

  @Patch(':id')
  async update(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: UpdateLinkDto,
  ) {
    return this.linksService.update(id, user.id, dto);
  }

  @Delete(':id')
  async delete(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    await this.linksService.delete(id, user.id);
    return { message: 'Link deleted successfully' };
  }
}
