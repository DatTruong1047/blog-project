import fastifyAuth from '@fastify/auth';
import cors from '@fastify/cors';
import fastifyJwt from '@fastify/jwt';
import swagger from '@fastify/swagger';
import swagger_ui from '@fastify/swagger-ui';
import Fastify from 'fastify';
import { FastifySchemaValidationError } from 'fastify/types/schema';
import { serializerCompiler, validatorCompiler, ZodTypeProvider } from 'fastify-type-provider-zod';

import * as config from './config';
import { verifyAdmin, verifyRefreshToken, verifyToken } from './plugins/auth.plugin';
import { checkEmailToken } from './plugins/email.plugin';
import prismaPlugin from './plugins/prisma.plugin';
import registerRoutes from './routes';
import { ErrorResponse } from './schemas/response.schemas';

// Init app
const app = Fastify({ logger: true });
app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);
app.withTypeProvider<ZodTypeProvider>();

// CROS
app.register(cors, {
  origin: ['*'],
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
app.decorate('verifyRefreshToken', verifyRefreshToken);
app.decorate('checkEmailToken', checkEmailToken);

// Custom response of error's validation
app.setErrorHandler((err, request, reply) => {
  if (err.code === 'FST_ERR_VALIDATION') {
    const validationErrors = err.validation as FastifySchemaValidationError[];
    const messages = validationErrors.map((error) => {
      const fieldName = error.instancePath.substring(1).replace(/\//g, '.');
      return `${fieldName} ${error.message}`;
    });

    const customErrorResponse: ErrorResponse = {
      code: config.ErrorCodes.VALIDATE_ERROR, // Hoặc một mã lỗi chung cho validation
      message: messages.join(', '), // Gộp các thông báo lỗi validation
    };

    return reply.status(400).send(customErrorResponse);
  }
});

// Register Routes
registerRoutes(app);

export default app;
