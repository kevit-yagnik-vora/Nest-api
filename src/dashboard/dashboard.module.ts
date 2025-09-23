import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Campaign, CampaignSchema } from 'src/campaign/schemas/campaign.schema';
import { Contact, ContactSchema } from 'src/contact/schemas/contact.schema';
import { User, UserSchema } from 'src/user/schemas/user.schema';
import {
  Workspace,
  WorkspaceSchema,
} from 'src/workspace/schemas/workspace.schema';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [
    // Import all the schemas we need to query for the dashboard
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Workspace.name, schema: WorkspaceSchema },
      { name: Contact.name, schema: ContactSchema },
      { name: Campaign.name, schema: CampaignSchema },
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
