import path from 'path';

import fastifyAuth from '@fastify/auth';
import fastifyCors from '@fastify/cors';
import fastifyJwt from '@fastify/jwt';
import fastifyMultipar from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUI from '@fastify/swagger-ui';
import { FastifySchemaValidationError } from 'fastify/types/schema';

import app from './app';
import * as config from './config';
import authPlugin from './plugins/auth.plugin';
import emailPlugin from './plugins/email.plugin';
import replyPlugin from './plugins/reply.plugin';
import registerRoutes from './routes';
import { ErrorResponseType } from './schemas/response.schemas';

const PORT = config.PORT || 3000;
//const server = app;

const startServer = async () => {
  try {
    // Reply plugin
    app.register(replyPlugin);

    // CROS
    app.register(fastifyCors, {
      origin: ['*'],
      methods: ['GET', 'PUT', 'PATCH', 'POST', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    });

    // Swagger
    app.register(fastifySwagger, config.swaggerConfig);
    app.register(fastifySwaggerUI, {
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

    // Multipart
    app.register(fastifyMultipar, {
      limits: config.uploadFileConfig.limits,
      attachFieldsToBody: false,
    });

    // Static file
    app.register(fastifyStatic, {
      root: path.join(__dirname, '..', 'public', 'images'),
      prefix: '/images/',
    });

    // Auth plugin
    app.register(authPlugin);

    // Email plugin
    app.register(emailPlugin);

    // Custom response of error's validation
    app.setErrorHandler((err, request, reply) => {
      if (err.code === 'FST_ERR_VALIDATION') {
        const validationErrors = err.validation as FastifySchemaValidationError[];
        const messages = validationErrors.map((error) => {
          const fieldName = error.instancePath.substring(1).replace(/\//g, '.');
          return `${fieldName} ${error.message}`;
        });

        const customErrorResponse: ErrorResponseType = {
          code: config.ErrorCodes.VALIDATE_ERROR, // Hoặc một mã lỗi chung cho validation
          message: messages.join(', '), // Gộp các thông báo lỗi validation
        };

        return reply.status(400).send(customErrorResponse);
      }
    });

    // Register Routes
    registerRoutes();

    await app.listen({ port: PORT, host: '0.0.0.0' });

    console.log(`Server is running on http://0.0.0.0:${PORT}`);
    console.log(`Swagger UI available at http://localhost:${PORT}/docs`);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

startServer();
