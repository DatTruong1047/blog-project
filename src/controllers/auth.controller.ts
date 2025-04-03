import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

import * as config from '@app/config';
import { emailTokenOption, resetPasswordTokenOption } from '@app/config/email.config';
import { EmailTokenPayload, ResendEmailRequest, VerifyEmailResponse } from '@app/schemas/email.schemas';
import { RefreshToken, RefreshTokenRequest, TokenPayload } from '@app/schemas/jwt.schemas';
import { Response } from '@app/schemas/response.schemas';
import { ChangePasswordRequest, CreateUserInput, CreateUserResponse, LoginInput } from '@app/schemas/user.schemas';
import AuthService from '@app/services/auth.service';
import EmailService from '@app/services/mail.service';
import UserService from '@app/services/user.service';

export default class AuthController {
  private readonly userService: UserService;
  private readonly emailService: EmailService;
  private readonly authService: AuthService;

  constructor(fastify: FastifyInstance) {
    this.userService = new UserService(fastify);
    this.emailService = new EmailService(fastify);
    this.authService = new AuthService(fastify);
  }

  async registerHandler(request: FastifyRequest<{ Body: CreateUserInput }>, reply: FastifyReply) {
    try {
      const existingUser = await this.userService.getUserByEmail(request.body.email);

      if (existingUser) {
        const errorResponse: Response = {
          message: 'User is already exist',
          code: config.ErrorCodes.USER_ALREADY_EXISTS,
        };
        return reply.BadRequest(errorResponse);
      }

      // Create new user
      const user = await this.userService.createUser(request.body);

      // Create verified email token
      const emailPayload: EmailTokenPayload = { userEmail: user.email };
      const verificationEmailToken = this.emailService.generateEmailToken(emailPayload, emailTokenOption);

      // Send email to verified
      const emailSent = await this.emailService.sendVerificationEmail(user.email, verificationEmailToken);

      // Check sent email error
      if (!emailSent) {
        const errorResponse: Response = {
          message: 'Could not send verification email',
          code: config.ErrorCodes.SENT_EMAIL_FAIL,
        };
        return reply.BadRequest(errorResponse);
      }

      // Response
      const response: CreateUserResponse = {
        id: user.id,
        email: user.email,
      };

      return reply.Created(response);
    } catch (error) {
      return reply.InternalServer(error);
    }
  }

  async loginHandler(request: FastifyRequest<{ Body: LoginInput }>, reply: FastifyReply) {
    const body = request.body;
    const ipAddress = request.ip;
    try {
      // Check existing user
      const user = await this.userService.getUserByEmail(body.email);
      if (!user) {
        const errorResponse: Response = {
          message: 'User not found',
          code: config.ErrorCodes.USER_NOT_FOUND,
        };

        return reply.NotFound(errorResponse);
      }

      // Check verify email
      if (!user.isVerifiedEmail) {
        const errorResponse: Response = {
          message: 'Your account is available, but email is not verified',
          code: config.ErrorCodes.EMAIL_IS_NOT_VERIFIED,
        };

        return reply.BadRequest(errorResponse);
      }

      // Compare password
      const isComparedPass = await this.authService.comparePassword(body.password, user.password);

      if (!isComparedPass) {
        const errorResponse: Response = {
          message: 'Password incorrect',
          code: config.ErrorCodes.INCORRECT_PASSWORD,
        };

        return reply.BadRequest(errorResponse);
      }

      // Create access and refresh token
      const payload: TokenPayload = { isAdmin: user.isAdmin, userId: user.id, userEmail: user.email };
      const { accessToken, refreshToken } = this.authService.generateTokens(payload);

      // Save refreshToken to db
      const refreshTokenData: RefreshToken = {
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        ipAddress,
        userId: user.id,
      };
      await this.authService.saveRefreshToken(refreshTokenData);

      return reply.OK({ accessToken, refreshToken });
    } catch (error) {
      return reply.InternalServer(error);
    }
  }

