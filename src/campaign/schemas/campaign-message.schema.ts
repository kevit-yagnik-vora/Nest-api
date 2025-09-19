import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CampaignMessageDocument = CampaignMessage & Document;

@Schema({ timestamps: true })
export class CampaignMessage {
  @Prop({ type: Types.ObjectId, ref: 'Campaign', required: true, unique: true })
  campaign: Types.ObjectId;

  @Prop({
    type: {
      text: { type: String, required: true },
      imageUrl: { type: String },
    },
    required: true,
  })
  messageSnapshot: {
    text: string;
    imageUrl?: string;
  };

  @Prop({
    type: [
      {
        contactId: { type: Types.ObjectId, ref: 'Contact' },
        name: { type: String, required: true },
        phoneNumber: { type: String, required: true },
        status: { type: String, default: 'Pending' },
        sentAt: { type: Date },
      },
    ],
    default: [],
  })
  sentMessages: {
    contactId?: Types.ObjectId;
    name: string;
    phoneNumber: string;
    status?: string;
    sentAt?: Date;
  }[];
}

export const CampaignMessageSchema =
  SchemaFactory.createForClass(CampaignMessage);
CampaignMessageSchema.index({ campaign: 1 }, { unique: true });
