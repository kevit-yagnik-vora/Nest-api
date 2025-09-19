/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { WorkspaceService } from './workspace.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { CreateWorkspaceDto } from './dtos/workspace.dto';
import { AddUserDto } from './dtos/add-user.dto';
import { UpdateUserRoleDto } from './dtos/update-user-role.dto';

@UseGuards(AuthGuard)
@Controller('workspace')
export class WorkspaceController {
  constructor(private readonly workspaceService: WorkspaceService) {}

  @Get('all')
  async getAllWorkspaces(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('order') order: string = 'asc',
  ) {
    return this.workspaceService.getAllWorkspaces(+page, +limit, order);
  }

  @UseGuards(AuthGuard)
  @Get('my')
  getMyWorkspaces(
    @Request() req,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 6,
    @Query('order') order: string = 'asc',
  ) {
    const userId: any = req.user.userId;
    return this.workspaceService.getMyWorkspaces(userId, +page, +limit, order);
  }

  @Post('createWorkspace')
  async createWorkspace(
    @Request() req,
    @Body() createWorkspaceDto: CreateWorkspaceDto,
  ) {
    return {
      message: 'Workspace Created Successfully',
      data: await this.workspaceService.createWorkspace(
        req.user,
        createWorkspaceDto,
      ),
    };
  }

  @Post(':id/users')
  @UsePipes(new ValidationPipe())
  addUserToWorkspace(
    @Param('id') workspaceId: string,
    @Body() addUserDto: AddUserDto,
  ) {
    if (
      !workspaceId ||
      workspaceId === 'undefined' ||
      !Types.ObjectId.isValid(workspaceId)
    ) {
      throw new BadRequestException('Invalid or missing Workspace ID');
    }
    return this.workspaceService.addUser(workspaceId, addUserDto);
  }

  @Delete(':workspaceId/users/:userId')
  removeUserFromWorkspace(
    @Param('workspaceId') workspaceId: string,
    @Param('userId') userId: string,
  ) {
    return this.workspaceService.removeUser(workspaceId, userId);
  }

  @Patch(':workspaceId/users/:userId')
  @UsePipes(new ValidationPipe())
  updateUserRole(
    @Param('workspaceId') workspaceId: string,
    @Param('userId') userId: string,
    @Body() updateUserRoleDto: UpdateUserRoleDto,
  ) {
    return this.workspaceService.updateUserRole(
      workspaceId,
      userId,
      updateUserRoleDto,
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    if (!id || id === 'undefined' || !Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid or missing Workspace ID');
    }
    return this.workspaceService.findOneById(id);
  }

  @Delete(':workspaceId')
  async deleteWorkspace(@Param('workspaceId') workspaceId: string) {
    return {
      message: 'Workspace Deleted Successfully',
      data: await this.workspaceService.deleteWorkspace(workspaceId),
    };
  }

  @Put(':workspaceId')
  async updateWorkspace(
    @Param('workspaceId') workspaceId: string,
    @Body() data: CreateWorkspaceDto,
  ) {
    return {
      message: 'Workspace Updated Successfully',
      data: await this.workspaceService.updateWorkspace(workspaceId, data),
    };
  }
}
