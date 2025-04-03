import fastifyAuth from '@fastify/auth';
import cookie from '@fastify/cookie';
import cors from '@fastify/cors';
import fastifyJwt from '@fastify/jwt';
import swagger from '@fastify/swagger';
import swagger_ui from '@fastify/swagger-ui';
import Fastify from 'fastify';

import * as config from './config';
import { verifyAdmin, verifyToken } from './plugins/auth.plugin';
import prismaPlugin from './plugins/prisma.plugin';
import registerRoutes from './routes';

declare module 'fastify' {
  interface FastifyInstance {
    verifyToken: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    verifyAdmin: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

// Init app
const app = Fastify({ logger: true });

// Cookie
app.register(cookie, {
  secret: config.COOKIE_SECRET_KEY,
  hook: 'onRequest',
  parseOptions: {},
});

// CROS
app.register(cors, {
  origin: ['http://localhost:3000'],
});

// Prisma
app.register(prismaPlugin);

// Swagger
app.register(swagger, config.swaggerConfig);
app.register(swagger_ui, {
  routePrefix: '/api/docs',
  uiConfig: {
    docExpansion: 'full',
    deepLinking: false,
  },
});

// JWT
app.register(fastifyJwt, {
  secret: config.SECRET_KEY,
});

// Auth
app.register(fastifyAuth);
app.decorate('verifyToken', verifyToken);
app.decorate('verifyAdmin', verifyAdmin);

// Register Routes
registerRoutes(app);

export default app;
