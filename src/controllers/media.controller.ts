import { FastifyRequest, FastifyReply } from 'fastify';

import { ErrorCodes, HOST, uploadFileConfig } from '@app/config';
import { binding } from '@app/decorator/binding.decorator';
import { FileType } from '@app/schemas/file.schemas';
import { CreateMediaType, DeleteMediaType, MediaType } from '@app/schemas/media.schemas';
import { ReqParamsType } from '@app/schemas/request.schema';
import { ErrorResponseType, SuccessResponseType, SuccessResWithoutDataType } from '@app/schemas/response.schemas';
import MediaService from '@app/services/media.service';
import { deleteFile, saveLocalFile } from '@app/utils/file.utils';

export default class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @binding
  async create(request: FastifyRequest, reply: FastifyReply) {
    try {
      const file: FileType = request.uploadedFile;

      // Save file
      const filePath = await saveLocalFile(file, uploadFileConfig.uploadPostDir, false, reply);

      const newMedia: CreateMediaType = {
        url: filePath,
        description: `Image ${file.filename}`,
      };

      const media: MediaType = await this.mediaService.create(newMedia);

      const res: SuccessResponseType<MediaType> = {
        code: 201,
        status: 'Success',
        data: {
          ...media,
          url: `${HOST}${filePath}`,
        },
      };

      reply.Created(res);
    } catch (error) {
      reply.InternalServer(error);
    }
  }

  @binding
  async show(request: FastifyRequest<{ Params: ReqParamsType }>, reply: FastifyReply) {
    try {
      const { id } = request.params;
      const media: MediaType = await this.mediaService.show(id);

      if (!media) {
        const errRes: ErrorResponseType = {
          code: ErrorCodes.FILE_NOT_FOUND,
          message: 'Media not found',
        };

        return reply.NotFound(errRes);
      }

      const res: SuccessResponseType<MediaType> = {
        code: 200,
        status: 'Success',
        data: {
          ...media,
          url: `${HOST}${media.url}`,
        },
      };
      return reply.OK(res);
    } catch (error) {
      reply.InternalServer(error);
    }
  }

  @binding
  async delete(request: FastifyRequest<{ Body: DeleteMediaType }>, reply: FastifyReply) {
    try {
      const { url } = request.body;
      const path = new URL(url).pathname;
      const index = path.indexOf('images/');
      const imagePath = index !== -1 ? path.slice(index) : null;

      if (!imagePath) {
        const errRes: ErrorResponseType = {
          code: ErrorCodes.FILE_PATH_INVALID,
          message: 'URL is invalid',
        };

        return reply.BadRequest(errRes);
      }
      const media = await this.mediaService.findByURL(imagePath);

      if (!media) {
        const errRes: ErrorResponseType = {
          code: ErrorCodes.FILE_NOT_FOUND,
          message: 'Media not found',
        };

        return reply.NotFound(errRes);
      }

      // Delete file in disk
      await deleteFile(media.url);

      // Delete
      await this.mediaService.delete(media.id);

      const res: SuccessResWithoutDataType = {
        code: 200,
        status: 'success',
      };

      return reply.OK(res);
    } catch (error) {
      reply.InternalServer(error);
    }
  }
}
