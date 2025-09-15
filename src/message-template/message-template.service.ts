/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  MessageTemplate,
  MessageTemplateDocument,
} from './schemas/message-template.schema';
import { Model } from 'mongoose';
import { CreateMessageTemplateDto } from './dtos/create-message-template.dto';
import { UpdateMessageTemplateDto } from './dtos/update-message-template.dto';

@Injectable()
export class MessageTemplateService {
  constructor(
    @InjectModel(MessageTemplate.name)
    private messageTemplateModel: Model<MessageTemplateDocument>,
  ) {}

  async getAllMessageTemplates() {
    return this.messageTemplateModel
      .find()
      .populate('workspace', '_id name createdBy description') // Selects only these fields
      .exec();
  }

  async getMessageTemplateById(id: string) {
    return this.messageTemplateModel
      .findById(id)
      .populate('workspace', '_id name createdBy description')
      .exec();
  }

  async createMessageTemplate(user: any, data: CreateMessageTemplateDto) {
    const messageTemplate = new this.messageTemplateModel({
      ...data,
      createdBy: user.userId,
    });
    return messageTemplate.save();
  }

  async deleteMessageTemplate(id: string) {
    return this.messageTemplateModel.findByIdAndDelete(id).exec();
  }

  async updateMessageTemplate(id: string, data: UpdateMessageTemplateDto) {
    const messageTemplate = await this.messageTemplateModel
      .findByIdAndUpdate(id, data, { new: true })
      .exec();
    if (!messageTemplate)
      throw new NotFoundException('Message Template Not Found');
    return messageTemplate;
  }

  async getMessageTemplatesByWorkspace(
    workspaceId: string,
    user: any,
    page = 1,
    limit = 10,
  ) {
    const skip = (page - 1) * limit;

    const [messageTemplates, total] = await Promise.all([
      this.messageTemplateModel
        .find({ workspace: workspaceId, createdBy: user.userId })
        .populate('workspace', '_id name createdBy description')
        .skip(skip)
        .limit(limit)
        .exec(),
      this.messageTemplateModel.countDocuments({
        workspace: workspaceId,
        createdBy: user.userId,
      }),
    ]);

    return {
      data: messageTemplates,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
