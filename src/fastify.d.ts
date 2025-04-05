import { PrismaClient } from '@prisma/client';
import { FastifyRequest, FastifyReply } from 'fastify';
import { Response } from './schemas/response.schemas';
import { CreateUserResponse } from './schemas/user.schemas';
import { TokenPayload } from './schemas/jwt.schemas';
import { EmailPayload } from './schemas/email.schemas';

declare module 'fastify' {
  interface FastifyInstance {
    verifyToken: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    verifyAdmin: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    verifyRefreshToken: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    verifyEmailToken: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    prisma: PrismaClient;
  }
}

declare module 'fastify' {
  interface FastifyReply {
    NotFound(err: Response): FastifyReply;
    BadRequest(err: Response): FastifyReply;
    Unauthorized(err: Response): FastifyReply;
    Forbidden(err: Response): FastifyReply;
    Conflict(err: Response): FastifyReply;

    OK(res): FastifyReply;
    Created(res): FastifyReply;

    InternalServer(err: Error): FastifyReply;
  }
}

declare module 'fastify' {
  interface FastifyRequest {
    decodedEmailToken: EmailPayload;
    decodeAccessToken: TokenPayload;
  }
}
