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
  Request,
  UseGuards,
} from '@nestjs/common';
import { MessageTemplateService } from './message-template.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { CreateMessageTemplateDto } from './dtos/create-message-template.dto';
import { UpdateMessageTemplateDto } from './dtos/update-message-template.dto';

@UseGuards(AuthGuard)
@Controller('message-template')
export class MessageTemplateController {
  constructor(private messageTemplateService: MessageTemplateService) {}

  @Get('')
  async getAllMessageTemplates() {
    const data = await this.messageTemplateService.getAllMessageTemplates();
    return data;
  }

  @Get(':id')
  async getMessageTemplateById(@Param('id') id: string) {
    const data = await this.messageTemplateService.getMessageTemplateById(id);
    return data;
  }

  @Post('')
  async createMessageTemplate(
    @Request() req,
    @Body() data: CreateMessageTemplateDto,
  ) {
    const messageTemplate =
      await this.messageTemplateService.createMessageTemplate(req.user, data);
    return {
      message: 'Message Template created successfully',
      data: messageTemplate,
    };
  }

  @Delete(':id')
  async deleteMessageTemplate(@Param('id') id: string) {
    const data = await this.messageTemplateService.deleteMessageTemplate(id);
    return {
      message: 'Message Template deleted successfully',
      data,
    };
  }

  @Put(':id')
  async updateMessageTemplate(
    @Param('id') id: string,
    @Body() data: UpdateMessageTemplateDto,
  ) {
    const messageTemplate =
      await this.messageTemplateService.updateMessageTemplate(id, data);
    return {
      message: 'Message Template updated successfully',
      data: messageTemplate,
    };
  }

  @Get('byWorkspace/:workspaceId')
  getContactsByWorkspace(
    @Param('workspaceId') workspaceId: string,
    @Request() req,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.messageTemplateService.getMessageTemplatesByWorkspace(
      workspaceId,
      req.user,
      +page,
      +limit,
    );
  }

  @Get('all/byWorkspace/:workspaceId')
  getAllContactsByWorkspace(
    @Param('workspaceId') workspaceId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.messageTemplateService.getAllMessageTemplatesByWorkspace(
      workspaceId,
      +page,
      +limit,
    );
  }
}
