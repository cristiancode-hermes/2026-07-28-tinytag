import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiKeysService } from './api-keys.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('api-keys')
@UseGuards(JwtAuthGuard)
export class ApiKeysController {
  constructor(private readonly apiKeysService: ApiKeysService) {}

  @Post()
  async create(
    @CurrentUser() user: { id: string },
    @Body('name') name: string,
  ) {
    return this.apiKeysService.generateKey(name, user.id);
  }

  @Get()
  async findAll(@CurrentUser() user: { id: string }) {
    return this.apiKeysService.findAll(user.id);
  }

  @Delete(':id')
  async revoke(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    await this.apiKeysService.revoke(id, user.id);
    return { message: 'API key revoked successfully' };
  }
}
