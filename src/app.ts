import fastifyAuth from '@fastify/auth';
import cors from '@fastify/cors';
import fastifyJwt from '@fastify/jwt';
import swagger from '@fastify/swagger';
import swagger_ui from '@fastify/swagger-ui';
import Fastify from 'fastify';
import { FastifySchemaValidationError } from 'fastify/types/schema';
import { serializerCompiler, validatorCompiler, ZodTypeProvider } from 'fastify-type-provider-zod';

import * as config from './config';
import authPlugin from './plugins/auth.plugin';
import emailPlugin from './plugins/email.plugin';
import prismaPlugin from './plugins/prisma.plugin';
import replyPlugin from './plugins/reply.plugin';
import registerRoutes from './routes';
import { Response } from './schemas/response.schemas';

// Init app
function app() {
  const app = Fastify({ logger: true });
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);
  app.withTypeProvider<ZodTypeProvider>();

  return app;
}

export default app();
