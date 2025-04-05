import { FastifyReply, FastifyRequest } from 'fastify';

import { UpdateProfileRequest } from '@app/schemas/user.schemas';

export async function parseBirthDay(request: FastifyRequest<{ Body: UpdateProfileRequest }>, reply: FastifyReply) {
  if (request.body && request.body.birthDay) {
    try {
      request.body.birthDay = new Date(request.body.birthDay);
    } catch (error) {
      reply.status(400).send({ message: 'Invalid birthDay format' });
      throw new Error('Invalid birthDay format');
    }
  }
}
