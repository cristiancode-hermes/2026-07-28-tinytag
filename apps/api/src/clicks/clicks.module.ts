import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Click } from './entities/click.entity';
import { Link } from '../links/entities/link.entity';
import { ClicksService } from './clicks.service';

@Module({
  imports: [TypeOrmModule.forFeature([Click, Link])],
  providers: [ClicksService],
  exports: [ClicksService],
})
export class ClicksModule {}
