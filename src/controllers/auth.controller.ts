import { FastifyReply, FastifyRequest } from 'fastify';

import * as config from '@app/config';
import { emailTokenOption, resetPasswordTokenOption } from '@app/config/email.config';
import { binding } from '@app/decorator/binding.decorator';
import { EmailTokenPayload, ResendEmailRequest, VerifyEmailResponse } from '@app/schemas/email.schemas';
import { RefreshToken, RefreshTokenRequest, TokenPayload } from '@app/schemas/jwt.schemas';
import { ErrorResponseType, SuccessResponseType, SuccessResWithoutDataType } from '@app/schemas/response.schemas';
import {
  CreateUserInput,
  CreateUserResponse,
  ForgotPasswordRequest,
  LoginInput,
  LoginResType,
  RefreshTokenResType,
  ResetPasswordType,
} from '@app/schemas/user.schemas';
import AuthService from '@app/services/auth.service';
import EmailService from '@app/services/mail.service';
import UserService from '@app/services/user.service';

export default class AuthController {
  constructor(
    private readonly userService: UserService,
    private readonly emailService: EmailService,
    private readonly authService: AuthService
  ) {}

  @binding
  async register(request: FastifyRequest, reply: FastifyReply) {
    try {
      const body = request.body as CreateUserInput;

      const existingUser = await this.userService.getUserByEmail(body.email);
      if (existingUser) {
        const errorResponse: ErrorResponseType = {
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

      // Send email
      const emailSent = await this.emailService.sendVerificationEmail(user.email, verificationEmailToken);

      // Check sent email error
      if (!emailSent) {
        const errorResponse: ErrorResponseType = {
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

      const res: SuccessResponseType<CreateUserResponse> = {
        code: 201,
        data: response,
      };

      return reply.Created(res);
    } catch (error) {
      return reply.InternalServer(error);
    }
  }

  @binding
  async login(request: FastifyRequest<{ Body: LoginInput }>, reply: FastifyReply) {
    const body = request.body;
    const ipAddress = request.ip;

    try {
      // Check existing user
      const user = await this.userService.getUserByEmail(body.email);
      //console.log(user);

      if (!user) {
        const errorResponse: ErrorResponseType = {
          message: 'User not found',
          code: config.ErrorCodes.USER_NOT_FOUND,
        };

        return reply.NotFound(errorResponse);
      }

      // Check verify email
      if (!user.isVerifiedEmail) {
        const errorResponse: ErrorResponseType = {
          message: 'Your account is available, but email is not verified',
          code: config.ErrorCodes.EMAIL_IS_NOT_VERIFIED,
        };

        return reply.BadRequest(errorResponse);
      }

      // Compare password
      const isComparedPass = await this.authService.comparePassword(body.password, user.password);

      if (!isComparedPass) {
        const errorResponse: ErrorResponseType = {
          message: 'Password incorrect',
          code: config.ErrorCodes.INCORRECT_PASSWORD,
        };

        return reply.BadRequest(errorResponse);
      }

      // Create access and refresh token
      const payload: TokenPayload = { isAdmin: user.isAdmin, userId: user.id, userEmail: user.email };
      const loginRes: LoginResType = this.authService.generateTokens(payload);

      // Save refreshToken to db
      const refreshTokenData: RefreshToken = {
        token: loginRes.refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        ipAddress,
        userId: user.id,
      };

      await this.authService.saveRefreshToken(refreshTokenData);

      const res: SuccessResponseType<LoginResType> = {
        code: 200,
        data: loginRes,
      };

      return reply.OK(res);
    } catch (error) {
      return reply.InternalServer(error);
    }
  }

  @binding
  async refreshToken(request: FastifyRequest<{ Body: RefreshTokenRequest }>, reply: FastifyReply) {
    try {
      const currentRefreshToken = request.body.refreshToken;
      const ipAddress = request.ip;

      // Check is valid refresh token
      const storedRefreshToken = await this.authService.findToken(currentRefreshToken);

      if (!storedRefreshToken) {
        const errorResponse: ErrorResponseType = {
          message: 'Invalid refresh token',
          code: config.ErrorCodes.INVALID_REFRESH_TOKEN,
        };
        return reply.Unauthorized(errorResponse);
      }

      if (storedRefreshToken.expiresAt < new Date()) {
        const errorResponse: ErrorResponseType = {
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

      const tokens: RefreshTokenResType = this.authService.generateTokens(payload);

      // Save refreshToken to db
      const refreshTokenData: RefreshToken = {
        token: tokens.refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        ipAddress,
        userId: storedRefreshToken.user_id,
      };

      await this.authService.saveRefreshToken(refreshTokenData);

      const res: SuccessResponseType<RefreshTokenResType> = {
        code: 200,
        data: tokens,
      };
      // Return
      return reply.OK(res);
    } catch (error) {
      return reply.InternalServer(error);
    }
  }

  @binding
  async verifyEmail(request: FastifyRequest, reply: FastifyReply) {
    try {
      // Verify email
      const result = await this.emailService.verifiedEmail(request);

      if (result.status === 400) {
        const errorResponse: ErrorResponseType = {
          message: result.message,
          code: config.ErrorCodes.INVALID_EMAIL_TOKEN,
        };
        return reply.BadRequest(errorResponse);
      }
      if (result.status === 404) {
        const errorResponse: ErrorResponseType = {
          message: result.message,
          code: config.ErrorCodes.USER_NOT_FOUND,
        };
        return reply.NotFound(errorResponse);
      }

      const response: VerifyEmailResponse = {
        message: result.message,
      };

      const res: SuccessResponseType<VerifyEmailResponse> = {
        code: 200,
        data: response,
      };

      return reply.Created(res);
    } catch (error) {
      return reply.InternalServer(error);
    }
  }

  @binding
  async resendVerifyEmail(request: FastifyRequest<{ Body: ResendEmailRequest }>, reply: FastifyReply) {
    try {
      const email = request.body.email;

      // Find user by email
      const user = await this.userService.getUserByEmail(email);
      if (!user) {
        const errorResponse: ErrorResponseType = {
          message: 'User not found',
          code: config.ErrorCodes.USER_NOT_FOUND,
        };

        return reply.NotFound(errorResponse);
      }

      // email has already been verified
      if (user.isVerifiedEmail) {
        const errorResponse: ErrorResponseType = {
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
        const errorResponse: ErrorResponseType = {
          message: 'Could not send verification email',
          code: config.ErrorCodes.SENT_EMAIL_FAIL,
        };
        return reply.BadRequest(errorResponse);
      }

      const res: SuccessResWithoutDataType = {
        code: 200,
        status: 'success',
      };

      return reply.OK(res);
    } catch (error) {
      return reply.InternalServer(error);
    }
  }

  @binding
  async forgotPassword(request: FastifyRequest<{ Body: ForgotPasswordRequest }>, reply: FastifyReply) {
    try {
      const email = request.body.email;
      // Find user by email
      const user = await this.userService.getUserByEmail(email);
      if (!user) {
        const errorResponse: ErrorResponseType = {
          message: 'User not found',
          code: config.ErrorCodes.USER_NOT_FOUND,
        };
        return reply.NotFound(errorResponse);
      }

      // Create reset-password token
      const emailPayload: EmailTokenPayload = { userEmail: email };
      const resetPasswordToken = this.emailService.generateEmailToken(emailPayload, resetPasswordTokenOption);

      // Send email to reset-password
      const emailSent = await this.emailService.sendResetPasswordEmail(email, resetPasswordToken);

      // Check sent email error
      if (!emailSent) {
        const errorResponse: ErrorResponseType = {
          message: 'Could not send email',
          code: config.ErrorCodes.SENT_EMAIL_FAIL,
        };
        return reply.BadRequest(errorResponse);
      }

      // Save forgot_token
      await this.userService.saveForgotToken(user.id, resetPasswordToken);

      const res: SuccessResWithoutDataType = {
        code: 200,
        status: 'Success',
      };
      return reply.OK(res);
    } catch (error) {
      return reply.InternalServer(error);
    }
  }

  @binding
  async resetPassword(request: FastifyRequest<{ Body: ResetPasswordType }>, reply: FastifyReply) {
    try {
      const { email, password, resetToken } = request.body;

      const user = await this.userService.getUserByEmail(email);
      if (!user) {
        const errorResponse: ErrorResponseType = {
          message: 'User not found',
          code: config.ErrorCodes.USER_NOT_FOUND,
        };

        return reply.BadRequest(errorResponse);
      }

      try {
        const decodeToken: EmailTokenPayload = request.server.jwt.verify(resetToken);

        if (decodeToken.userEmail !== user.email) {
          const errorResponse: ErrorResponseType = {
            message: 'Invalid refresh token',
            code: config.ErrorCodes.INVALID_REFRESH_TOKEN,
          };

          return reply.BadRequest(errorResponse);
        }
      } catch (error) {
        const errorResponse: ErrorResponseType = {
          message: 'Invalid refresh token',
          code: config.ErrorCodes.INVALID_REFRESH_TOKEN,
        };

        return reply.BadRequest(errorResponse);
      }

      await this.userService.updatePassword(user.id, password);

      const res: SuccessResWithoutDataType = {
        code: 200,
        status: 'success',
      };

      reply.OK(res);
    } catch (error) {
      return reply.InternalServer(error);
    }
  }
}
