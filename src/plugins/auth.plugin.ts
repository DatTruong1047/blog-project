import { FastifyRequest, FastifyReply } from 'fastify';

import { tokenPayload } from '@app/schemas/jwt.schemas';

export async function verifyToken(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify();
  } catch (error) {
    reply.status(401).send('Unauthorized');
  }
}

export async function verifyAdmin(request: FastifyRequest, reply: FastifyReply) {
  try {
    const payload: tokenPayload = await request.jwtDecode();
    if (payload && payload.isAdmin === true) {
      return;
    } else {
      reply.status(403).send('You dont have permission');
    }
  } catch (error) {
    reply.status(401).send({ message: 'Unauthorized' });
  }
}
