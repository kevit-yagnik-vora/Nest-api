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
    order: string = 'asc', // Default to 'asc' if not provided
  ) {
    const skip = (page - 1) * limit;

    // 1. DYNAMIC SORT LOGIC
    // We create a sort object. If order is 'desc', Mongoose uses -1.
    // For anything else (including 'asc'), it uses 1.
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
        .sort(sortOptions), // 2. USE THE DYNAMIC SORT OBJECT HERE
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

  async findOneById(id: string) {
    // 1. Fetch the workspace and populate its creator's details
    const workspace = await this.workspaceModel
      .findById(id)
      .populate('createdBy', 'name email')
      .exec();

    // If no workspace is found, throw a standard 404 error
    if (!workspace) {
      throw new NotFoundException(`Workspace with ID "${id}" not found.`);
    }

    // 2. Fetch all users who are members of this workspace
    // This assumes your User schema has a field like:
    // @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Workspace' }] })
    // workspaces: Workspace[];
    const users = await this.userModel
      .find({ 'workspaces.workspaceId': id })
      .select('name email')
      .exec();
    // 3. Return the combined data
    return { workspace, users };
  }

  async addUser(workspaceId: string, addUserDto: AddUserDto) {
    const { email, role, name, phoneNumber } = addUserDto;

    // 1. Check if the user exists
    let user = await this.userModel.findOne({ email }).exec();

    if (user) {
      // CASE A: User exists
      const isAlreadyMember = user.workspaces.some(
        (ws) => ws.workspaceId.toString() === workspaceId,
      );
      if (isAlreadyMember) {
        throw new ConflictException(
          `User is already a member of this workspace.`,
        );
      }
      // Add workspace to existing user
      user.workspaces.push({
        workspaceId: new Types.ObjectId(workspaceId),
        role,
      });
    } else {
      // CASE B: User does not exist, so we create them
      // Check if required creation fields are present
      if (name && phoneNumber) {
        // If yes, proceed to create the new user.
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
        // If no, this was the initial check. We must throw a 404 to tell the frontend
        // that the user was not found and it should now ask for creation details.
        throw new NotFoundException(`User with email "${email}" not found.`);
      }
    }

    await user.save();
    const { passwordHash, ...userResult } = user.toObject();
    return userResult;
  }

  async removeUser(workspaceId: string, userId: string) {
    // 1. Find the user by their ID
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException(`User with ID "${userId}" not found.`);
    }

    // 2. Check if the user is actually in the workspace
    const workspaceIndex = user.workspaces.findIndex(
      (ws) => ws.workspaceId.toString() === workspaceId,
    );

    if (workspaceIndex === -1) {
      // User is not in the workspace, so there's nothing to do.
      // We can return a success message as the end state is achieved.
      return { message: 'User was not in the workspace.' };
    }

    // 3. Remove the workspace entry from the user's workspaces array
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
}