  async refreshTokenHandler(request: FastifyRequest<{ Body: RefreshTokenRequest }>, reply: FastifyReply) {
    try {
      const currentRefreshToken = request.body.refreshToken;

      // Check is valid refresh token
      const storedRefreshToken = await request.server.prisma.token.findUnique({
        where: { refresh_token: currentRefreshToken },
        include: { users: true },
      });

      if (!storedRefreshToken) {
        const errorResponse: Response = {
          message: 'Invalid refresh token',
          code: config.ErrorCodes.INVALID_REFRESH_TOKEN,
        };
        return reply.Unauthorized(errorResponse);
      }

      if (storedRefreshToken.expiresAt < new Date()) {
        const errorResponse: Response = {
          message: 'Refresh token expired',
          code: config.ErrorCodes.INVALID_REFRESH_TOKEN,
        };

        // Delete expired token in DB
        this.authService.deleteRefreshToken(storedRefreshToken.refresh_token);

        return reply.Unauthorized(errorResponse);
      }

      // Generate new accessToken and refreshToken
      const payload: TokenPayload = {
        isAdmin: storedRefreshToken.users.isAdmin,
        userId: storedRefreshToken.users.id,
        userEmail: storedRefreshToken.users.email,
      };
      const { accessToken, refreshToken } = this.authService.generateTokens(payload);

      // Return
      return reply.OK({ accessToken, refreshToken });
    } catch (error) {
      return reply.InternalServer(error);
    }
  }

  async verifyEmailHanlder(request: FastifyRequest, reply: FastifyReply) {
    try {
      // Verify email
      const result = await this.emailService.verifiedEmail(request);

      if (result.status === 400) {
        const errorResponse: Response = {
          message: result.message,
          code: config.ErrorCodes.INVALID_EMAIL_TOKEN,
        };
        return reply.BadRequest(errorResponse);
      }
      if (result.status === 404) {
        const errorResponse: Response = {
          message: result.message,
          code: config.ErrorCodes.USER_NOT_FOUND,
        };
        return reply.NotFound(errorResponse);
      }

      const response: VerifyEmailResponse = {
        message: result.message,
      };

      return reply.Created(response);
    } catch (error) {
      return reply.InternalServer(error);
    }
  }

  async resendVeridationHandler(request: FastifyRequest<{ Body: ResendEmailRequest }>, reply: FastifyReply) {
    try {
      const email = request.body.email;

      // Find user by email
      const user = await this.userService.getUserByEmail(email);
      if (!user) {
        const errorResponse: Response = {
          message: 'User not found',
          code: config.ErrorCodes.USER_NOT_FOUND,
        };
        return reply.NotFound(errorResponse);
      }

      // email has already been verified
      if (user.isVerifiedEmail) {
        const errorResponse: Response = {
          message: 'Email has already been verified',
          code: config.ErrorCodes.EMAIL_HAS_BEEN_VERIFIED,
        };
        return reply.Conflict(errorResponse);
      }
      // Create verified email token
      const emailPayload: EmailTokenPayload = { userEmail: email };
      const verificationEmailToken = this.emailService.generateEmailToken(emailPayload, emailTokenOption);

      // Send email to verified
      const emailSent = await this.emailService.sendVerificationEmail(email, verificationEmailToken);

      // Check sent email error
      if (!emailSent) {
        const errorResponse: Response = {
          message: 'Could not send verification email',
          code: config.ErrorCodes.SENT_EMAIL_FAIL,
        };
        return reply.BadRequest(errorResponse);
      }
    } catch (error) {}
  }

  async forgotPasswordHandler(request: FastifyRequest<{ Body: ChangePasswordRequest }>, reply: FastifyReply) {
    try {
      const email = request.body.email;
      // Find user by email
      const user = await this.userService.getUserByEmail(email);
      if (!user) {
        const errorResponse: Response = {
          message: 'User not found',
          code: config.ErrorCodes.USER_NOT_FOUND,
        };
        return reply.NotFound(errorResponse);
      }

      // Create verified email token
      const emailPayload: EmailTokenPayload = { userEmail: email };
      const resetPasswordToken = this.emailService.generateEmailToken(emailPayload, resetPasswordTokenOption);

      // Send email to verified
      const emailSent = await this.emailService.sendResetPasswordEmail(email, resetPasswordToken);

      // Check sent email error
      if (!emailSent) {
        const errorResponse: Response = {
          message: 'Could not send email',
          code: config.ErrorCodes.SENT_EMAIL_FAIL,
        };
        return reply.BadRequest(errorResponse);
      }
      return reply.OK({ message: 'Sent email' });
    } catch (error) {
      return reply.InternalServer(error);
    }
  }
}
