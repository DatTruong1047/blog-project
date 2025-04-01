import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

import { tokenOption, tokenPayload } from '@app/schemas/jwt.schemas';

export function generateToken(payload: tokenPayload, fastify: FastifyInstance, options: tokenOption) {
  try {
    const token = fastify.jwt.sign(payload, {
      ...options,
    });
    return token;
  } catch (error) {
    throw new Error(error);
  }
}
