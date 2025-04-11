import app from '@app/app';

import authRoutes from './auth.route';
import { cateRoutesForAll, cateRoutesForAdmin } from './category.route';
import { mediaRoutes } from './media.route';
import { postRoutes } from './post.route';
import testRoute from './test.route';
import userRoutes from './user.route';

export default async function registerRoutes() {
  app.register(
    async () => {
      await app.register(testRoute);
      await app.register(authRoutes, { prefix: '/auth' });
      await app.register(userRoutes, { prefix: '/users' });
      await app.register(cateRoutesForAll, { prefix: '/categories' });
      await app.register(postRoutes, { prefix: '/posts' });
      await app.register(mediaRoutes, { prefix: '/media' });
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
