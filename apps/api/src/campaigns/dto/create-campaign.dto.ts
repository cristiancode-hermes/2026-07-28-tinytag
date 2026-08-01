import { IsString, IsOptional, IsHexColor, MinLength } from 'class-validator';

export class CreateCampaignDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsHexColor()
  color?: string;
}
