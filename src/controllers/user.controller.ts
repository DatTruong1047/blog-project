import { FastifyReply, FastifyRequest } from 'fastify';

import * as config from '@app/config';
import { binding } from '@app/decorator/binding.decorator';
import { Response } from '@app/schemas/response.schemas';
import { ChangePasswordRequest, UpdateProfileRequest, UserProfileResponse } from '@app/schemas/user.schemas';
import UserService from '@app/services/user.service';
import { comparePassword } from '@app/utils/hash.utils';

export default class UserController {
  constructor(private readonly userService: UserService) {}

  @binding
  async index(request: FastifyRequest, reply: FastifyReply) {
    try {
      // ID in token
      const userEmail = request.decodeAccessToken.userEmail;
      const user = await this.userService.getUserByEmail(userEmail);

      if (!user) {
        const errorResponse: Response = {
          code: config.ErrorCodes.USER_NOT_FOUND,
          message: 'User not found',
        };
        return reply.NotFound(errorResponse);
      }

      const userResponse: UserProfileResponse = {
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
        birthDay: user.birthDay,
        gender: user.gender,
        address: user.address,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };

      reply.OK(userResponse);
    } catch (error) {
      return reply.InternalServer(error);
    }
  }

  @binding
  async update(request: FastifyRequest<{ Body: UpdateProfileRequest }>, reply: FastifyReply) {
    try {
      // ID in token
      const userId = request.decodeAccessToken.userId;

      // Get existing user
      const user = await this.userService.getUserById(userId);
      if (!user) {
        const errorResponse: Response = {
          code: config.ErrorCodes.USER_NOT_FOUND,
          message: 'User not found',
        };
        return reply.NotFound(errorResponse);
      }

      this.userService.updateProfile(userId, request.body);
      return reply.OK({ message: 'Update successful' });
    } catch (error) {
      return reply.InternalServer(error);
    }
  }

  @binding
  async changePassword(request: FastifyRequest<{ Body: ChangePasswordRequest }>, reply: FastifyReply) {
    try {
      // ID in token
      const userId = request.decodeAccessToken.userId;

      // Get existing user
      const user = await this.userService.getUserById(userId);
      if (!user) {
        const errorResponse: Response = {
          code: config.ErrorCodes.USER_NOT_FOUND,
          message: 'User not found',
        };
        return reply.NotFound(errorResponse);
      }

      // compare Password
      const isTruePassword = await comparePassword(request.body.oldPassword, user.password);
      if (!isTruePassword) {
        const errorResponse: Response = {
          code: config.ErrorCodes.INCORRECT_PASSWORD,
          message: 'Incorrect password',
        };
        return reply.NotFound(errorResponse);
      }

      this.userService.updatePassword(userId, request.body.password);
      return reply.OK({ message: 'Change password successful' });
    } catch (error) {
      return reply.InternalServer(error);
    }
  }
}
