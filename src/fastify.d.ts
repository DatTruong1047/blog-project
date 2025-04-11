import { PrismaClient } from '@prisma/client';
import { FastifyRequest, FastifyReply } from 'fastify';
import {
  ErrorResponseSchema,
  ErrorResponseType,
  SuccessResponseSchema,
  SuccessResponseType,
  SuccessResWithoutDataType,
} from './schemas/response.schemas';
import { CreateUserResponse } from './schemas/user.schemas';
import { TokenPayload } from './schemas/jwt.schemas';
import { EmailPayload } from './schemas/email.schemas';
import { FileType } from './schemas/file.schemas';
import { MultipartFile } from '@fastify/multipart';

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
    NotFound(err: ErrorResponseType): FastifyReply;
    BadRequest(err: ErrorResponseType): FastifyReply;
    Unauthorized(err: ErrorResponseType): FastifyReply;
    Forbidden(err: ErrorResponseType): FastifyReply;
    Conflict(err: ErrorResponseType): FastifyReply;

    OK<T>(res: T | SuccessResponseType<T> | SuccessResWithoutDataType): FastifyReply;
    Created<T>(res: SuccessResponseType<T> | SuccessResWithoutDataType): FastifyReply;

    InternalServer(err: Error): FastifyReply;
  }
}

declare module 'fastify' {
  interface FastifyRequest {
    decodedEmailToken: EmailPayload;
    decodeAccessToken: TokenPayload;
    uploadedFile?: FileType;
  }
}
