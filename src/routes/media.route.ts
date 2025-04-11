import { FastifyInstance } from 'fastify';

import MediaController from '@app/controllers/media.controller';
import { CreateMediaSchema, DeleteMediaSchema, MediaSchema } from '@app/schemas/media.schemas';
import { ReqParams } from '@app/schemas/request.schema';
import { ErrorResponseSchema, SuccessResponseSchema, SuccessResWithoutDataSchema } from '@app/schemas/response.schemas';
import MediaService from '@app/services/media.service';
import { getFile } from '@app/utils/file.utils';

export async function mediaRoutes(app: FastifyInstance) {
  const mediaController = new MediaController(new MediaService());

  app.post('/', {
    schema: {
      consumes: ['multipart/form-data'],
      tags: ['Media'],
      response: {
        201: SuccessResponseSchema(MediaSchema),
        400: ErrorResponseSchema,
        401: ErrorResponseSchema,
        403: ErrorResponseSchema,
        404: ErrorResponseSchema,
      },
    },
    preHandler: [getFile],
    handler: mediaController.create,
  });

  app.get('/:id', {
    schema: {
      tags: ['Media'],
      params: ReqParams,
      response: {
        200: SuccessResponseSchema(MediaSchema),
        400: ErrorResponseSchema,
        404: ErrorResponseSchema,
      },
    },
    handler: mediaController.show,
  });

  app.delete('/', {
    schema: {
      tags: ['Media'],
      body: DeleteMediaSchema,
      response: {
        200: SuccessResWithoutDataSchema,
        400: ErrorResponseSchema,
        404: ErrorResponseSchema,
      },
    },
    handler: mediaController.delete,
  });
}
