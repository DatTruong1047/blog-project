import { FastifyInstance } from 'fastify';

import AuthController from '@app/controllers/auth.controller';
import { ResendEmailRequestSchema, VerifyEmailQuery, VerifyEmailResponseSchema } from '@app/schemas/email.schemas';
import { RefreshTokenRequestSchema } from '@app/schemas/jwt.schemas';
import { ErrorResponseSchema, SuccessResponseSchema, SuccessResWithoutDataSchema } from '@app/schemas/response.schemas';
import AuthService from '@app/services/auth.service';
import Mailervice from '@app/services/mail.service';
import UserService from '@app/services/user.service';

import {
  CreateUserSchema,
  CreateUserResponseSchema,
  LoginResponseSchema,
  LoginSchema,
  ForgotPasswordRequestSchema,
  RefreshTokenResSchema,
} from '../schemas/user.schemas';

async function authRoutes(app: FastifyInstance) {
  const authController = new AuthController(new UserService(), new Mailervice(), new AuthService());

  app.post('/signUp', {
    schema: {
      tags: ['Auth'],
      body: CreateUserSchema,
      response: {
        201: SuccessResponseSchema(CreateUserResponseSchema),
        400: ErrorResponseSchema,
      },
    },
    handler: authController.register,
  });

  app.post('/signIn', {
    schema: {
      tags: ['Auth'],
      body: LoginSchema,
      response: {
        200: SuccessResponseSchema(LoginResponseSchema),
        400: ErrorResponseSchema,
        401: ErrorResponseSchema,
        404: ErrorResponseSchema,
      },
    },
    handler: authController.login,
  });

  app.post('/refresh-token', {
    schema: {
      tags: ['Auth'],
      body: RefreshTokenRequestSchema,
      response: {
        200: SuccessResponseSchema(RefreshTokenResSchema),
        400: ErrorResponseSchema,
        401: ErrorResponseSchema,
        404: ErrorResponseSchema,
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
        200: SuccessResponseSchema(VerifyEmailResponseSchema),
        400: ErrorResponseSchema,
        404: ErrorResponseSchema,
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
        200: SuccessResWithoutDataSchema,
        400: ErrorResponseSchema,
        404: ErrorResponseSchema,
      },
    },
    handler: authController.resendVerifyEmail,
  });

  app.post('/forgot-password', {
    schema: {
      tags: ['Auth'],
      body: ForgotPasswordRequestSchema,
      response: {
        200: SuccessResWithoutDataSchema,
        400: ErrorResponseSchema,
        404: ErrorResponseSchema,
      },
    },
    handler: authController.forgotPassword,
  });
}

export default authRoutes;
