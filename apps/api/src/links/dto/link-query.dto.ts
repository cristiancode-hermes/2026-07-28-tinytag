import { IsOptional, IsString, IsEnum, Min } from 'class-validator';
import { Type } from 'class-transformer';

export enum SortOption {
  CLICKS = 'clicks',
  DATE = 'date',
  ALIAS = 'alias',
}

export class LinkQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  campaignId?: string;

  @IsOptional()
  tagId?: string;

  @IsOptional()
  @IsEnum(SortOption)
  sort?: SortOption;

  @IsOptional()
  @Type(() => Number)
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @Min(1)
  limit?: number;
}
