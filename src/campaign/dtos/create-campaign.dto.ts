import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsMongoId,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class MessageDto {
  @IsString()
  text: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}
// dto/create-campaign.dto.ts
export class CreateCampaignDto {
  @IsString() @IsNotEmpty() name: string;
  @IsString() @IsOptional() description?: string;
  @IsArray() @IsOptional() selectedTags?: string[]; // tags used to select contacts
  @ValidateNested() @Type(() => MessageDto) message: {
    text: string;
    imageUrl?: string;
  };
  @IsMongoId() @IsNotEmpty() workspace: string;
}

// dto/update-campaign.dto.ts
export class UpdateCampaignDto {
  @IsString() @IsOptional() name?: string;
  @IsString() @IsOptional() description?: string;
  @IsArray() @IsOptional() selectedTags?: string[];
  @ValidateNested() @Type(() => MessageDto) @IsOptional() message?: {
    text: string;
    imageUrl?: string;
  };
}
