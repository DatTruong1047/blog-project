import { createWriteStream, mkdir } from 'fs';
import { extname, join } from 'path';
import { pipeline } from 'stream/promises';
import util from 'util';

import { uploadFileConfig, ErrorCodes } from '@config';
import { PrismaClient } from '@prisma/client';
import { FastifyRequest } from 'fastify';

import { CreateMediaType, UpdateMediaType } from '@app/schemas/media.schemas';
import { UpLoadFileType } from '@app/schemas/response.schemas';

const mkdirAsync = util.promisify(mkdir);

export default class MediaService {
  private readonly _prisma: PrismaClient;

  constructor() {
    this._prisma = new PrismaClient();
  }

  async index(id: string) {
    return this._prisma.media.findFirst({
      where: { id },
    });
  }

  async create(input: CreateMediaType) {
    return this._prisma.media.create({
      data: {
        url: input.url,
        description: input.description,
      },
    });
  }

  async edit(input: UpdateMediaType) {
    return this._prisma.media.update({
      where: { id: input.id },
      data: {
        url: input.url,
        description: input.description,
      },
    });
  }

  async delete(id: string) {
    return this._prisma.media.delete({
      where: { id },
    });
  }

  async upsert(input: CreateMediaType | UpdateMediaType) {
    try {
      if ('id' in input) {
        return this._prisma.media.upsert({
          where: { id: input.id },
          update: {
            url: input.url,
            description: input.description,
          },
          create: {
            url: input.url,
            description: input.description,
          },
        });
      } else {
        return this._prisma.media.create({
          data: {
            url: input.url,
            description: input.description,
          },
        });
      }
    } catch (error) {}
  }

  async uploadImage(request: FastifyRequest): Promise<UpLoadFileType> {
    try {
      // Check existing dir
      await mkdirAsync(uploadFileConfig.uploadUserDir, { recursive: true });

      const data = await request.file();

      if (!data) {
        return {
          success: false,
          code: ErrorCodes.FILE_NOT_FOUND,
          message: 'File not found',
        };
      }

      // Check file's size
      // - truncated: mean file too big
      if (data.file.truncated) {
        return {
          success: false,
          code: ErrorCodes.FILE_SIZE_EXCEEDS,
          message: `File size exceeds ${uploadFileConfig.limits.fileSize / (1024 * 1024)}MB`,
        };
      }

      // Check file format
      const fileExt = extname(data.filename).toLowerCase();

      if (!uploadFileConfig.allowedExtensions.includes(fileExt)) {
        return {
          success: false,
          code: ErrorCodes.FORMAT_IS_NOT_SUPPORTED,
          message: `File format is not supported. Only accepted: ${uploadFileConfig.allowedExtensions.join(', ')}`,
        };
      }

      // Create unique file's name
      const uniqueFileName = `${Date.now()}_${data.fieldname}${fileExt}`;
      const filePath = join(uploadFileConfig.uploadUserDir, uniqueFileName);

      // Save file
      const writeStream = createWriteStream(filePath);
      await pipeline(data.file, writeStream);

      return {
        success: true,
        code: 201,
        message: 'Save success',
        filePath: `/users/${uniqueFileName}`,
      };
    } catch (error) {
      console.error('Upload error:', error);

      return {
        success: false,
        code: ErrorCodes.UPLOAD_FILE_ERROR,
        message: 'Upload file error',
      };
    }
  }
}
