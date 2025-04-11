import { FastifyInstance } from 'fastify';

import CategoryController from '@app/controllers/category.controller';
import { CategoryArrSchema, CategoryQuery, CategoryResSchema, UpSertCateSchema } from '@app/schemas/category.schemas';
import { PostCateQuery } from '@app/schemas/post.schemas';
import { ReqParams } from '@app/schemas/request.schema';
import {
  ErrorResponseSchema,
  PostListResponseSchema,
  SuccessResponseSchema,
  SuccessResWithoutDataSchema,
} from '@app/schemas/response.schemas';
import CategoryService from '@app/services/category.service';
import PostService from '@app/services/post.service';

export async function cateRoutesForAll(app: FastifyInstance) {
  const categoryController = new CategoryController(new CategoryService(), new PostService());
  app.get('/', {
    schema: {
      tags: ['Category'],
      querystring: CategoryQuery,
      response: {
        200: SuccessResponseSchema(CategoryArrSchema),
        400: ErrorResponseSchema,
      },
    },
    handler: categoryController.index,
  });

  app.get('/:id/posts', {
    schema: {
      tags: ['Category'],
      params: ReqParams,
      querystring: PostCateQuery,
      response: {
        201: SuccessResponseSchema(PostListResponseSchema),
        400: ErrorResponseSchema,
        404: ErrorResponseSchema,
      },
    },
    handler: categoryController.getPostsByCateId,
  });

  app.get('/:id', {
    schema: {
      tags: ['Category'],
      params: ReqParams,
      response: {
        200: SuccessResponseSchema(CategoryResSchema),
        404: ErrorResponseSchema,
      },
    },
    handler: categoryController.show,
  });
}

export async function cateRoutesForAdmin(app: FastifyInstance) {
  const categoryController = new CategoryController(new CategoryService(), new PostService());

  app.post('/', {
    schema: {
      tags: ['Category'],
      body: UpSertCateSchema,
      response: {
        201: SuccessResWithoutDataSchema,
        400: ErrorResponseSchema,
        401: ErrorResponseSchema,
        403: ErrorResponseSchema,
      },
    },
    // preHandler: [app.verifyToken, app.verifyAdmin],
    handler: categoryController.create,
  });

  app.put('/:id', {
    schema: {
      tags: ['Category'],
      params: ReqParams,
      body: UpSertCateSchema,
      response: {
        200: SuccessResWithoutDataSchema,
        400: ErrorResponseSchema,
        404: ErrorResponseSchema,
        401: ErrorResponseSchema,
        403: ErrorResponseSchema,
      },
    },
    preHandler: [app.verifyToken, app.verifyAdmin],
    handler: categoryController.edit,
  });

  app.delete('/:id', {
    schema: {
      tags: ['Category'],
      params: ReqParams,
      response: {
        200: SuccessResWithoutDataSchema,
        400: ErrorResponseSchema,
        404: ErrorResponseSchema,
        401: ErrorResponseSchema,
        403: ErrorResponseSchema,
      },
    },
    preHandler: [app.verifyToken, app.verifyAdmin],
    handler: categoryController.delete,
  });
}
