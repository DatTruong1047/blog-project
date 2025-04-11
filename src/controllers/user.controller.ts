import { FastifyReply, FastifyRequest } from 'fastify';

import * as config from '@app/config';
import { binding } from '@app/decorator/binding.decorator';
import { FileType } from '@app/schemas/file.schemas';
import { CreateMediaType } from '@app/schemas/media.schemas';
import { MyPostQueryType, PostListResponseType, UpdatePostType } from '@app/schemas/post.schemas';
import { ReqParamsType } from '@app/schemas/request.schema';
import {
  ErrorResponseType,
  SuccessResponseType,
  SuccessResWithoutDataType,
  UpLoadFileResType,
} from '@app/schemas/response.schemas';
import { ChangePasswordRequest, UpdateProfileRequest, UserProfileResponse } from '@app/schemas/user.schemas';
import CategoryService from '@app/services/category.service';
import MediaService from '@app/services/media.service';
import PostService from '@app/services/post.service';
import UserService from '@app/services/user.service';
import { deleteFile, saveLocalFile } from '@app/utils/file.utils';
import { comparePassword } from '@app/utils/hash.utils';

export default class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly mediaService: MediaService,
    private readonly postService: PostService,
    private readonly cateService: CategoryService
  ) {}

  @binding
  async show(request: FastifyRequest, reply: FastifyReply) {
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
  async showMyPost(request: FastifyRequest<{ Querystring: MyPostQueryType }>, reply: FastifyReply) {
    try {
      // ID in token
      const userEmail = request.decodeAccessToken.userEmail;
      const user = await this.userService.getUserProfileByEmail(userEmail);

      const { categoryId } = request.query;

      // Verify Cate
      if (categoryId) {
        const isExistingCate = await this.cateService.show(categoryId);

        if (!isExistingCate) {
          const errRes: ErrorResponseType = {
            message: 'Category is not existing',
            code: config.ErrorCodes.CATE_NOT_FOUND,
          };

          return reply.NotFound(errRes);
        }
      }

      if (!user) {
        const errorResponse: ErrorResponseType = {
          code: config.ErrorCodes.USER_NOT_FOUND,
          message: 'User not found',
        };
        return reply.NotFound(errorResponse);
      }
      const posts: PostListResponseType = await this.postService.getMyPosts(request.query, user.id);

      const res: SuccessResponseType<PostListResponseType> = {
        code: 200,
        data: posts,
      };

      return reply.OK(res);
    } catch (error) {
      return reply.InternalServer(error);
    }
  }

  @binding
  async edit(request: FastifyRequest<{ Body: UpdateProfileRequest }>, reply: FastifyReply) {
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

      await this.userService.updateProfile(userId, request.body);

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
  async editPost(request: FastifyRequest<{ Params: ReqParamsType; Body: UpdatePostType }>, reply: FastifyReply) {
    try {
      const decoded = request.decodeAccessToken;
      const postId = request.params.id;

      const existingCate = await this.cateService.show(request.body.categoryId);
      if (!existingCate) {
        const errRes: ErrorResponseType = {
          code: config.ErrorCodes.CATE_NOT_FOUND,
          message: 'Cate not found',
        };

        return reply.BadRequest(errRes);
      }

      const result = await this.postService.update(request.body, postId, decoded.userId);

      if (!result.success) {
        const errRes: ErrorResponseType = {
          code: result.code,
          message: result.message,
        };

        if (result.code === config.ErrorCodes.POST_NOT_FOUND) {
          return reply.NotFound(errRes);
        } else {
          return reply.BadRequest(errRes);
        }
      }

      const res: SuccessResWithoutDataType = {
        code: result.code,
        status: 'success',
      };

      return reply.OK(res);
    } catch (error) {
      return reply.InternalServer(error);
    }
  }

  @binding
  async deletePost(request: FastifyRequest<{ Params: ReqParamsType }>, reply: FastifyReply) {
    try {
      const decoded = request.decodeAccessToken;
      const postId = request.params.id;

      const result = await this.postService.delete(postId, decoded.userId);

      if (!result.success) {
        const errRes: ErrorResponseType = {
          code: result.code,
          message: result.message,
        };
        return reply.BadRequest(errRes);
      }

      const res: SuccessResWithoutDataType = {
        code: result.code,
        status: 'success',
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

      await this.userService.updatePassword(userId, request.body.password);

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
      const file: FileType = request.uploadedFile;

      // Save file
      const filePath = await saveLocalFile(file, config.uploadFileConfig.uploadUserDir, true, reply);

      await this.upSertUserAvatar(user, filePath);

      const uploadRes: UpLoadFileResType = {
        success: true,
        filePath: filePath,
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
        const media = await this.mediaService.show(user.mediaId);

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
