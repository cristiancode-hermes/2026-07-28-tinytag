import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { TagsService } from './tags.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('tags')
@UseGuards(JwtAuthGuard)
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Post()
  async create(
    @CurrentUser() user: { id: string },
    @Body('name') name: string,
    @Body('color') color?: string,
  ) {
    return this.tagsService.create(user.id, name, color);
  }

  @Get()
  async findAll(@CurrentUser() user: { id: string }) {
    return this.tagsService.findAll(user.id);
  }

  @Get(':id')
  async findById(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.tagsService.findById(id, user.id);
  }

  @Patch(':id')
  async update(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body('name') name?: string,
    @Body('color') color?: string,
  ) {
    return this.tagsService.update(id, user.id, name, color);
  }

  @Delete(':id')
  async delete(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    await this.tagsService.delete(id, user.id);
    return { message: 'Tag deleted successfully' };
  }
}
