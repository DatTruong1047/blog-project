import { FastifyInstance } from 'fastify';

import authRoutes from './authRoute';
import testRoute from './testRoute';

export default async function registerRoutes(app: FastifyInstance) {
  app.register(
    async (app) => {
      await app.register(testRoute);
      await app.register(authRoutes, { prefix: '/auth' });
    },
    { prefix: '/api' }
  );
}
