import {
  IsString,
  IsNotEmpty,
  IsMongoId,
  IsOptional,
  IsArray,
} from 'class-validator';

export class CreateContactDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @IsArray()
  @IsOptional()
  tags?: string[];

  @IsMongoId()
  @IsNotEmpty()
  workspaceId: string;
}
