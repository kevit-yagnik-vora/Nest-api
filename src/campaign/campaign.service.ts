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
    console.log(req.user);
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
  async copy(id, userId) {
    const source = await this.campaignModel.findById(id).lean();
    if (!source) throw new NotFoundException();
    const clone = {
      ...source,
      _id: undefined,
      status: 'Draft',
      createdBy: userId,
      createdAt: undefined,
      updatedAt: undefined,
      launchedAt: undefined,
      name: source.name + ' (Copy)',
    };
    const { __v, ...rest } = clone; // Remove __v property
    return this.campaignModel.create(rest);
  }

  /** Launch campaign: Draft → Running → Completed */
  async launch(id: string) {
    const campaign = await this.campaignModel.findById(id);
    if (!campaign) throw new NotFoundException('Campaign not found');
    if (campaign.status !== 'Draft') {
      throw new BadRequestException('Only Draft campaigns can be launched');
    }

    // find contacts with matching tags in same workspace
    const contacts = await this.contactModel.find({
      workspaceId: campaign.workspace,
      tags: { $in: campaign.selectedTags || [] },
    });

    // update campaign to Running
    campaign.status = 'Running';
    campaign.launchedAt = new Date();
    await campaign.save();

    // create campaign message docs (snapshots)
    const messages = contacts.map((c) => ({
      campaign: campaign._id,
      contact: c._id,
      contactSnapshot: {
        name: c.name,
        phoneNumber: c.phoneNumber,
        tags: c.tags,
        originalId: c._id,
      },
      messageSnapshot: {
        text: campaign.message.text,
        imageUrl: campaign.message.imageUrl,
      },
      status: 'Pending',
    }));
    const createdMessages =
      await this.campaignMessageModel.insertMany(messages);

    // simulate sending asynchronously
    void (async () => {
      for (const cm of createdMessages) {
        try {
          await new Promise((r) => setTimeout(r, 150)); // simulate send delay
          await this.campaignMessageModel.findByIdAndUpdate(cm._id, {
            status: 'Sent',
            sentAt: new Date(),
          });
        } catch (err) {
          await this.campaignMessageModel.findByIdAndUpdate(cm._id, {
            status: 'Failed',
            error: String(err),
          });
        }
      }
      await this.campaignModel.findByIdAndUpdate(campaign._id, {
        status: 'Completed',
      });
    })();

    return {
      message: 'Campaign launched',
      totalRecipients: contacts.length,
      campaignId: campaign._id,
    };
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
}
