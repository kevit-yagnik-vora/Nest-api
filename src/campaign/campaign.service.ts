/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
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

import { CreateCampaignDto } from './dtos/create-campaign.dto';
import { UpdateCampaignDto } from './dtos/update-campaign.dto';
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

  async create(dto: CreateCampaignDto, req: any) {
    const campaign = new this.campaignModel({
      ...dto,
      status: 'Draft',
      createdBy: req.user.userId,
      workspace: dto.workspace,
    });
    return campaign.save();
  }

  async update(id: string, dto: UpdateCampaignDto) {
    const campaign = await this.campaignModel.findById(id);
    if (!campaign) throw new NotFoundException('Campaign not found');
    if (campaign.status !== 'Draft') {
      throw new BadRequestException('Only Draft campaigns can be updated');
    }

    Object.assign(campaign, dto);
    return campaign.save();
  }

  async delete(id: string) {
    const campaign = await this.campaignModel.findById(id);
    if (!campaign) throw new NotFoundException('Campaign not found');

    await this.campaignMessageModel.deleteOne({ campaign: campaign._id });
    await campaign.deleteOne();
    return { message: 'Deleted successfully' };
  }

  async getCampaignById(id: string) {
    return this.campaignModel.findById(id).lean();
  }

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

  async copy(id, req) {
    const source = await this.campaignModel.findById(id).lean();
    if (!source) throw new NotFoundException();
    const clone = {
      ...source,
      status: 'Draft',
      createdBy: req.user.userId,
      name: source.name + ' (Copy)',
      launchedAt: undefined,
    };
    const { __v, _id, ...rest } = clone; // Remove __v property
    return this.campaignModel.create(rest);
  }

  async getCampaignDetails(campaignId: string) {
    const campaign = await this.campaignModel.findById(campaignId);
    if (!campaign) throw new NotFoundException('Campaign not found');

    const targetedContacts = await this.campaignMessageModel
      .find({ campaignId: new Types.ObjectId(campaignId) })
      .populate('contactId', 'name email phoneNumber tags');

    return { campaign, targetedContacts };
  }

  async launchCampaign(campaignId: string) {
    const campaign = await this.campaignModel.findById(campaignId);
    if (!campaign) throw new NotFoundException('Campaign not found');

    campaign.status = 'Running';
    campaign.launchedAt = new Date();
    await campaign.save();

    // 🎯 Fire background job (no await)
    this.processCampaign(campaign);

    return { success: true, status: 'Running' };
  }

  private async processCampaign(campaign: CampaignDocument) {
    const contacts = await this.contactModel.find({
      workspaceId: campaign.workspace,
      tags: { $in: campaign.selectedTags },
    });

    const campaignMessage = await this.campaignMessageModel.create({
      campaign: campaign._id,
      messageSnapshot: {
        text: campaign.message.text,
        imageUrl: campaign.message.imageUrl,
      },
      sentMessages: [],
    });

    for (const contact of contacts) {
      await new Promise((res) => setTimeout(res, 3000));
      await this.campaignMessageModel.findByIdAndUpdate(campaignMessage._id, {
        $push: {
          sentMessages: {
            name: contact.name,
            phoneNumber: contact.phoneNumber,
            status: 'SENT',
            sentAt: new Date(),
          },
        },
      });
    }

    campaign.status = 'Completed';
    await campaign.save();
  }

  async getCampaignMessageForCampaign(campaignId: string): Promise<any> {
    return this.campaignMessageModel
      .findOne({ campaign: new Types.ObjectId(campaignId) })
      .select('campaign messageSnapshot sentMessages createdAt updatedAt')
      .populate('campaign')
      .lean()
      .exec();
  }
}
