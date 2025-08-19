import { Module } from '@nestjs/common';
import { MessageTemplateService } from './message-template.service';
import { MessageTemplateController } from './message-template.controller';
import { AuthModule } from 'src/auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import {
  MessageTemplate,
  MessageTemplateSchema,
} from './schemas/message-template.schema';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      {
        name: MessageTemplate.name,
        schema: MessageTemplateSchema,
      },
    ]),
  ],
  providers: [MessageTemplateService, JwtService],
  controllers: [MessageTemplateController],
})
export class MessageTemplateModule {}
