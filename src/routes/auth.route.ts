import { FastifyInstance, FastifyRequest } from 'fastify';

import AuthController from '@app/controllers/auth.controller';
import { ResendEmailRequestSchema, VerifyEmailQuery, VerifyEmailResponseSchema } from '@app/schemas/email.schemas';
import { RefreshTokenRequestSchema } from '@app/schemas/jwt.schemas';
import { ResponseSchema } from '@app/schemas/response.schemas';
import AuthService from '@app/services/auth.service';
import Mailervice from '@app/services/mail.service';
import UserService from '@app/services/user.service';

import {
  CreateUserSchema,
  CreateUserResponseSchema,
  LoginResponseSchema,
  LoginSchema,
  ChangePasswordRequestSchema,
} from '../schemas/user.schemas';

async function authRoutes(app: FastifyInstance) {
  const authController = new AuthController(new UserService(), new Mailervice(), new AuthService());

  app.post('/signUp', {
    schema: {
      tags: ['Auth'],
      body: CreateUserSchema,
      response: {
        201: CreateUserResponseSchema,
        400: ResponseSchema,
      },
    },
    handler: authController.register,
    //handler: (request, reply) => authController.register(request, reply),
  });

  app.post('/signIn', {
    schema: {
      tags: ['Auth'],
      body: LoginSchema,
      response: {
        200: LoginResponseSchema,
        400: ResponseSchema,
        401: ResponseSchema,
        404: ResponseSchema,
      },
    },
    handler: authController.login,
  });

  app.post('/refresh-token', {
    schema: {
      tags: ['Auth'],
      body: RefreshTokenRequestSchema,
      response: {
        200: LoginResponseSchema,
        400: ResponseSchema,
        401: ResponseSchema,
        404: ResponseSchema,
      },
    },
    preHandler: [app.verifyRefreshToken],
    handler: authController.refreshToken,
  });

  app.get('/verify-email', {
    schema: {
      tags: ['Auth'],
      querystring: VerifyEmailQuery,
      response: {
        200: VerifyEmailResponseSchema,
        400: ResponseSchema,
        404: ResponseSchema,
      },
    },
    preHandler: [app.verifyEmailToken],
    handler: authController.verifyEmail,
  });

  app.post('/resend-validation', {
    schema: {
      tags: ['Auth'],
      body: ResendEmailRequestSchema,
      response: {
        400: ResponseSchema,
        404: ResponseSchema,
      },
    },
    handler: authController.resendVerifyEmail,
  });

  app.post('/forgot-password', {
    schema: {
      tags: ['Auth'],
      body: ChangePasswordRequestSchema,
      response: {
        400: ResponseSchema,
        404: ResponseSchema,
      },
    },
    handler: authController.forgotPassword,
  });
}

export default authRoutes;
