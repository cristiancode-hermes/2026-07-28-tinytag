import { IsUrl, Matches, IsOptional, IsDateString, IsArray } from 'class-validator';

export class CreateLinkDto {
  @IsUrl()
  url: string;

  // For internal use - maps from 'url' field
  get originalUrl(): string { return this.url; }

  @IsOptional()
  @Matches(/^[a-z0-9-]{3,20}$/, {
    message: 'Alias must be 3-20 characters: lowercase letters, numbers, hyphens',
  })
  alias?: string;

  @IsOptional()
  campaignId?: string;

  @IsOptional()
  @IsArray()
  tagIds?: string[];

  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}
