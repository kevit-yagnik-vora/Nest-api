import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { WorkspaceModule } from './workspace/workspace.module';
import { ContactModule } from './contact/contact.module';
import { MessageTemplateModule } from './message-template/message-template.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_URL!),
    UserModule,
    AuthModule,
    WorkspaceModule,
    ContactModule,
    MessageTemplateModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
