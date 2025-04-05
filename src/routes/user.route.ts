import { FastifyInstance, FastifyRequest } from 'fastify';

import UserController from '@app/controllers/user.controller';
import { ResponseSchema } from '@app/schemas/response.schemas';
import {
  ChangePasswordRequestSchema,
  UpdateProfileRequest,
  UpdateProfileSchema,
  UserProfileResponseSchema,
} from '@app/schemas/user.schemas';
import UserService from '@app/services/user.service';
import { parseBirthDay } from '@app/validations/user.validation';

async function userRoutes(app: FastifyInstance) {
  const userController = new UserController(new UserService());

  app.get('/me', {
    schema: {
      tags: ['User'],
      response: {
        200: UserProfileResponseSchema,
        400: ResponseSchema,
        401: ResponseSchema,
        404: ResponseSchema,
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
        400: ResponseSchema,
        401: ResponseSchema,
        404: ResponseSchema,
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
        400: ResponseSchema,
        401: ResponseSchema,
        404: ResponseSchema,
      },
    },
    onRequest: [app.verifyToken],
    handler: userController.changePassword,
  });
}

export default userRoutes;
