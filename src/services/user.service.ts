import { PrismaClient } from '@prisma/client';

import { ChangePasswordRequest, CreateUserInput, UpdateProfileRequest, UserQuery } from '@app/schemas/user.schemas';

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

  async verfifyEmail(id: string) {
    return this._prisma.user.update({
      where: { id },
      data: {
        isVerifiedEmail: true,
      },
    });
  }
  async updateProfile(id: string, input: UpdateProfileRequest) {
    console.log(input, id);

    return this._prisma.user.update({
      where: { id },
      data: {
        ...input,
      },
    });
  }

  async updatePassword(id: string, password: string) {
    const { hashedPassword } = await hashPassword(password);
    return this._prisma.user.update({
      where: { id },
      data: {
        password: hashedPassword,
      },
    });
  }
}
