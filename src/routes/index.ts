import app from '@app/app';

import authRoutes from './auth.route';
import testRoute from './test.route';
import userRoutes from './user.route';

export default async function registerRoutes() {
  app.register(
    async () => {
      await app.register(testRoute);
      await app.register(authRoutes, { prefix: '/auth' });
      await app.register(userRoutes, { prefix: '/user' });
    },
    { prefix: '/api' }
  );
}
