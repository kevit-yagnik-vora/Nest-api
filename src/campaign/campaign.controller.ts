/* eslint-disable @typescript-eslint/no-unsafe-argument */
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
// campaigns.controller.ts (strip-down)
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
    return this.svc.getById(id);
  }

  @Post()
  create(@Body() dto: CreateCampaignDto, @Req() req) {
    // set createdBy from auth if available
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

  @Post(':id/launch')
  launch(@Param('id') id: string, @Req() req) {
    return this.svc.launch(id, req.user.userId); // triggers background processing
  }

  @Get(':id/messages')
  async getCampaignMessages(@Param('id') id: string) {
    return this.svc.getCampaignMessages(id);
  }
  @Get(':id/details')
  async getCampaignDetails(@Param('id') campaignId: string) {
    return this.svc.getCampaignDetails(campaignId);
  }

  @Get(':id/summary')
  summary(@Param('id') id: string) {
    return this.svc.getSummary(id);
  }
}
