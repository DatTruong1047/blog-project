import { FastifyInstance } from 'fastify';

import { checkEmailToken } from '@app/plugins/email.plugin';
import { verifyEmailQuery, verifyEmailResponseSchema } from '@app/schemas/email.schemas';
import { refreshTokenRequestSchema } from '@app/schemas/jwt.schemas';
import { errorResponseSchema } from '@app/schemas/response.schemas';

import { loginHandler, refreshTokenHandler, registerHandler, verifyEmailHanlder } from '../controllers/auth.controller';
import { createUserSchema, createUserResponseSchema, loginResponseSchema, loginSchema } from '../schemas/user.schemas';

async function authRoutes(server: FastifyInstance) {
  server.post('/signUp', {
    schema: {
      tags: ['Auth'],
      body: createUserSchema,
      response: {
        201: createUserResponseSchema,
        400: errorResponseSchema,
      },
    },
    handler: registerHandler,
  });

  server.post('/signIn', {
    schema: {
      tags: ['Auth'],
      body: loginSchema,
      response: {
        200: loginResponseSchema,
        400: errorResponseSchema,
        401: errorResponseSchema,
        404: errorResponseSchema,
      },
    },
    handler: loginHandler,
  });

  server.post('/refresh-token', {
    schema: {
      tags: ['Auth'],
      body: refreshTokenRequestSchema,
      response: {
        200: loginResponseSchema,
        400: errorResponseSchema,
        401: errorResponseSchema,
        404: errorResponseSchema,
      },
    },
    preHandler: [server.verifyRefreshToken],
    handler: refreshTokenHandler,
  });

  server.get('/verify-email', {
    schema: {
      tags: ['Auth'],
      querystring: verifyEmailQuery,
      response: {
        200: verifyEmailResponseSchema,
        400: errorResponseSchema,
        404: errorResponseSchema,
      },
    },
    preHandler: [checkEmailToken],
    handler: verifyEmailHanlder,
  });
}

export default authRoutes;
