import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './user.schema';
import { Model } from 'mongoose';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async createUser(data: Required<User>) {
    const newUser = new this.userModel(data);
    return newUser.save();
  }

  async getAllUsers() {
    return this.userModel.find().exec();
  }

  async getUserById(id: string) {
    const user = await this.userModel.findById(id).exec();
    if (!user) throw new NotFoundException('User Not Found');
    return user;
  }

  async deleteUser(id: string) {
    const user = await this.userModel.findByIdAndDelete(id).exec();
    if (!user) throw new NotFoundException('User Not Found');
    return user;
  }
  async updateUser(id: string, data: Required<User>) {
    const user = await this.userModel
      .findByIdAndUpdate(id, data, { new: true })
      .exec();
    if (!user) throw new NotFoundException('User Not Found');
    return user;
  }
}
