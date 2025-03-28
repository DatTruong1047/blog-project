import { FastifyInstance } from 'fastify';

import testRoute from './testRoute';

export default async function registerRoutes(app: FastifyInstance) {
  app.register(
    async (app) => {
      await app.register(testRoute);
    },
    { prefix: '/api/' }
  );
}
