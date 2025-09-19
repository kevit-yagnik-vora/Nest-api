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
import { ContactService } from './contact.service';
import { CreateContactDto } from './dtos/create-contact.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { Contact, ContactDocument } from './schemas/contact.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@UseGuards(AuthGuard)
@Controller('contact')
export class ContactController {
  constructor(
    private contactService: ContactService,
    @InjectModel(Contact.name) private contactModel: Model<ContactDocument>,
  ) {}

  @Get('count')
  async count(
    @Query('workspaceId') workspaceId: string,
    @Query('tags') tagsCsv?: string,
  ) {
    const tags = tagsCsv
      ? tagsCsv
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

    const filter: any = { workspaceId };
    if (tags.length) filter.tags = { $in: tags };

    const count = await this.contactService.countContacts(filter);
    return { count };
  }

  @Post('createContact')
  async createContact(
    @Request() req,
    @Body() createContactDto: CreateContactDto,
  ) {
    return {
      message: 'Contact Created Successfully',
      data: await this.contactService.createContact(req.user, createContactDto),
    };
  }

  @Get('byWorkspace/:workspaceId')
  async getContactsByWorkspace(
    @Param('workspaceId') workspaceId: string,
    @Request() req,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.contactService.contactsByWorkspace(
      workspaceId,
      req.user,
      +page,
      +limit,
    );
  }

  @Get('all/byWorkspace/:workspaceId')
  async getAllContactsByWorkspace(
    @Param('workspaceId') workspaceId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.contactService.allContactsByWorkspace(
      workspaceId,
      +page,
      +limit,
    );
  }

  @Delete(':contactId')
  async deleteContact(@Param('contactId') contactId: string) {
    return {
      message: 'Contact Deleted Successfully',
      data: await this.contactService.deleteContact(contactId),
    };
  }

  @Put(':contactId')
  async updateContact(
    @Param('contactId') contactId: string,
    @Body() createContactDto: CreateContactDto,
  ) {
    return {
      message: 'Contact Updated Successfully',
      data: await this.contactService.updateContact(
        contactId,
        createContactDto,
      ),
    };
  }

  @Get(':contactId')
  async getContact(@Param('contactId') contactId: string) {
    const contact = await this.contactService.getContactById(contactId);
    return contact;
  }
}
