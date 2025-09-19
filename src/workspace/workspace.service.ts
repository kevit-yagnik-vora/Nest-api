/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Workspace, WorkspaceDocument } from './schemas/workspace.schema';
import { Model, SortOrder, Types } from 'mongoose';
import { CreateWorkspaceDto } from './dtos/workspace.dto';
import { User } from 'src/user/schemas/user.schema';
import { AddUserDto } from './dtos/add-user.dto';
import * as bcrypt from 'bcrypt';
import { UpdateUserRoleDto } from './dtos/update-user-role.dto';

@Injectable()
export class WorkspaceService {
  constructor(
    @InjectModel(Workspace.name)
    private workspaceModel: Model<WorkspaceDocument>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async getAllWorkspaces(
    page: number = 1,
    limit: number = 10,
    order: string = 'asc',
  ) {
    const skip = (page - 1) * limit;

    const sortOptions: { [key: string]: SortOrder } = {
      name: order as SortOrder,
    };

    const [data, total] = await Promise.all([
      this.workspaceModel
        .find()
        .collation({ locale: 'en', strength: 2 })
        .populate({
          path: 'createdBy',
          select: '_id name email phoneNumber createdAt updatedAt __v',
        })
        .skip(skip)
        .limit(limit)
        .sort(sortOptions),
      this.workspaceModel.countDocuments(),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getMyWorkspaces(
    userId: string,
    page: number,
    limit: number,
    order: string,
  ) {
    const skip = (page - 1) * limit;
    const sortOptions: { [key: string]: SortOrder } = {
      name: order as SortOrder,
    };

    const query = { createdBy: userId };

    const [data, total] = await Promise.all([
      this.workspaceModel
        .find(query)
        .collation({ locale: 'en', strength: 2 })
        .populate('createdBy', 'name email')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.workspaceModel.countDocuments(query),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOneById(id: string) {
    const workspace = await this.workspaceModel
      .findById(id)
      .populate('createdBy', 'name email')
      .exec();

    if (!workspace) {
      throw new NotFoundException(`Workspace with ID "${id}" not found.`);
    }
    const usersInWorkspace = await this.userModel
      .find({ 'workspaces.workspaceId': id })
      .select('name email workspaces')
      .exec();

    const usersWithRoles = usersInWorkspace.map((user) => {
      const workspaceInfo = user.workspaces.find(
        (ws) => ws.workspaceId.toString() === id,
      );
      return {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: workspaceInfo ? workspaceInfo.role : 'N/A',
      };
    });

    return { workspace, users: usersWithRoles };
  }

  async addUser(workspaceId: string, addUserDto: AddUserDto) {
    const { email, role, name, phoneNumber } = addUserDto;

    let user = await this.userModel.findOne({ email }).exec();

    if (user) {
      const isAlreadyMember = user.workspaces.some(
        (ws) => ws.workspaceId.toString() === workspaceId,
      );
      if (isAlreadyMember) {
        throw new ConflictException(
          `User is already a member of this workspace.`,
        );
      }
      user.workspaces.push({
        workspaceId: new Types.ObjectId(workspaceId),
        role,
      });
    } else {
      if (name && phoneNumber) {
        const tempPassword = 'password123';
        const passwordHash = await bcrypt.hash(tempPassword, 10);

        user = new this.userModel({
          email,
          name,
          phoneNumber,
          passwordHash,
          workspaces: [{ workspaceId: new Types.ObjectId(workspaceId), role }],
        });
        console.log(
          `New user created. Email: ${email}, Temp Password: ${tempPassword}`,
        );
      } else {
        throw new NotFoundException(`User with email "${email}" not found.`);
      }
    }

    await user.save();
    const { passwordHash, ...userResult } = user.toObject();
    return userResult;
  }

  async removeUser(workspaceId: string, userId: string) {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException(`User with ID "${userId}" not found.`);
    }

    const workspaceIndex = user.workspaces.findIndex(
      (ws) => ws.workspaceId.toString() === workspaceId,
    );

    if (workspaceIndex === -1) {
      return { message: 'User was not in the workspace.' };
    }

    user.workspaces.splice(workspaceIndex, 1);

    await user.save();

    return { message: 'User removed from workspace successfully.' };
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

  async updateUserRole(
    workspaceId: string,
    userId: string,
    updateUserRoleDto: UpdateUserRoleDto,
  ) {
    const { role } = updateUserRoleDto;

    const updatedUser = await this.userModel
      .findOneAndUpdate(
        { _id: userId, 'workspaces.workspaceId': workspaceId },
        { $set: { 'workspaces.$.role': role } },
        { new: true },
      )
      .exec();

    if (!updatedUser) {
      throw new NotFoundException(
        `User with ID "${userId}" not found in workspace "${workspaceId}".`,
      );
    }

    return { message: 'User role updated successfully.' };
  }
}
