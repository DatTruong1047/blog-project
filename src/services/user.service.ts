import { PrismaClient } from '@prisma/client';

import { CreateUserInput, UpdateUser, UserQuery } from '@app/schemas/user.schemas';

import { hashPassword } from '../utils/hash.utils';

export default class UserService {
  private readonly _prisma: PrismaClient;

  constructor() {
    this._prisma = new PrismaClient();
  }

  async getUserById(id: string) {
    return this._prisma.user.findFirst({
      where: { id },
    });
  }

  // Doing ... , not containt search.
  async getUsers(userQuery: UserQuery) {
    return this._prisma.user.findMany({
      skip: userQuery.skip,
      take: userQuery.take,
    });
  }

  async getUserByEmail(email: string) {
    return this._prisma.user.findUnique({
      where: { email },
    });
  }

  async createUser(input: CreateUserInput) {
    const { password, email } = input;

    const { hashedPassword } = await hashPassword(password);

    const user = this._prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });
    return user;
  }

  async updateUser(id: string, input: UpdateUser) {
    const { password, ...rest } = input;
    const updateData: UpdateUser = { ...rest };

    if (password) {
      const { hashedPassword } = await hashPassword(password);
      updateData.password = hashedPassword;
    }

    return this._prisma.user.update({
      where: { id },
      data: updateData,
    });
  }
}
