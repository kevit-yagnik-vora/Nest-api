import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MessageTemplateDocument = MessageTemplate & Document;

@Schema({ timestamps: true })
export class MessageTemplate {
  @Prop({ required: true })
  name: string;

  @Prop({ type: String, enum: ['Text', 'Text-Image'], required: true })
  type: 'Text' | 'Text-Image';

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

  @Prop({ type: Types.ObjectId, ref: 'Workspace', required: true })
  workspace: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;
}

export const MessageTemplateSchema =
  SchemaFactory.createForClass(MessageTemplate);

// ✅ Corrected Index (was `workSpaceUsersId` in your code, should be `workspaceId`)
MessageTemplateSchema.index({ workspaceId: 1, type: 1 });
