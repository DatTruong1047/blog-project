import { FastifyInstance } from 'fastify';

// import { cookieOption } from '@app/schemas/cookie.schemas';
import { refreshToken, tokenOption, tokenPayload } from '@app/schemas/jwt.schemas';
import { comparePassword } from '@app/utils/hash.utils';
import { generateToken } from '@app/utils/jwt.utils';

export async function comparePass(password: string, hashedPassword: string) {
  return await comparePassword(password, hashedPassword);
}

export function generateTokenService(payload: tokenPayload, fastify: FastifyInstance, option: tokenOption) {
  try {
    return generateToken(payload, fastify, option);
  } catch (error) {
    throw new Error(error);
  }
}

export async function saveRefreshToken(server: FastifyInstance, refreshTokenData: refreshToken) {
  const token = server.prisma.token.create({
    data: {
      refresh_token: refreshTokenData.token,
      expiresAt: refreshTokenData.expiresAt,
      ipAddress: refreshTokenData.ipAddress,
      user_id: refreshTokenData.userId,
    },
  });
  return token;
}

/*
export function setTokenCookie(reply: FastifyReply, cookieName: string, token: string, option: cookieOption) {
  try {
    reply.setCookie(cookieName, token, option);
  } catch (error) {
    throw new Error(error);
  }
}
*/
