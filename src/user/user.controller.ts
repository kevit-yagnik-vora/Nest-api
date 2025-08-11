import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.schema';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('addUser')
  async addUser(@Body() data: Required<User>) {
    return this.userService.createUser(data);
  }

  @Get('getAll')
  async getAllUsers() {
    return this.userService.getAllUsers();
  }

  @Get('/:id')
  async getUserById(@Param('id') id: string) {
    if (!id) {
      throw new Error('User ID is required');
    }
    return this.userService.getUserById(id);
  }
}
