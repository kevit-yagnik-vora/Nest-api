import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CampaignDocument = Campaign & Document;

@Schema({ timestamps: true })
export class Campaign {
  @Prop({ required: true })
  name: string;

  @Prop()
  description?: string;

  @Prop({
    type: String,
    enum: ['Draft', 'Running', 'Completed'],
    default: 'Draft',
  })
  status: 'Draft' | 'Running' | 'Completed';

  @Prop({ type: [String], default: [] })
  selectedTags: string[];

  @Prop({
    type: {
      text: { type: String, required: true },
      imageUrl: { type: String },
    },
    required: true,
  })
  message: {
    text: string;
    imageUrl?: string;
  };

  @Prop()
  launchedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'Workspace', required: true })
  workspace: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop({
    type: [
      {
        contactId: { type: Types.ObjectId, ref: 'Contact' },
        sentAt: { type: Date, default: Date.now },
      },
    ],
    default: [],
  })
  messages: {
    contactId: Types.ObjectId;
    sentAt: Date;
  }[];
}

export const CampaignSchema = SchemaFactory.createForClass(Campaign);

// Index
CampaignSchema.index({ workspaceId: 1, status: 1 });
