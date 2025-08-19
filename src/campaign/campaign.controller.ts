/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { CampaignService } from './campaign.service';
import { CreateCampaignDto } from './dtos/create-campaign.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { UpdateCampaignDto } from './dtos/update-campaign.dto';

@UseGuards(AuthGuard)
@Controller('campaign')
export class CampaignController {
  constructor(private campaignService: CampaignService) {}

  @Get('getAllCampaigns')
  async getAllCampaigns() {
    return {
      message: 'Campaign Fetched Successfully',
      data: await this.campaignService.getAllCampaigns(),
    };
  }

  @Get(':campaignId')
  async getCampaignById(@Param('campaignId') id: string) {
    return {
      message: 'Campaign Fetched Successfully',
      data: await this.campaignService.getCampaignById(id),
    };
  }

  @Post('createCampaign')
  async createCampaign(@Request() req: any, @Body() data: CreateCampaignDto) {
    return {
      message: 'Campaign Created Successfully',
      data: await this.campaignService.createCampaign(req.user, data),
    };
  }

  @Delete(':campaignId')
  async deleteCampaign(@Param('campaignId') id: string) {
    return {
      message: 'Campaign Deleted Successfully',
      data: await this.campaignService.deleteCampaign(id),
    };
  }

  @Put(':campaignId')
  async updateCampaign(
    @Param('campaignId') id: string,
    @Body() data: UpdateCampaignDto,
  ) {
    return {
      message: 'Campaign Updated Successfully',
      data: await this.campaignService.updateCampaign(id, data),
    };
  }
}
