import { FastifyInstance } from 'fastify';

// import { cookieOption } from '@app/schemas/cookie.schemas';
import { accessTokenOption, refreshTokenOption } from '@app/config';
import { RefreshToken, TokenPayload } from '@app/schemas/jwt.schemas';
import { comparePassword } from '@app/utils/hash.utils';
import { generateToken } from '@app/utils/jwt.utils';

export default class AuthService {
  private readonly fastify: FastifyInstance;

  constructor(fastify: FastifyInstance) {
    this.fastify = fastify;
  }

  async comparePassword(password: string, hashedPassword: string) {
    return await comparePassword(password, hashedPassword);
  }

  generateTokens(payload: TokenPayload) {
    try {
      const accessTokenPayload: TokenPayload = {
        isAdmin: payload.isAdmin,
        userId: payload.userId,
        userEmail: payload.userEmail,
      };
      const refeshTokenPayload: TokenPayload = {
        userId: payload.userId,
      };

      const accessToken = generateToken(accessTokenPayload, this.fastify, accessTokenOption);
      const refreshToken = generateToken(refeshTokenPayload, this.fastify, refreshTokenOption);

      return { accessToken, refreshToken };
    } catch (error) {
      throw new Error(error);
    }
  }

  async saveRefreshToken(refreshTokenData: RefreshToken) {
    const token = this.fastify.prisma.token.create({
      data: {
        refresh_token: refreshTokenData.token,
        expiresAt: refreshTokenData.expiresAt,
        ipAddress: refreshTokenData.ipAddress,
        user_id: refreshTokenData.userId,
      },
    });

    return token;
  }

  async updateRefreshToken(oldRefreshToken: string, newRefreshToken: RefreshToken) {
    const token = this.fastify.prisma.token.update({
      where: { refresh_token: oldRefreshToken },
      data: {
        refresh_token: newRefreshToken.token,
        expiresAt: newRefreshToken.expiresAt,
        ipAddress: newRefreshToken.ipAddress,
      },
    });
    return token;
  }

  async deleteRefreshToken(refreshToken: string) {
    const token = this.fastify.prisma.token.delete({
      where: { refresh_token: refreshToken },
    });
    return token;
  }
}
