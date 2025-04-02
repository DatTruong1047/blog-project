import fastify, { FastifyInstance } from 'fastify';

import { CreateUserInput, userQuery } from '@app/schemas/user.schemas';

import { hashPassword } from '../utils/hash.utils';

export async function createUser(input: CreateUserInput, server: FastifyInstance) {
  const { password, email } = input;

  const { hashedPassword } = await hashPassword(password);

  const user = server.prisma.user.create({
    data: {
      email,
      password: hashedPassword,
    },
  });
  console.error('service' + user);
  return user;
}

export async function getUserById(id: string, fastify: FastifyInstance) {
  return fastify.prisma.user.findFirst({
    where: { id },
  });
}

// Doing ... , not containt search.
export async function getUsers(userQuery: userQuery, fastify: FastifyInstance) {
  return fastify.prisma.user.findMany({
    skip: userQuery.skip,
    take: userQuery.take,
  });
}

export async function getUserByEmail(email: string, fastify: FastifyInstance) {
  return fastify.prisma.user.findUnique({
    where: { email },
  });
}
