import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CampaignMessageDocument = CampaignMessage & Document;

@Schema({ timestamps: true })
export class CampaignMessage {
  @Prop({ type: Types.ObjectId, ref: 'Campaign', required: true, unique: true })
  campaign: Types.ObjectId; // one doc per campaign

  // snapshot of the message at launch time
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

  // list of per-contact send records
  @Prop({
    type: [
      {
        contactId: { type: Types.ObjectId, ref: 'Contact' },
        name: { type: String, required: true },
        phoneNumber: { type: String, required: true },
        status: { type: String, default: 'Pending' }, // Pending | Sent | Failed
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
CampaignMessageSchema.index({ campaign: 1 }, { unique: true }); // ensure one per campaign
