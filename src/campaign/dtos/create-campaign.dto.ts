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
export class CreateCampaignDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsOptional()
  selectedTags?: string[];

  @ValidateNested()
  @Type(() => MessageDto)
  message: {
    text: string;
    imageUrl?: string;
  };

  @IsMongoId()
  @IsNotEmpty()
  workspace: string;
}
