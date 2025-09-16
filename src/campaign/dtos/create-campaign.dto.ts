import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsMongoId,
  IsArray,
  IsIn,
  ValidateNested,
  IsDate,
} from 'class-validator';
import { Type } from 'class-transformer';

class CampaignMessageDto {
  @IsString()
  @IsNotEmpty()
  text: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;
}

export class CreateCampaignDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsIn(['Draft', 'Running', 'Completed'])
  @IsOptional()
  status?: 'Draft' | 'Running' | 'Completed';

  @IsArray()
  @IsOptional()
  selectedTags?: string[];

  @ValidateNested()
  @Type(() => CampaignMessageDto)
  message: CampaignMessageDto;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  launchedAt?: Date;

  @IsMongoId()
  @IsNotEmpty()
  workspace: string;
}
