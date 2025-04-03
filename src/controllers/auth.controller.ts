import { FastifyReply, FastifyRequest } from 'fastify';

import { accessTokenOption, refreshTokenOption } from '@app/config';
// import { cookieOption } from '@app/schemas/cookie.schemas';
import { refreshToken, tokenPayload } from '@app/schemas/jwt.schemas';
import { CreateUserInput, LoginInput } from '@app/schemas/user.schemas';
import { comparePass, generateTokenService, saveRefreshToken } from '@app/services/auth.service';
import { createUser, getUserByEmail } from '@app/services/user.service';

export async function registerHandler(request: FastifyRequest<{ Body: CreateUserInput }>, reply: FastifyReply) {
  const body = request.body;

  try {
    const user = await createUser(body, request.server);
    console.log('controller' + user);

    return reply.code(201).send(user);
  } catch (error) {
    return reply.code(500).send(error);
  }
}
export async function loginHandler(request: FastifyRequest<{ Body: LoginInput }>, reply: FastifyReply) {
  const body = request.body;
  const ipAddress = request.ip;
  try {
    // Is existing user
    const user = await getUserByEmail(body.email, request.server);
    if (!user) {
      return reply.code(404).send({ message: 'User not found' });
    }

    // Compare password
    const isComparedPass = await comparePass(body.password, user.password);
    if (!isComparedPass) {
      return reply.code(401).send({ message: 'Password incorrect' });
    }

    // Create access token
    const payload: tokenPayload = {
      isAdmin: user.isAdmin,
      userId: user.id,
      userEmail: user.email,
    };
    const accessToken = generateTokenService(payload, request.server, accessTokenOption);

    // Create refresh token
    const refeshTokenPayload: tokenPayload = {
      userId: user.id,
    };
    const refreshToken = generateTokenService(refeshTokenPayload, request.server, refreshTokenOption);

    // Save refreshToken
    const refreshTokenData: refreshToken = {
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      ipAddress,
      userId: user.id,
    };
    await saveRefreshToken(request.server, refreshTokenData);

    return reply.status(200).send({ accessToken, refreshToken });
  } catch (error) {
    return reply.code(500).send(error);
  }
}
