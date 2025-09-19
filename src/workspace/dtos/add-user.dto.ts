import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class AddUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsIn(['Editor', 'Viewer'])
  @IsNotEmpty()
  role: 'Editor' | 'Viewer';

  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  phoneNumber?: string;
}
