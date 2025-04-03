import { PrismaClient } from '@prisma/client';
import { FastifyPluginAsync } from 'fastify';
import fastifuPlugin from 'fastify-plugin';

declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient;
  }
}

const prismaPlugin: FastifyPluginAsync = async (fastify) => {
  const prisma = new PrismaClient();

  await prisma.$connect();

  fastify.decorate('prisma', prisma);
  fastify.addHook('onClose', async (fastify) => {
    await fastify.prisma.$disconnect();
  });
};

export default fastifuPlugin(prismaPlugin);
