import { FastifyInstance } from 'fastify';

import { CreateUserInput, UpdateUser, UserQuery } from '@app/schemas/user.schemas';

import { hashPassword } from '../utils/hash.utils';

export default class UserService {
  private readonly fastify: FastifyInstance;

  constructor(fastify: FastifyInstance) {
    this.fastify = fastify;
  }

  async getUserById(id: string) {
    return this.fastify.prisma.user.findFirst({
      where: { id },
    });
  }

  // Doing ... , not containt search.
  async getUsers(userQuery: UserQuery) {
    return this.fastify.prisma.user.findMany({
      skip: userQuery.skip,
      take: userQuery.take,
    });
  }

  async getUserByEmail(email: string) {
    return this.fastify.prisma.user.findUnique({
      where: { email },
    });
  }

  async createUser(input: CreateUserInput) {
    const { password, email } = input;

    const { hashedPassword } = await hashPassword(password);

    const user = this.fastify.prisma.user.create({
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

    return this.fastify.prisma.user.update({
      where: { id },
      data: updateData,
    });
  }
}
