// backend/schemas/campaign-message.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

export type CampaignMessageDocument = CampaignMessage & Document;

@Schema({ timestamps: true })
export class CampaignMessage {
  @Prop({ type: Types.ObjectId, ref: 'Campaign', required: true })
  campaign: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Contact', required: true })
  contact: Types.ObjectId;

  // snapshot of contact at send time
  @Prop({
    type: {
      name: String,
      phoneNumber: String,
      tags: [String],
      originalId: Types.ObjectId,
    },
    required: true,
  })
  contactSnapshot: {
    name: string;
    phoneNumber: string;
    tags: string[];
    originalId: Types.ObjectId;
  };

  // snapshot of message (copied from campaign.message or template)
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
    type: String,
    enum: ['Pending', 'Sent', 'Failed'],
    default: 'Pending',
  })
  status: 'Pending' | 'Sent' | 'Failed';

  @Prop()
  error?: string;

  @Prop()
  sentAt?: Date;
}

export const CampaignMessageSchema =
  SchemaFactory.createForClass(CampaignMessage);

// Indexes
CampaignMessageSchema.index({ campaign: 1 });
CampaignMessageSchema.index({ contact: 1 });
CampaignMessageSchema.index({ status: 1 });
