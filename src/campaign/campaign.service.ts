/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Campaign, CampaignDocument } from './schemas/campaign.schema';
import {
  CampaignMessage,
  CampaignMessageDocument,
} from './schemas/campaign-message.schema';
import { Contact, ContactDocument } from 'src/contact/schemas/contact.schema';

import {
  CreateCampaignDto,
  UpdateCampaignDto,
} from './dtos/create-campaign.dto';

@Injectable()
export class CampaignService {
  constructor(
    @InjectModel(Campaign.name)
    private readonly campaignModel: Model<CampaignDocument>,
    @InjectModel(CampaignMessage.name)
    private readonly campaignMessageModel: Model<CampaignMessageDocument>,
    @InjectModel(Contact.name)
    private readonly contactModel: Model<ContactDocument>,
  ) {}

  /** Create a new campaign */
  async create(dto: CreateCampaignDto, req: any) {
    const campaign = new this.campaignModel({
      ...dto,
      status: 'Draft',
      createdBy: req.user.userId,
      workspace: dto.workspace,
    });
    return campaign.save();
  }

  /** Update campaign (only if Draft) */
  async update(id: string, dto: UpdateCampaignDto) {
    const campaign = await this.campaignModel.findById(id);
    if (!campaign) throw new NotFoundException('Campaign not found');
    if (campaign.status !== 'Draft') {
      throw new BadRequestException('Only Draft campaigns can be updated');
    }

    Object.assign(campaign, dto);
    return campaign.save();
  }

  /** Delete campaign */
  async delete(id: string) {
    const campaign = await this.campaignModel.findById(id);
    if (!campaign) throw new NotFoundException('Campaign not found');

    await this.campaignMessageModel.deleteMany({ campaign: campaign._id });
    await campaign.deleteOne();
    return { message: 'Deleted successfully' };
  }

  /** Get campaign by ID */
  async getById(id: string) {
    const campaign = await this.campaignModel.findById(id).lean();
    if (!campaign) throw new NotFoundException('Campaign not found');
    return campaign;
  }

  /** List campaigns by workspace (paginated) */
  async findByWorkspace(workspaceId: string, page = 1, limit = 10) {
    const filter = { workspace: new Types.ObjectId(workspaceId) };
    const total = await this.campaignModel.countDocuments(filter);
    const campaigns = await this.campaignModel
      .find({ workspace: workspaceId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return {
      data: campaigns,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /** Copy campaign */
  async copy(id, req) {
    const source = await this.campaignModel.findById(id).lean();
    if (!source) throw new NotFoundException();
    const clone = {
      ...source,
      status: 'Draft',
      createdBy: req.user.userId,
      name: source.name + ' (Copy)',
    };
    const { __v, _id, ...rest } = clone; // Remove __v property
    return this.campaignModel.create(rest);
  }

  /** Launch campaign: Draft → Running → Completed */
  async launch(campaignId: string, userId: string) {
    const campaign = await this.campaignModel.findById(campaignId);
    if (!campaign) throw new NotFoundException('Campaign not found');

    // update status → Running
    campaign.status = 'Running';
    await campaign.save();

    // fetch contacts by campaign tags
    const contacts = await this.contactModel.find({
      workspaceId: campaign.workspace,
      createdBy: campaign.createdBy,
      tags: { $in: campaign.selectedTags || [] },
    });

    if (!contacts.length) {
      campaign.status = 'Completed';
      await campaign.save();
      return { message: 'No contacts found, campaign completed immediately' };
    }

    let i = 0;
    const interval = setInterval(async () => {
      if (i >= contacts.length) {
        clearInterval(interval);

        // mark campaign completed
        campaign.status = 'Completed';
        await campaign.save();
        return;
      }

      const c = contacts[i];

      await this.campaignMessageModel.create({
        campaign: campaign._id, // required ref
        contact: c._id, // required ref
        workspaceId: campaign.workspace,
        status: 'Pending',
        createdBy: userId,

        // take snapshot of message template at launch time
        messageSnapshot: {
          text: campaign.message?.text || '',
          imageUrl: campaign.message?.imageUrl || '',
        },

        // take snapshot of contact at launch time
        contactSnapshot: {
          name: c.name,
          phoneNumber: c.phoneNumber,
          tags: c.tags,
        },
      });

      i++;
    }, 1000);

    return { message: 'Campaign launched, messages are being inserted' };
  }

  /** Get campaign messages (paginated) */
  async getMessages(
    campaignId: string,
    page = 1,
    limit = 20,
  ): Promise<{
    data: any[]; // or a proper interface for lean objects
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const filter = { campaign: new Types.ObjectId(campaignId) };
    const total = await this.campaignMessageModel.countDocuments(filter);

    const messages = await this.campaignMessageModel
      .find(filter)
      .sort({ createdAt: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return {
      data: messages,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /** Get campaign summary (counts of messages by status) */
  async getSummary(campaignId: string) {
    const campaign = await this.campaignModel.findById(campaignId).lean();
    if (!campaign) throw new NotFoundException('Campaign not found');

    const counts = await this.campaignMessageModel.aggregate([
      { $match: { campaign: new Types.ObjectId(campaignId) } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const result: any = {
      campaign,
      messageStats: {
        Pending: 0,
        Sent: 0,
        Failed: 0,
      },
    };
    counts.forEach((c) => (result.messageStats[c._id] = c.count));
    return result;
  }

  async getCampaignDetails(campaignId: string) {
    const campaign = await this.campaignModel.findById(campaignId);
    if (!campaign) throw new NotFoundException('Campaign not found');

    const targetedContacts = await this.campaignMessageModel
      .find({ campaignId: new Types.ObjectId(campaignId) })
      .populate('contactId', 'name email phoneNumber tags');

    return { campaign, targetedContacts };
  }

  async getCampaignMessages(campaignId: string): Promise<any[]> {
    return this.campaignMessageModel
      .find({ campaign: new Types.ObjectId(campaignId) })
      .select('contactSnapshot messageSnapshot status createdAt')
      .lean()
      .exec();
  }
}
