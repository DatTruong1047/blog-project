import { FastifyRequest, FastifyReply, FastifyPluginAsync, FastifyInstance } from 'fastify';
import fastifuPlugin from 'fastify-plugin';

import * as config from '@app/config';
import { RefreshTokenRequest, TokenPayload } from '@app/schemas/jwt.schemas';
import { Response } from '@app/schemas/response.schemas';

async function verifyToken(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify();
  } catch (error) {
    const errorResponse: Response = {
      message: `${error.message}`,
      code: config.ErrorCodes.UNAUTHORIZED,
    };
    reply.Unauthorized(errorResponse);
  }
}

async function verifyRefreshToken(request: FastifyRequest<{ Body: RefreshTokenRequest }>, reply: FastifyReply) {
  try {
    const { refreshToken } = request.body;

    if (!refreshToken) {
      const errorResponse: Response = {
        message: 'Refresh token is empty',
        code: config.ErrorCodes.REFRESH_TOKEN_IS_NULL,
      };
      return reply.BadRequest(errorResponse);
    }

    request.server.jwt.verify(refreshToken);
  } catch (error) {
    const errorResponse: Response = {
      message: 'Invalid refresh token',
      code: config.ErrorCodes.INVALID_REFRESH_TOKEN,
    };

    return reply.BadRequest(errorResponse);
  }
}

async function verifyAdmin(request: FastifyRequest, reply: FastifyReply) {
  try {
    const payload: TokenPayload = await request.jwtDecode();
    if (payload && payload.isAdmin === true) {
      return;
    } else {
      const errorResponse: Response = {
        message: 'You dont have permission',
        code: config.ErrorCodes.DONT_HAVE_PERMISSION,
      };
      reply.Forbidden(errorResponse);
    }
  } catch (error) {
    const errorResponse: Response = {
      message: 'Unauthorized',
      code: config.ErrorCodes.UNAUTHORIZED,
    };
    reply.Unauthorized(errorResponse);
  }
}

const authPlugin: FastifyPluginAsync = async (app: FastifyInstance) => {
  app.decorate('verifyToken', verifyToken);
  app.decorate('verifyAdmin', verifyAdmin);
  app.decorate('verifyRefreshToken', verifyRefreshToken);
};

export default fastifuPlugin(authPlugin);
