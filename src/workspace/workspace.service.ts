/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Workspace, WorkspaceDocument } from './schemas/workspace.schema';
import { Model } from 'mongoose';
import { CreateWorkspaceDto } from './dtos/workspace.dto';

@Injectable()
export class WorkspaceService {
  constructor(
    @InjectModel(Workspace.name)
    private workspaceModel: Model<WorkspaceDocument>,
  ) {}

  async getAllWorkspaces() {
    return this.workspaceModel.find().exec();
  }

  async getWorkspaceById(workspaceId: string) {
    const workspace = await this.workspaceModel.findById(workspaceId);
    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }
    return workspace;
  }

  async createWorkspace(user: any, createWorkspaceDto: CreateWorkspaceDto) {
    const newWorkspace = new this.workspaceModel({
      ...createWorkspaceDto,
      createdBy: user.userId,
    });
    return newWorkspace.save();
  }

  async deleteWorkspace(workspaceId: string) {
    const workspace = await this.workspaceModel.findByIdAndDelete(workspaceId);
    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }
    return workspace;
  }

  async updateWorkspace(workspaceId: string, data: CreateWorkspaceDto) {
    const workspace = await this.workspaceModel
      .findByIdAndUpdate(workspaceId, data, { new: true })
      .exec();
    if (!workspace) throw new NotFoundException('Workspace Not Found');
    return workspace;
  }
}
