import { FastifyInstance } from 'fastify';

import authRoutes from './auth.route';
import testRoute from './test.route';

export default async function registerRoutes(app: FastifyInstance) {
  app.register(
    async (app) => {
      await app.register(testRoute);
      await app.register(authRoutes, { prefix: '/auth' });
    },
    { prefix: '/api' }
  );
}
