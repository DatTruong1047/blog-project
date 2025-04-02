import { FastifyRequest, FastifyReply } from 'fastify';

import * as config from '@app/config';
import { ErrorResponse } from '@app/schemas/response.schemas';

export async function checkEmailToken(request: FastifyRequest, reply: FastifyReply) {
  const { token } = request.query as { token: string };

  if (!token) {
    const errorResponse: ErrorResponse = {
      message: 'Token is not found',
      code: config.ErrorCodes.EMAIL_TOKEN_NOT_FOUND,
    };
    return reply.code(404).send(errorResponse);
  }
}
