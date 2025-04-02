import { FastifyInstance } from 'fastify';

// import { cookieOption } from '@app/schemas/cookie.schemas';
import { accessTokenOption, refreshTokenOption } from '@app/config';
import { refreshToken, tokenPayload } from '@app/schemas/jwt.schemas';
import { comparePassword } from '@app/utils/hash.utils';
import { generateToken } from '@app/utils/jwt.utils';

export async function comparePasswordService(password: string, hashedPassword: string) {
  return await comparePassword(password, hashedPassword);
}

export function generateTokensService(fastify: FastifyInstance, payload: tokenPayload) {
  try {
    const accessTokenPayload: tokenPayload = {
      isAdmin: payload.isAdmin,
      userId: payload.userId,
      userEmail: payload.userEmail,
    };
    const refeshTokenPayload: tokenPayload = {
      userId: payload.userId,
    };

    const accessToken = generateToken(accessTokenPayload, fastify, accessTokenOption);
    const refreshToken = generateToken(refeshTokenPayload, fastify, refreshTokenOption);

    return { accessToken, refreshToken };
  } catch (error) {
    throw new Error(error);
  }
}

export async function saveRefreshTokenService(server: FastifyInstance, refreshTokenData: refreshToken) {
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

export async function updateRefreshTokenService(
  server: FastifyInstance,
  oldRefreshToken: string,
  newRefreshToken: refreshToken
) {
  const token = server.prisma.token.update({
    where: { refresh_token: oldRefreshToken },
    data: {
      refresh_token: newRefreshToken.token,
      expiresAt: newRefreshToken.expiresAt,
      ipAddress: newRefreshToken.ipAddress,
    },
  });
  return token;
}
