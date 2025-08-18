/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { WorkspaceService } from './workspace.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { CreateWorkspaceDto } from './dtos/workspace.dto';

@UseGuards(AuthGuard)
@Controller('workspace')
export class WorkspaceController {
  constructor(private readonly workspaceService: WorkspaceService) {}

  @Get('getAllWorkspaces')
  async getAllWorkspaces() {
    return {
      message: 'Workspace fetched Successfully',
      data: await this.workspaceService.getAllWorkspaces(),
    };
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

  @Get(':workspaceId')
  async getWorkspaceById(@Param('workspaceId') workspaceId: string) {
    return {
      message: 'Workspace Fetched Successfully',
      data: await this.workspaceService.getWorkspaceById(workspaceId),
    };
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
