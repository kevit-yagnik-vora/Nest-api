/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  Request,
  UseGuards,
} from '@nestjs/common';
import { CampaignService } from './campaign.service';
import { CreateCampaignDto } from './dtos/create-campaign.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { UpdateCampaignDto } from './dtos/update-campaign.dto';

@UseGuards(AuthGuard)
@Controller('campaigns')
export class CampaignController {
  constructor(private readonly svc: CampaignService) {}

  @Get('byWorkspace/:workspaceId')
  findByWorkspace(
    @Param('workspaceId') workspaceId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.svc.findByWorkspace(workspaceId, +page, +limit);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.svc.getCampaignById(id);
  }

  @Post()
  create(@Body() dto: CreateCampaignDto, @Req() req) {
    dto['createdBy'] = req.user._id;
    return this.svc.create(dto, req);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCampaignDto) {
    return this.svc.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.svc.delete(id);
  }

  @Post(':id/copy')
  copy(@Param('id') id: string, @Req() req) {
    return this.svc.copy(id, req);
  }

  @Get(':id/details')
  async getCampaignDetails(@Param('id') campaignId: string) {
    return this.svc.getCampaignDetails(campaignId);
  }

  @Post(':id/launch')
  async launch(@Param('id') id: string) {
    return this.svc.launchCampaign(id);
  }

  @Get(':id/messages')
  async getMessages(@Param('id') id: string) {
    return this.svc.getCampaignMessageForCampaign(id);
  }
}
