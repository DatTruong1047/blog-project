import { FastifyReply, FastifyRequest } from 'fastify';

import * as config from '@app/config';
import { emailTokenOption } from '@app/config/email.config';
import { emailPayload, verifyEmailResponse } from '@app/schemas/email.schemas';
import { refreshToken, refreshTokenRequest, tokenPayload } from '@app/schemas/jwt.schemas';
import { ErrorResponse } from '@app/schemas/response.schemas';
import { CreateUserInput, createUserResponse, LoginInput } from '@app/schemas/user.schemas';
import {
  comparePasswordService,
  generateTokensService,
  saveRefreshTokenService,
  updateRefreshTokenService,
} from '@app/services/auth.service';
import {
  generateVerifyEmailTokenService,
  sendVerificationEmail,
  verifiedEmailService,
} from '@app/services/mail.service';
import { createUserService, getUserByEmailService } from '@app/services/user.service';

export async function registerHandler(request: FastifyRequest<{ Body: CreateUserInput }>, reply: FastifyReply) {
  try {
    // Create new user
    const user = await createUserService(request.body, request.server);

    // Create verified email token
    const emailPayload: emailPayload = { userEmail: user.email };
    const verificationEmailToken = generateVerifyEmailTokenService(emailPayload, request.server, emailTokenOption);

    // Send email to verified
    const emailSent = await sendVerificationEmail(user.email, verificationEmailToken);

    // Check sent email error
    if (!emailSent) {
      const errorResponse: ErrorResponse = {
        message: 'Could not send verification email',
        code: config.ErrorCodes.SENT_EMAIL_FAIL,
      };
      return reply.status(400).send(errorResponse);
    }

    // Response
    const response: createUserResponse = {
      data: user,
      message: 'Sign up successful. Please check your email to verify',
    };

    return reply.status(201).send(response);
  } catch (error) {
    return reply.status(500).send(error);
  }
}

export async function loginHandler(request: FastifyRequest<{ Body: LoginInput }>, reply: FastifyReply) {
  const body = request.body;
  const ipAddress = request.ip;
  try {
    // Check existing user
    const user = await getUserByEmailService(body.email, request.server);
    if (!user) {
      const errorResponse: ErrorResponse = {
        message: 'User not found',
        code: config.ErrorCodes.USER_NOT_FOUND,
      };

      return reply.status(404).send(errorResponse);
    }

    // Check verify email
    if (!user.isVerifiedEmail) {
      const errorResponse: ErrorResponse = {
        message: 'Your account is available, but email is not verified',
        code: config.ErrorCodes.EMAIL_IS_NOT_VERIFIED,
      };

      return reply.status(400).send(errorResponse);
    }

    // Compare password
    const isComparedPass = await comparePasswordService(body.password, user.password);

    if (!isComparedPass) {
      const errorResponse: ErrorResponse = {
        message: 'Password incorrect',
        code: config.ErrorCodes.INCORRECT_PASSWORD,
      };

      return reply.status(400).send(errorResponse);
    }

    // Create access and refresh token
    const payload: tokenPayload = { isAdmin: user.isAdmin, userId: user.id, userEmail: user.email };
    const { accessToken, refreshToken } = generateTokensService(request.server, payload);

    // Save refreshToken to db
    const refreshTokenData: refreshToken = {
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      ipAddress,
      userId: user.id,
    };
    await saveRefreshTokenService(request.server, refreshTokenData);

    return reply.status(200).send({ accessToken, refreshToken });
  } catch (error) {
    return reply.status(500).send(error);
  }
}

export async function refreshTokenHandler(request: FastifyRequest<{ Body: refreshTokenRequest }>, reply: FastifyReply) {
  try {
    const ipAddress = request.ip;
    const currentRefreshToken = request.body.refreshToken;

    // Check is valid refresh token
    const storedRefreshToken = await request.server.prisma.token.findUnique({
      where: { refresh_token: currentRefreshToken },
      include: { users: true },
    });

    if (!storedRefreshToken) {
      return reply.status(401).send({ message: 'Invalid refresh token' });
    }

    if (storedRefreshToken.expiresAt < new Date()) {
      return reply.status(401).send({ message: 'Refresh token expired' });
    }

    // Generate new accessToken and refreshToken
    const payload: tokenPayload = {
      isAdmin: storedRefreshToken.users.isAdmin,
      userId: storedRefreshToken.users.id,
      userEmail: storedRefreshToken.users.email,
    };
    const { accessToken, refreshToken } = generateTokensService(request.server, payload);

    // Update new resfreshToken in DB
    const newRefreshTokenData: refreshToken = {
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      ipAddress,
      userId: storedRefreshToken.users.id,
    };
    await updateRefreshTokenService(request.server, currentRefreshToken, newRefreshTokenData);

    // Return
    return reply.status(200).send({ accessToken, refreshToken });
  } catch (error) {
    return reply.code(500).send(error);
  }
}

export async function verifyEmailHanlder(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { token } = request.query as { token: string };

    // Verify email
    const result = await verifiedEmailService(request.server, token);

    if (result.status === 400 || result.status === 404) {
      const errorResponse: ErrorResponse = {
        message: result.message,
        code: config.ErrorCodes.INVALID_EMAIL_TOKEN,
      };
      return reply.code(400).send(errorResponse);
    }

    const response: verifyEmailResponse = {
      message: result.message,
    };

    return reply.code(200).send(response);
  } catch (error) {
    return reply.code(500).send(error);
  }
}
