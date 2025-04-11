import {} from '@fastify/multipart';
import { FastifyInstance } from 'fastify';

import PostController from '@app/controllers/post.controller';
import {
  CreatePostSchema,
  PostListResponseSchema,
  PostQuery,
  PostResponseSchema,
  UpdatePostSchema,
} from '@app/schemas/post.schemas';
import { ReqParams } from '@app/schemas/request.schema';
import { ErrorResponseSchema, SuccessResponseSchema, SuccessResWithoutDataSchema } from '@app/schemas/response.schemas';
import CategoryService from '@app/services/category.service';
import MediaService from '@app/services/media.service';
import PostService from '@app/services/post.service';
import PostMediaService from '@app/services/postMedia.service';
import { getFile } from '@app/utils/file.utils';

export async function postRoutes(app: FastifyInstance) {
  const postControler = new PostController(
    new PostService(),
    new MediaService(),
    new PostMediaService(),
    new CategoryService()
  );

  app.get('/', {
    schema: {
      tags: ['Post'],
      querystring: PostQuery,
      response: {
        202: SuccessResponseSchema(PostListResponseSchema),
        400: ErrorResponseSchema,
        404: ErrorResponseSchema,
      },
    },
    handler: postControler.index,
  });

  app.get('/:id', {
    schema: {
      tags: ['Post'],
      params: ReqParams,
      response: {
        200: PostResponseSchema,
        400: ErrorResponseSchema,
        404: ErrorResponseSchema,
      },
    },
    handler: postControler.show,
  });

  app.post('/', {
    schema: {
      tags: ['Post'],
      body: CreatePostSchema,
      response: {
        201: SuccessResWithoutDataSchema,
        400: ErrorResponseSchema,
        401: ErrorResponseSchema,
        403: ErrorResponseSchema,
        404: ErrorResponseSchema,
      },
    },
    preHandler: [app.verifyToken],
    handler: postControler.create,
  });
}
