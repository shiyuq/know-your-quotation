import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '@/database/schemas';

import { Role } from '@/constants';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  private readonly users = [
    {
      userId: 1,
      username: 'john',
      password: 'changeme',
      roles: [Role.Admin],
    },
    {
      userId: 2,
      username: 'maria',
      password: 'guess',
      roles: [Role.User],
    },
  ];

  async findOne(username: string) {
    return this.users.find((user) => user.username === username);
  }

  async create(name: string, phone: string) {
    const cteatedUser = await this.userModel.create({ name, phone });
    return cteatedUser.toJSON();
  }

  async getUsers() {
    const docs = await this.userModel.find().exec();
    return docs.map((d) => d.toJSON());
  }
}
