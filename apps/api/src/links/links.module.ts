import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Link } from './entities/link.entity';
import { Tag } from '../tags/entities/tag.entity';
import { LinksController } from './links.controller';
import { LinksService } from './links.service';
import { AliasService } from './alias.service';

@Module({
  imports: [TypeOrmModule.forFeature([Link, Tag])],
  controllers: [LinksController],
  providers: [LinksService, AliasService],
  exports: [LinksService, AliasService],
})
export class LinksModule {}
