// dto/create-message-template.dto.ts
import {
  IsString,
  IsNotEmpty,
  IsMongoId,
  IsOptional,
  IsIn,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class MessageContentDto {
  @IsString()
  @IsNotEmpty()
  text: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;
}

export class CreateMessageTemplateDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsIn(['Text', 'Text-Image'])
  type: 'Text' | 'Text-Image';

  @ValidateNested()
  @Type(() => MessageContentDto)
  message: MessageContentDto;

  @IsMongoId()
  @IsNotEmpty()
  workspaceId: string;
}
