import { FastifyInstance } from 'fastify';

import UserController from '@app/controllers/user.controller';
import { MyPostQuery, PostListResponseSchema, UpdatePostSchema } from '@app/schemas/post.schemas';
import { ReqParams } from '@app/schemas/request.schema';
import {
  ErrorResponseSchema,
  SuccessResponseSchema,
  SuccessResWithoutDataSchema,
  UpLoadFileResponseSchema,
} from '@app/schemas/response.schemas';
import { ChangePasswordRequestSchema, UpdateProfileSchema, UserProfileResponseSchema } from '@app/schemas/user.schemas';
import CategoryService from '@app/services/category.service';
import FileService from '@app/services/media.service';
import PostService from '@app/services/post.service';
import UserService from '@app/services/user.service';
import { getFile, parseBirthDay } from '@app/validations/user.validation';

async function userRoutes(app: FastifyInstance) {
  const userController = new UserController(
    new UserService(),
    new FileService(),
    new PostService(),
    new CategoryService()
  );

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
    handler: userController.show,
  });

  app.get('/me/posts', {
    schema: {
      tags: ['Post'],
      querystring: MyPostQuery,
      response: {
        200: SuccessResponseSchema(PostListResponseSchema),
        400: ErrorResponseSchema,
        401: ErrorResponseSchema,
        404: ErrorResponseSchema,
      },
    },
    onRequest: [app.verifyToken],
    handler: userController.showMyPost,
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
    handler: userController.edit,
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
    preValidation: [getFile],
    handler: userController.updateAvatar,
  });

  app.put('/me/post/:id', {
    schema: {
      tags: ['Post'],
      params: ReqParams,
      body: UpdatePostSchema,
      response: {
        200: SuccessResWithoutDataSchema,
        400: ErrorResponseSchema,
        404: ErrorResponseSchema,
      },
    },
    preHandler: [app.verifyToken],
    handler: userController.editPost,
  });

  app.delete('/me/post/:id', {
    schema: {
      tags: ['Post'],
      params: ReqParams,
      response: {
        200: SuccessResWithoutDataSchema,
        400: ErrorResponseSchema,
        404: ErrorResponseSchema,
      },
    },
    preHandler: [app.verifyToken],
    handler: userController.deletePost,
  });
}

export default userRoutes;
