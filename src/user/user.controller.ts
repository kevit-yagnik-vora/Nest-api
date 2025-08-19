import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './schemas/user.schema';
import { CreateUserDto } from './dtos/create-user.dto';
import { AuthGuard } from 'src/auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('addUser')
  async addUser(@Body() data: CreateUserDto) {
    const user = await this.userService.createUser(data);
    return { message: 'User created successfully', user };
  }

  @Get('getAll')
  async getAllUsers() {
    const users = await this.userService.getAllUsers();
    return { data: users };
  }

  @Get(':id')
  async getUserById(@Param('id') id: string) {
    if (!id) {
      throw new Error('User ID is required');
    }
    const user = await this.userService.getUserById(id);
    return { message: 'User retrieved successfully', data: user };
  }

  @Delete(':id')
  async deleteUserById(@Param('id') id: string) {
    if (!id) {
      throw new Error('User ID is required');
    }
    const user = await this.userService.deleteUser(id);
    return { message: 'User deleted successfully', data: user };
  }

  @Put(':id')
  async updateUserById(@Param('id') id: string, @Body() data: Required<User>) {
    if (!id) {
      throw new Error('User ID is required');
    }
    const user = await this.userService.updateUser(id, data);
    return { message: 'User updated successfully', data: user };
  }
}
