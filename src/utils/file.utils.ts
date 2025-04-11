import { createWriteStream, mkdir } from 'fs';
import fs from 'fs/promises';
import path, { extname, join } from 'path';
import util from 'util';

import { FastifyReply, FastifyRequest } from 'fastify';

import { ErrorCodes, uploadFileConfig } from '@app/config';
import { FileType } from '@app/schemas/file.schemas';
import { ErrorResponseType } from '@app/schemas/response.schemas';

const mkdirAsync = util.promisify(mkdir);

// Get file from request
export async function getFile(request: FastifyRequest, reply: FastifyReply) {
  try {
    const part = await request.file();
    // No files provided
    if (!(part.file || part.filename)) {
      const errRes: ErrorResponseType = {
        message: 'No files provided',
        code: ErrorCodes.FILE_NOT_FOUND,
      };
      return reply.BadRequest(errRes);
    }

    const chunks: Buffer[] = [];

    for await (const chunk of part.file) {
      chunks.push(chunk);
    }
    const file = {
      filename: part.filename ?? 'unknown',
      buffer: Buffer.concat(chunks),
    };

    // Validate file
    const validationError = validateFile(file);
    if (validationError) {
      const errRes: ErrorResponseType = {
        message: validationError.message,
        code: validationError.code,
      };
      return reply.BadRequest(errRes);
    }

    request.uploadedFile = {
      filename: part.filename ?? 'unknown',
      buffer: Buffer.concat(chunks),
    };
  } catch (error) {
    return reply.InternalServer(error);
  }
}

// Delete static file
export async function deleteFile(fileName: string) {
  try {
    // const part = url.split('images/');
    // const fileName = part[1];
    const filePath = path.join('./public/', fileName);
    console.log(filePath);

    await fs.unlink(filePath);
    return;
  } catch (error) {
    throw error;
  }
}

export async function saveLocalFile(file: FileType, uploadDir: string, isAvatar: boolean, reply: FastifyReply) {
  try {
    await mkdirAsync(uploadDir, { recursive: true });

    const uniqueFileName = `${Date.now()}_${file.filename}`;
    const fullPath = join(uploadDir, uniqueFileName);

    const writeStream = createWriteStream(fullPath);
    writeStream.write(file.buffer);
    writeStream.end();

    return isAvatar ? `images/users/${uniqueFileName}` : `images/posts/${uniqueFileName}`;
  } catch (error) {
    return reply.InternalServer(error);
  }
}

function validateFile(file: FileType) {
  const fileExt = extname(file.filename).toLowerCase();

  // Check file ext
  if (!uploadFileConfig.allowedExtensions.includes(fileExt)) {
    return {
      success: false,
      code: ErrorCodes.FORMAT_IS_NOT_SUPPORTED,
      message: `File format is not supported. Only accepted: ${uploadFileConfig.allowedExtensions.join(', ')}`,
    };
  }

  // Check file size
  if (file.buffer.length > uploadFileConfig.limits.fieldSize) {
    return {
      success: false,
      code: ErrorCodes.FILE_SIZE_EXCEEDS,
      message: `File size exceeds ${uploadFileConfig.limits.fileSize / (1024 * 1024)}MB`,
    };
  }

  return null; // valid
}
