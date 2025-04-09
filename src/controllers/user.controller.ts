import { FastifyReply, FastifyRequest } from 'fastify';

import * as config from '@app/config';
import { binding } from '@app/decorator/binding.decorator';
import { CreateMediaType } from '@app/schemas/media.schemas';
import {
  ErrorResponseType,
  SuccessResponseType,
  SuccessResWithoutDataType,
  UpLoadFileResType,
} from '@app/schemas/response.schemas';
import { ChangePasswordRequest, UpdateProfileRequest, UserProfileResponse } from '@app/schemas/user.schemas';
import MediaService from '@app/services/media.service';
import UserService from '@app/services/user.service';
import { deleteFile } from '@app/utils/file.utils';
import { comparePassword } from '@app/utils/hash.utils';

export default class UserController {
  constructor(private readonly userService: UserService, private readonly mediaService: MediaService) {}

  @binding
  async index(request: FastifyRequest, reply: FastifyReply) {
    try {
      // ID in token
      const userEmail = request.decodeAccessToken.userEmail;
      const user = await this.userService.getUserProfileByEmail(userEmail);

      if (!user) {
        const errorResponse: ErrorResponseType = {
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
        avatarPath: user.media.url,
      };

      const res: SuccessResponseType<UserProfileResponse> = {
        code: 200,
        data: userResponse,
      };

      return reply.OK(res);
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
        const errorResponse: ErrorResponseType = {
          code: config.ErrorCodes.USER_NOT_FOUND,
          message: 'User not found',
        };
        return reply.NotFound(errorResponse);
      }

      this.userService.updateProfile(userId, request.body);

      const res: SuccessResWithoutDataType = {
        code: 200,
        status: 'Scccess',
      };

      return reply.OK(res);
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
        const errorResponse: ErrorResponseType = {
          code: config.ErrorCodes.USER_NOT_FOUND,
          message: 'User not found',
        };
        return reply.NotFound(errorResponse);
      }

      // compare Password
      const isTruePassword = await comparePassword(request.body.oldPassword, user.password);
      if (!isTruePassword) {
        const errorResponse: ErrorResponseType = {
          code: config.ErrorCodes.INCORRECT_PASSWORD,
          message: 'Incorrect password',
        };
        return reply.NotFound(errorResponse);
      }

      this.userService.updatePassword(userId, request.body.password);

      const res: SuccessResWithoutDataType = {
        code: 200,
        status: 'Succcess',
      };

      return reply.OK(res);
    } catch (error) {
      return reply.InternalServer(error);
    }
  }

  @binding
  async updateAvatar(request: FastifyRequest, reply: FastifyReply) {
    try {
      // ID in token
      const userId = request.decodeAccessToken.userId;

      // Get existing user
      const user = await this.userService.getUserById(userId);
      if (!user) {
        const errorResponse: ErrorResponseType = {
          code: config.ErrorCodes.USER_NOT_FOUND,
          message: 'User not found',
        };
        return reply.NotFound(errorResponse);
      }

      // Upload file
      const result = await this.mediaService.uploadImage(request);

      if (!result.success) {
        const errRes: ErrorResponseType = {
          message: result.message,
          code: result.code,
        };

        // Not found file
        if (result.code === config.ErrorCodes.FILE_NOT_FOUND) {
          return reply.NotFound(errRes);
        }

        // Errors: file size, file format, upload
        if (
          result.code === config.ErrorCodes.FILE_SIZE_EXCEEDS ||
          result.code === config.ErrorCodes.FORMAT_IS_NOT_SUPPORTED ||
          result.code === config.ErrorCodes.UPLOAD_FILE_ERROR
        ) {
          return reply.BadRequest(errRes);
        }
      }

      // Process
      await this.upSertUserAvatar(user, result.filePath);

      const uploadRes: UpLoadFileResType = {
        success: result.success,
        filePath: result.filePath,
      };

      const res: SuccessResponseType<UpLoadFileResType> = {
        code: 200,
        data: uploadRes,
      };

      return reply.OK(res);
    } catch (error) {
      return reply.InternalServer(error);
    }
  }

  private async upSertUserAvatar(user: any, filePath: string) {
    try {
      const newMedia: CreateMediaType = {
        url: filePath,
        description: `Avatar of ${user.email}`,
      };

      // Existing user's avatar
      if (user.mediaId) {
        const media = await this.mediaService.index(user.mediaId);

        // Delete file in disk
        await deleteFile(media.url);

        // Update media
        const updatedMedia = await this.mediaService.upsert({
          id: user.mediaId,
          ...newMedia,
        });

        // Link to user
        await this.userService.updateUserAvatar(user.id, updatedMedia.id);
        return;
      }

      const createdMedia = await this.mediaService.create(newMedia);

      // Link to user
      await this.userService.updateUserAvatar(user.id, createdMedia.id);
      return;
    } catch (error) {
      throw error;
    }
  }
}
