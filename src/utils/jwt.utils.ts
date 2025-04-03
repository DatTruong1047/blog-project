import { FastifyInstance } from 'fastify';

import { TokenOption, TokenPayload } from '@app/schemas/jwt.schemas';

export function generateToken(payload: TokenPayload, fastify: FastifyInstance, options: TokenOption) {
  try {
    const token = fastify.jwt.sign(payload, {
      ...options,
    });
    return token;
  } catch (error) {
    throw new Error(error);
  }
}
