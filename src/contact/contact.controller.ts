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

@UseGuards(AuthGuard)
@Controller('contact')
export class ContactController {
  constructor(private contactService: ContactService) {}

  @Get('getAllContacts')
  async getAllContacts() {
    return {
      message: 'Contact Fetched Successfully',
      data: await this.contactService.getAllContacts(),
    };
  }

  @Get(':contactId')
  async getContact(@Param('contactId') contactId: string) {
    const contact = await this.contactService.getContactById(contactId);
    return contact;
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
}
