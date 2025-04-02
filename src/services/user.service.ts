import fastify, { FastifyInstance } from 'fastify';

import { CreateUserInput, updateUser, userQuery } from '@app/schemas/user.schemas';

import { hashPassword } from '../utils/hash.utils';

export async function getUserByIdService(id: string, fastify: FastifyInstance) {
  return fastify.prisma.user.findFirst({
    where: { id },
  });
}

// Doing ... , not containt search.
export async function getUsersService(userQuery: userQuery, fastify: FastifyInstance) {
  return fastify.prisma.user.findMany({
    skip: userQuery.skip,
    take: userQuery.take,
  });
}

export async function getUserByEmailService(email: string, fastify: FastifyInstance) {
  return fastify.prisma.user.findUnique({
    where: { email },
  });
}

export async function createUserService(input: CreateUserInput, server: FastifyInstance) {
  const { password, email } = input;

  const { hashedPassword } = await hashPassword(password);

  const user = server.prisma.user.create({
    data: {
      email,
      password: hashedPassword,
    },
  });
  return user;
}

export async function updateUserService(fastify: FastifyInstance, id: string, input: updateUser) {
  const { password, ...rest } = input;
  const updateData: updateUser = { ...rest };

  if (password) {
    const { hashedPassword } = await hashPassword(password);
    updateData.password = hashedPassword;
  }

  return fastify.prisma.user.update({
    where: { id },
    data: updateData,
  });
}
