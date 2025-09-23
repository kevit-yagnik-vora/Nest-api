import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { User, UserSchema } from 'src/user/schemas/user.schema';
import { Contact, ContactSchema } from 'src/contact/schemas/contact.schema';
import {
  MessageTemplate,
  MessageTemplateSchema,
} from 'src/message-template/schemas/message-template.schema';
import { Campaign, CampaignSchema } from 'src/campaign/schemas/campaign.schema';
import {
  CampaignMessage,
  CampaignMessageSchema,
} from 'src/campaign/schemas/campaign-message.schema';
import {
  Workspace,
  WorkspaceSchema,
} from 'src/workspace/schemas/workspace.schema';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Workspace.name, schema: WorkspaceSchema },
      { name: User.name, schema: UserSchema },
      { name: Contact.name, schema: ContactSchema },
      { name: MessageTemplate.name, schema: MessageTemplateSchema },
      { name: Campaign.name, schema: CampaignSchema },
      { name: CampaignMessage.name, schema: CampaignMessageSchema },
    ]),
  ],
  providers: [DashboardService, JwtService],
  controllers: [DashboardController],
})
export class DashboardModule {}
