import { SwaggerOptions } from '@fastify/swagger';

export const swaggerConfig: SwaggerOptions = {
  openapi: {
    openapi: '3.0.0',
    info: {
      title: 'API Documentation',
      description: 'Fastify API with Swagger',
      version: '1.0.0',
    },
    servers: [
      {
        url: 'http://localhost:8080',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ BearerAuth: [] }],
    tags: [
      { name: 'Auth', description: 'Endpoints related to Authenticate' },
      { name: 'Category', description: 'Endpoints related to Categories' },
      { name: 'User', description: 'Endpoints related to Users' },
      { name: 'Post', description: 'Endpoints related to Posts' },
      { name: 'Test', description: 'Endpoint to test api' },
    ],
  },
};
