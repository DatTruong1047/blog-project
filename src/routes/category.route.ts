import { FastifyInstance } from 'fastify';

import CategoryController from '@app/controllers/category.controller';
import {
  CategoryArrSchema,
  CategoryParams,
  CategoryQuery,
  CategoryResSchema,
  UpSertCateSchema,
} from '@app/schemas/category.schemas';
import { ErrorResponseSchema, SuccessResponseSchema, SuccessResWithoutDataSchema } from '@app/schemas/response.schemas';
import CategoryService from '@app/services/category.service';

export async function cateRoutesForAll(app: FastifyInstance) {
  const categoryController = new CategoryController(new CategoryService());
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

  app.get('/:id', {
    schema: {
      tags: ['Category'],
      params: CategoryParams,
      response: {
        200: SuccessResponseSchema(CategoryResSchema),
        404: ErrorResponseSchema,
      },
    },
    handler: categoryController.show,
  });
}

export async function cateRoutesForAdmin(app: FastifyInstance) {
  const categoryController = new CategoryController(new CategoryService());

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
      params: CategoryParams,
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
      params: CategoryParams,
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
