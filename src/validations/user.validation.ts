import { format } from 'date-fns';
import { FastifyReply, FastifyRequest } from 'fastify';

import { UpdateProfileRequest } from '@app/schemas/user.schemas';

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
