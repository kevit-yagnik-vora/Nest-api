import { Module } from '@nestjs/common';
import { WorkspaceService } from './workspace.service';
import { WorkspaceController } from './workspace.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Workspace } from './schemas/workspace.schema';
import { WorkspaceSchema } from './schemas/workspace.schema';
import { AuthModule } from 'src/auth/auth.module';
import { JwtService } from '@nestjs/jwt';
import { User, UserSchema } from 'src/user/schemas/user.schema';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: Workspace.name, schema: WorkspaceSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  providers: [WorkspaceService, JwtService],
  controllers: [WorkspaceController],
  exports: [WorkspaceService],
})
export class WorkspaceModule {}
