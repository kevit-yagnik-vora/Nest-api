/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Campaign, CampaignDocument } from './schemas/campaign.schema';
import { Model } from 'mongoose';
import { CreateCampaignDto } from './dtos/create-campaign.dto';
import { UpdateCampaignDto } from './dtos/update-campaign.dto';

@Injectable()
export class CampaignService {
  constructor(
    @InjectModel(Campaign.name) private campaignModel: Model<CampaignDocument>,
  ) {}

  async getAllCampaigns() {
    return this.campaignModel.find().exec();
  }

  async getCampaignById(id: string) {
    const campaign = await this.campaignModel.findById(id).exec();
    if (!campaign) throw new NotFoundException('Campaign Not Found');
    return campaign;
  }

  async createCampaign(user: any, data: CreateCampaignDto) {
    const newCampaign = new this.campaignModel({
      ...data,
      createdBy: user.userId,
    });
    return await newCampaign.save();
  }

  async deleteCampaign(id: string) {
    const campaign = await this.campaignModel.findByIdAndDelete(id).exec();
    if (!campaign) throw new NotFoundException('Campaign Not Found');
    return campaign;
  }

  async updateCampaign(id: string, data: UpdateCampaignDto) {
    const campaign = await this.campaignModel
      .findByIdAndUpdate(id, data, { new: true })
      .exec();
    if (!campaign) throw new NotFoundException('Campaign Not Found');
    return campaign;
  }
}
