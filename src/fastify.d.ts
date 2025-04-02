import { FastifyRequest, FastifyReply } from 'fastify';

declare module 'fastify' {
  interface FastifyInstance {
    verifyToken: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    verifyAdmin: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    verifyRefreshToken: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    checkEmailToken: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}
