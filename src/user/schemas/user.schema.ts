/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  [x: string]: any | string;
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  phoneNumber: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ default: false })
  isAdmin?: boolean;

  @Prop({
    type: [
      {
        workspaceId: { type: Types.ObjectId, ref: 'Workspace', required: true },
        role: { type: String, enum: ['Editor', 'Viewer'], required: true },
      },
    ],
    default: [],
  })
  workspaces: {
    workspaceId: Types.ObjectId;
    role: 'Editor' | 'Viewer';
  }[];
}

export const UserSchema = SchemaFactory.createForClass(User);
