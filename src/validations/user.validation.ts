import { format } from 'date-fns';
import { FastifyReply, FastifyRequest } from 'fastify';

import { UpdateProfileRequest } from '@app/schemas/user.schemas';
import { parseMultipartForm } from '@app/utils/file.utils';

export async function parseBirthDay(request: FastifyRequest<{ Body: UpdateProfileRequest }>, reply: FastifyReply) {
  if (request.body && request.body.birthDay) {
    try {
      const date = new Date(request.body.birthDay);
      if (isNaN(date.getTime())) {
        // Check for invalid date
        reply.status(400).send({ message: 'Invalid birthDay format' });
        throw new Error('Invalid birthDay format');
      }
      request.body.birthDay = format(date, 'yyyy-MM-dd'); // Format the date
    } catch (error) {
      reply.status(400).send({ message: 'Invalid birthDay format' });
      throw new Error('Invalid birthDay format');
    }
  }
}

export async function getFile(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { files } = await parseMultipartForm(request);

    request.uploadedFiles = files;
  } catch (error) {
    return reply.InternalServer(error);
  }
}
