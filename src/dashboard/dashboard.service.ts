/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CampaignMessage } from 'src/campaign/schemas/campaign-message.schema';
import { Campaign } from 'src/campaign/schemas/campaign.schema';
import { Contact } from 'src/contact/schemas/contact.schema';
import { MessageTemplate } from 'src/message-template/schemas/message-template.schema';
import { User } from 'src/user/schemas/user.schema';
import { Workspace } from 'src/workspace/schemas/workspace.schema';
@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Workspace.name) private workspaceModel: Model<Workspace>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Contact.name) private contactModel: Model<Contact>,
    @InjectModel(MessageTemplate.name)
    private templateModel: Model<MessageTemplate>,
    @InjectModel(Campaign.name) private campaignModel: Model<Campaign>,
    @InjectModel(CampaignMessage.name)
    private campaignMsgModel: Model<CampaignMessage>,
  ) {}

  async getOverview(from?: string, to?: string) {
    const matchFilter: any = {};
    const msgMatchFilter: any = {};

    // Campaign filter (based on launchedAt)
    if (from || to) {
      matchFilter.launchedAt = {};
      if (from) matchFilter.launchedAt.$gte = new Date(from);
      if (to) matchFilter.launchedAt.$lte = new Date(to);

      // Campaign Messages filter (usually createdAt)
      msgMatchFilter.createdAt = {};
      if (from) msgMatchFilter.createdAt.$gte = new Date(from);
      if (to) msgMatchFilter.createdAt.$lte = new Date(to);
    }

    const [workspaces, users, contacts, templates, campaigns, campaignMsgs] =
      await Promise.all([
        this.workspaceModel.countDocuments(),
        this.userModel.countDocuments(),
        this.contactModel.countDocuments(),
        this.templateModel.countDocuments(),
        this.campaignModel.countDocuments(),
        this.campaignMsgModel.countDocuments(),
      ]);

    // Day-wise campaigns (line chart)
    const lastDays = await this.campaignModel.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$launchedAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Campaign Message stats (pie chart)
    const campaignStats = await this.campaignMsgModel.aggregate([
      { $match: msgMatchFilter },
      { $unwind: '$sentMessages' },
      {
        $group: {
          _id: '$sentMessages.status',
          count: { $sum: 1 },
        },
      },
    ]);

    // Latest Campaigns (limit 5)
    const latestCampaigns = await this.campaignModel
      .find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name status createdAt');

    // Latest Users (limit 5)
    const latestUsers = await this.userModel
      .find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email createdAt');

    return {
      counts: {
        workspaces,
        users,
        contacts,
        templates,
        campaigns,
        campaignMsgs,
      },
      lastDays,
      campaignStats,
      latestCampaigns,
      latestUsers,
    };
  }
}
