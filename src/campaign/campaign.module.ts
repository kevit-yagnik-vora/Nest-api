import { Module } from '@nestjs/common';
import { CampaignService } from './campaign.service';
import { CampaignController } from './campaign.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Campaign, CampaignSchema } from './schemas/campaign.schema';
import { AuthModule } from 'src/auth/auth.module';
import { JwtService } from '@nestjs/jwt';
import {
  CampaignMessage,
  CampaignMessageSchema,
} from './schemas/campaign-message.schema';
import { Contact, ContactSchema } from 'src/contact/schemas/contact.schema';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: Campaign.name, schema: CampaignSchema },
      { name: CampaignMessage.name, schema: CampaignMessageSchema },
      { name: Contact.name, schema: ContactSchema },
    ]),
  ],
  providers: [CampaignService, JwtService],
  controllers: [CampaignController],
})
export class CampaignModule {}
