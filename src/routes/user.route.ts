import { FastifyInstance } from 'fastify';

import UserController from '@app/controllers/user.controller';
import {
  ErrorResponseSchema,
  SuccessResponseSchema,
  SuccessResWithoutDataSchema,
  UpLoadFileResponseSchema,
} from '@app/schemas/response.schemas';
import { ChangePasswordRequestSchema, UpdateProfileSchema, UserProfileResponseSchema } from '@app/schemas/user.schemas';
import FileService from '@app/services/media.service';
import UserService from '@app/services/user.service';
import { parseBirthDay } from '@app/validations/user.validation';

async function userRoutes(app: FastifyInstance) {
  const userController = new UserController(new UserService(), new FileService());

  app.get('/me', {
    schema: {
      tags: ['User'],
      response: {
        200: SuccessResponseSchema(UserProfileResponseSchema),
        400: ErrorResponseSchema,
        401: ErrorResponseSchema,
        404: ErrorResponseSchema,
      },
    },
    onRequest: [app.verifyToken],
    handler: userController.index,
  });

  app.put('/me', {
    schema: {
      tags: ['User'],
      body: UpdateProfileSchema,
      response: {
        200: SuccessResWithoutDataSchema,
        400: ErrorResponseSchema,
        401: ErrorResponseSchema,
        404: ErrorResponseSchema,
      },
    },
    preValidation: [parseBirthDay],
    onRequest: [app.verifyToken],
    handler: userController.update,
  });

  app.put('/me/change-password', {
    schema: {
      tags: ['User'],
      body: ChangePasswordRequestSchema,
      response: {
        200: SuccessResWithoutDataSchema,
        400: ErrorResponseSchema,
        401: ErrorResponseSchema,
        404: ErrorResponseSchema,
      },
    },
    onRequest: [app.verifyToken],
    handler: userController.changePassword,
  });

  app.put('/me/avatar', {
    schema: {
      tags: ['User'],
      response: {
        200: SuccessResponseSchema(UpLoadFileResponseSchema),
        400: ErrorResponseSchema,
        401: ErrorResponseSchema,
        404: ErrorResponseSchema,
      },
    },
    onRequest: [app.verifyToken],
    handler: userController.updateAvatar,
  });
}

export default userRoutes;
