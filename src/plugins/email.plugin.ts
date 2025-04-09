import { FastifyRequest, FastifyReply, FastifyPluginAsync } from 'fastify';
import fastifuPlugin from 'fastify-plugin';

import app from '@app/app';
import * as config from '@app/config';
import { EmailTokenPayload } from '@app/schemas/email.schemas';
import { ErrorResponseType } from '@app/schemas/response.schemas';

export async function verifyEmailToken(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { token } = request.query as { token: string };

    if (!token) {
      const errorResponse: ErrorResponseType = {
        message: 'Token is not found',
        code: config.ErrorCodes.EMAIL_TOKEN_NOT_FOUND,
      };
      return reply.NotFound(errorResponse);
    }

    const decoded: EmailTokenPayload = app.jwt.verify(token);
    request.decodedEmailToken = decoded;
  } catch (error) {
    const errorResponse: ErrorResponseType = {
      message: error.message,
      code: config.ErrorCodes.INVALID_EMAIL_TOKEN,
    };

    return reply.BadRequest(errorResponse);
  }
}

const emailPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.decorate('verifyEmailToken', verifyEmailToken);
};

export default fastifuPlugin(emailPlugin);
