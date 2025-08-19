/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsArray,
  ValidateNested,
  IsEnum,
  MinLength,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Types } from 'mongoose';

class WorkspaceDto {
  @IsNotEmpty()
  @IsString()
  workspaceId: Types.ObjectId;

  @IsEnum(['Editor', 'Viewer'])
  role: 'Editor' | 'Viewer';
}

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(10, { message: 'Phone Number must 10 characters long' })
  @MaxLength(10, { message: 'Phone Number must 10 characters long' })
  phoneNumber: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsOptional()
  @IsBoolean()
  isAdmin?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkspaceDto)
  workspaces?: WorkspaceDto[];
}
