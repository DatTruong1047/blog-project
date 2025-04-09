import app from '@app/app';

import authRoutes from './auth.route';
import { cateRoutesForAll, cateRoutesForAdmin } from './category.route';
import testRoute from './test.route';
import userRoutes from './user.route';

export default async function registerRoutes() {
  app.register(
    async () => {
      await app.register(testRoute);
      await app.register(authRoutes, { prefix: '/auth' });
      await app.register(userRoutes, { prefix: '/users' });
      await app.register(cateRoutesForAll, { prefix: '/categories' });
    },
    { prefix: '/api' }
  );

  app.register(
    async () => {
      await app.register(cateRoutesForAdmin, { prefix: '/categories' });
    },
    { prefix: '/admin/api' }
  );
}
