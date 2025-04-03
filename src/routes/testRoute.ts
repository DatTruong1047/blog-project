import { FastifyInstance } from 'fastify';

export default async function testRoute(fastify: FastifyInstance) {
  fastify.get(
    '/test',
    {
      schema: {
        tags: ['Test'],
        summary: 'This API to test server with authentication',
        response: {
          200: {
            description: 'Successful',
            type: 'object',
            properties: {
              message: { type: 'string' },
            },
          },
        },
      },
      onRequest: [fastify.verifyToken],
    },
    async () => {
      return { message: 'Successful' };
    }
  );
}
