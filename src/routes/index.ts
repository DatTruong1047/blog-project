import app from '@app/app';

import authRoutes from './auth.route';
import testRoute from './test.route';

export default async function registerRoutes() {
  app.register(
    async () => {
      await app.register(testRoute);
      await app.register(authRoutes, { prefix: '/auth' });
    },
    { prefix: '/api' }
  );
}
