import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class UpdateUserRoleDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(['Editor', 'Viewer'])
  role: 'Editor' | 'Viewer';
}
