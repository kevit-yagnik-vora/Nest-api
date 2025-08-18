/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Contact, ContactDocument } from './schemas/contact.schema';
import { Model } from 'mongoose';
import { CreateContactDto } from './dtos/create-contact.dto';

@Injectable()
export class ContactService {
  constructor(
    @InjectModel(Contact.name) private contactModel: Model<ContactDocument>,
  ) {}

  async getAllContacts() {
    return this.contactModel.find().exec();
  }

  async getContactById(id: string) {
    const contact = await this.contactModel.findById(id).exec();
    if (!contact) throw new NotFoundException('Contact Not Found');
    return contact;
  }

  async createContact(user: any, data: CreateContactDto) {
    const contact = new this.contactModel({
      ...data,
      createdBy: user.userId,
    });
    return contact.save();
  }

  async deleteContact(id: string) {
    const contact = await this.contactModel.findByIdAndDelete(id).exec();
    if (!contact) throw new NotFoundException('Contact Not Found');
    return contact;
  }

  async updateContact(contactId: string, data: CreateContactDto) {
    const contact = await this.contactModel
      .findByIdAndUpdate(contactId, data, { new: true })
      .exec();
    if (!contact) throw new NotFoundException('Contact Not Found');
    return contact;
  }
}
