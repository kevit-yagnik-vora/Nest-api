/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
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
import { WorkspaceService } from './workspace.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { CreateWorkspaceDto } from './dtos/workspace.dto';
import { AddUserDto } from './dtos/add-user.dto';
import { UpdateUserRoleDto } from './dtos/update-user-role.dto';

@UseGuards(AuthGuard)
@Controller('workspace')
export class WorkspaceController {
  constructor(private readonly workspaceService: WorkspaceService) {}

  // 1. UPDATED THE ROUTE to match your frontend API call
  @Get('all')
  async getAllWorkspaces(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10, // A default of 10 is common
    // 2. ADDED the 'order' query parameter with a default value
    @Query('order') order: string = 'asc',
  ) {
    // 3. PASS all parameters to the service. The '+' ensures they are treated as numbers.
    return this.workspaceService.getAllWorkspaces(+page, +limit, order);
  }

  @UseGuards(AuthGuard) // Protect this route
  @Get('my')
  getMyWorkspaces(
    @Request() req, // Get the full request object
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 6,
    @Query('order') order: string = 'asc',
  ) {
    const userId: any = req.user.userId; // Extract user ID from the JWT payload
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
