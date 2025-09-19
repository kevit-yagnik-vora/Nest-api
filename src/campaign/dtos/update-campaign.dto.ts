import { MessageDto } from './create-campaign.dto';
import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateCampaignDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsOptional()
  selectedTags?: string[];

  @ValidateNested()
  @Type(() => MessageDto)
  @IsOptional()
  message?: {
    text: string;
    imageUrl?: string;
  };
}
