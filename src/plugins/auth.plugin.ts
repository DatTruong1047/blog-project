import { FastifyRequest, FastifyReply } from 'fastify';

import * as config from '@app/config';
import { refreshTokenRequest, tokenPayload } from '@app/schemas/jwt.schemas';
import { ErrorResponse } from '@app/schemas/response.schemas';

export async function verifyToken(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify();
  } catch (error) {
    const errorResponse: ErrorResponse = {
      message: 'Unauthorized',
      code: config.ErrorCodes.UNAUTHORIZED,
    };
    reply.status(401).send(errorResponse);
  }
}

export async function verifyRefreshToken(request: FastifyRequest<{ Body: refreshTokenRequest }>, reply: FastifyReply) {
  try {
    const { refreshToken } = request.body;

    if (!refreshToken) {
      const errorResponse: ErrorResponse = {
        message: 'Refresh token is empty',
        code: config.ErrorCodes.REFRESH_TOKEN_IS_NULL,
      };
      return reply.status(400).send(errorResponse);
    }

    request.server.jwt.verify(refreshToken);
  } catch (error) {
    const errorResponse: ErrorResponse = {
      message: 'Invalid refresh token',
      code: config.ErrorCodes.INVALID_REFRESH_TOKEN,
    };

    return reply.code(400).send(errorResponse);
  }
}

export async function verifyAdmin(request: FastifyRequest, reply: FastifyReply) {
  try {
    const payload: tokenPayload = await request.jwtDecode();
    if (payload && payload.isAdmin === true) {
      return;
    } else {
      const errorResponse: ErrorResponse = {
        message: 'You dont have permission',
        code: config.ErrorCodes.DONT_HAVE_PERMISSION,
      };
      reply.status(403).send(errorResponse);
    }
  } catch (error) {
    const errorResponse: ErrorResponse = {
      message: 'Unauthorized',
      code: config.ErrorCodes.UNAUTHORIZED,
    };
    reply.status(401).send(errorResponse);
  }
}
